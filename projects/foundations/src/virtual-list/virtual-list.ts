// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import { diagnostic } from '../internal/utils/diagnostic.js';
import styles from './virtual-list.css?inline';

/** An immutable requested render window, including buffered items. */
export interface VirtualRange {
  readonly start: number;
  readonly end: number;
  readonly count: number;
}

/** Vertical position and direction since the previous scroll notification. */
export interface VirtualScroll {
  readonly scrollTop: number;
  readonly direction: 'up' | 'down';
}

const maximumExtent = 16_000_000;

/**
 * @element nve-virtual-list
 * @description Fixed-height virtualization with native vertical host scrolling. Consumers own data, templates, and selection: render each `virtual-change` request by replacing or reordering items in the default slot. Native slot changes position the rendered window automatically. Consumers own item navigation and can override `tabindex`. For horizontal scrolling, size the list to its content width and wrap it in a horizontal scroll container.
 * Missing, empty, or invalid required geometry hides content and exposes an empty range. Development diagnostics identify invalid configurations; valid values restore rendering. Variable heights, row groups, detail panels, segmented scrolling, and column virtualization aren't supported.
 * @documentation https://nvidia.github.io/elements/docs/foundations/virtual-list/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/foundations/virtual-list
 * @slot - Elements for the requested `[start, end)` range. Replace or reorder assigned elements for a new window; reusing the same elements with only content or property updates cannot signal a new window. Content stays hidden while a different window awaits changed assignments. Asynchronous consumers must discard obsolete work before changing DOM. In grids, render direct `nve-grid-row` children and supply logical `aria-rowindex` values and total `aria-rowcount`. The wrapper adds no list or region role, and the spacer stays outside the accessibility tree.
 * @cssprop --scroll-height - Viewport height; default `auto`. Supply a bounded height for virtualization. A zero-height viewport requests `[0, 0)` and recovers when measurable.
 * @cssprop --width - Container width. Defaults to 100%.
 * @cssprop --item-height - Output containing valid `itemHeight` in pixels. Slotted items use this fixed height automatically; custom item templates can also use it for their internal layout.
 * @event virtual-change - Requests `[start, end)` through immutable `detail: { start, end, count }`. `count` is the total dataset size. Range properties update before dispatch. Fires initially for valid geometry, including an empty dataset, then only when `(start, end, count)` changes. Slot changes don't request another range. Bubbles across shadow boundaries.
 * @event virtual-scroll - Reports `detail: { scrollTop, direction }` when vertical position changes. Direction is `up` or `down` relative to the previous notification. Coalesces updates per animation frame, including programmatic scrolling; unchanged positions emit no event. Bubbles across shadow boundaries. Native `scroll` and `scrollend` remain available on the host.
 * @command --scroll-to-index - Scroll to the integer index in the source button's `value`, using `scrollToIndex()`. Missing, empty, fractional, or invalid numeric values have no effect.
 * @stable false
 */
export class VirtualList extends LitElement {
  static styles = useStyles([styles]);
  static readonly metadata = { tag: 'nve-virtual-list', version: '0.0.0' };

  /**
   * Required total number of items: a nonnegative safe integer. Total height (`itemCount * itemHeight`) cannot exceed 16,000,000 CSS pixels.
   * Supports property assignments before the first update. For deliberate imperative configuration without attributes, narrowly suppress `@nvidia-elements/lint/no-invalid-virtual-list` and explain the assignments; don't use invalid placeholder attributes.
   */
  @property({ type: Number, attribute: 'item-count' }) itemCount: number;

  /**
   * Required finite item height greater than zero, in CSS pixels. The viewport sizes slotted items to exactly this height, including borders, and clips overflow.
   * Keep custom item internals within this height and avoid gaps between items.
   */
  @property({ type: Number, attribute: 'item-height' }) itemHeight: number;

  /** Extra items on each side of the viewport. Must be a nonnegative safe integer; invalid values produce a diagnostic and use the default of 2. */
  @property({ type: Number, attribute: 'item-buffer' }) itemBuffer = 2;

  #range?: VirtualRange;
  #rendered?: VirtualRange;
  #assigned?: Element[];
  #scrollTop = 0;
  #valid = false;
  #diagnostics = new Set<string>();
  #observer?: ResizeObserver;
  #frame?: number;

  /** Read-only inclusive requested start index; initially 0. */
  get start(): number {
    return this.#range?.start ?? 0;
  }
  /** Read-only exclusive requested end index; initially 0. The requested item count is `end - start`. */
  get end(): number {
    return this.#range?.end ?? 0;
  }
  /** Current immutable `virtual-change` request. Attach the listener before initialization, or read this property after attaching it and render once. Recheck identity before an asynchronous DOM update to discard obsolete work. Undefined for invalid geometry. */
  get range(): VirtualRange | undefined {
    return this.#range;
  }
  render() {
    return html`
      <div internal-host class="spacer" aria-hidden="true" hidden></div>
      <div class="content" hidden><slot @slotchange=${this.#onSlotChange}></slot></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
    if (this.hasUpdated) this.#observe();
  }

  firstUpdated() {
    this.#observe();
  }
  updated() {
    this.refresh();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.removeEventListener('scroll', this.#schedule);
    this.removeEventListener('command', this.#onCommand);
    if (this.#frame !== undefined) cancelAnimationFrame(this.#frame);
    this.#frame = undefined;
  }

  #observe() {
    if (!this.isConnected || this.#observer) return;
    this.#observer = new ResizeObserver(this.#schedule);
    this.#observer.observe(this);
    this.#scrollTop = this.scrollTop;
    this.addEventListener('scroll', this.#schedule, { passive: true });
    this.addEventListener('command', this.#onCommand);
    this.refresh();
  }

  #schedule = () => {
    if (this.#frame !== undefined || !this.isConnected) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = undefined;
      this.refresh();
      const scrollTop = this.scrollTop;
      if (scrollTop === this.#scrollTop) return;
      const detail: VirtualScroll = { scrollTop, direction: scrollTop > this.#scrollTop ? 'down' : 'up' };
      this.#scrollTop = scrollTop;
      this.dispatchEvent(new CustomEvent('virtual-scroll', { detail, bubbles: true, composed: true }));
    });
  };

  #warn(message: string) {
    if (this.#diagnostics.has(message)) return;
    this.#diagnostics.add(message);
    diagnostic(`nve-virtual-list: ${message}`, this);
  }

  /** Recalculate geometry and range from the current viewport and scroll position. Scrolling, resizing, and valid configuration changes refresh automatically. Emits no event when `(start, end, count)` stays unchanged. */
  refresh(): void {
    if (!this.hasUpdated || !this.isConnected) return;
    if (!this.#configure()) return;
    const count = this.itemCount;
    const height = this.itemHeight;
    const total = count * height;
    const buffer = this.#buffer;
    const viewport = this.clientHeight;
    const top = Math.max(0, Math.min(this.scrollTop, Math.max(0, total - viewport)));
    if (top !== this.scrollTop) this.scrollTo({ top, behavior: 'instant' });
    const start = count && viewport ? Math.max(0, Math.floor(top / height) - buffer) : 0;
    const end = count && viewport ? Math.min(count, Math.ceil((top + viewport) / height) + buffer) : 0;
    this.#request(start, end, count);
    this.#syncContent();
  }

  #request(start: number, end: number, count: number) {
    if (this.#range && start === this.start && end === this.end && count === this.#range.count) return;
    const initial = this.#assigned === undefined;
    const assigned = this.renderRoot.querySelector('slot')!.assignedElements();
    this.#syncAssignment(assigned);
    this.#range = Object.freeze({ start, end, count });
    const rendered = initial
      ? start === 0 && assigned.length > 0
      : this.#rendered?.start === start && this.#rendered.end === end;
    if (rendered) this.#rendered = this.#range;
    this.dispatchEvent(new CustomEvent('virtual-change', { detail: this.#range, bubbles: true, composed: true }));
  }

  #syncAssignment(assigned: Element[]) {
    if (
      assigned.length === this.#assigned?.length &&
      assigned.every((item, index) => item === this.#assigned?.[index])
    ) {
      return false;
    }
    this.#assigned = assigned;
    this.#rendered = undefined;
    return true;
  }

  #onSlotChange = () => {
    if (!this.isConnected || !this.#valid || !this.#range) return;
    const assigned = this.renderRoot.querySelector('slot')!.assignedElements();
    // A queued slot event can predate the latest request. Require a new assignment.
    if (!this.#syncAssignment(assigned)) return;
    this.#rendered = this.#range;
    this.#syncContent();
  };

  get #buffer() {
    if (Number.isSafeInteger(this.itemBuffer) && this.itemBuffer >= 0) return this.itemBuffer;
    this.#warn(`invalid item-buffer (${this.itemBuffer}); using 2`);
    return 2;
  }

  #configure() {
    const count = this.itemCount;
    const height = this.itemHeight;
    const total = count * height;
    this.#valid =
      Number.isSafeInteger(count) &&
      count >= 0 &&
      Number.isFinite(height) &&
      height > 0 &&
      Number.isFinite(total) &&
      total <= maximumExtent;
    this.renderRoot.querySelector<HTMLElement>('.spacer')!.hidden = !this.#valid;
    if (!this.#valid) {
      this.#invalidate();
      return false;
    }
    this.style.setProperty('--item-height', `${height}px`);
    this.renderRoot.querySelector<HTMLElement>('.spacer')!.style.height = `${total}px`;
    return true;
  }

  #invalidate() {
    this.#warn(
      `invalid item-count (${this.itemCount}) or item-height (${this.itemHeight}); total height must not exceed ${maximumExtent}px`
    );
    this.#range = undefined;
    this.style.removeProperty('--item-height');
    this.#syncContent();
  }

  #syncContent() {
    const content = this.renderRoot.querySelector<HTMLElement>('.content')!;
    content.hidden = !this.#valid || this.#rendered !== this.#range || this.start === this.end;
    content.style.top = `${(this.#rendered?.start ?? 0) * this.itemHeight || 0}px`;
  }

  /**
   * Scroll the nearest edge of an integer index into view. Clamp finite integer indices to dataset bounds; ignore fractional indices, `NaN`, infinity, and empty datasets.
   * Items taller than the viewport align to their start. The default is immediate and interrupts smooth scrolling, even when CSS sets `scroll-behavior: smooth`. Pass an explicit `ScrollBehavior` to override it.
   */
  scrollToIndex(index: number, behavior: ScrollBehavior = 'instant'): void {
    this.refresh();
    if (!this.#valid || !this.itemCount || !Number.isInteger(index) || !Number.isFinite(index)) return;
    const start = Math.max(0, Math.min(this.itemCount - 1, index)) * this.itemHeight;
    const end = start + this.itemHeight;
    const top =
      this.itemHeight > this.clientHeight || start < this.scrollTop
        ? start
        : end > this.scrollTop + this.clientHeight
          ? end - this.clientHeight
          : this.scrollTop;
    this.scrollTo({ top, behavior });
    this.#schedule();
  }

  #onCommand = (event: Event) => {
    if (!(event instanceof CommandEvent)) return;
    if (event.command !== '--scroll-to-index' || event.target !== this) return;
    const source = event.source;
    if (!source || !('value' in source) || typeof source.value !== 'string' || !source.value.trim()) return;
    this.scrollToIndex(Number(source.value));
  };
}
