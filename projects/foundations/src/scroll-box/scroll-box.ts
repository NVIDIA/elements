// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import { attachInternals } from '@nvidia-elements/foundations/internal/a11y';
import styles from './scroll-box.css?inline';

/**
 * @element nve-scroll-box
 * @description A scrollable container for arbitrary content with optional edge shadows and native scrolling APIs.
 * @documentation https://nvidia.github.io/elements/docs/foundations/scroll-box/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/foundations/scroll-box
 * @slot - Content to scroll. Use light DOM elements to arrange the content.
 * @cssprop --scrollbar-color - Native scrollbar thumb and track colors.
 * @cssprop --scrollbar-width - Native scrollbar width. Set to none to hide scrollbars.
 * @cssprop --shadow-color - Optional edge tint. Transparent uses the theme shadow.
 * @cssprop --shadow-size - Size of the edge shadows.
 */
export class ScrollBox extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scroll-box',
    version: '0.0.0'
  };

  static get observedAttributes() {
    return [...super.observedAttributes, 'tabindex'];
  }

  /** Determines which axes allow user scrolling. */
  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' | 'both' = 'both';

  /** Shows shadows at edges where more content is available. */
  @property({ type: Boolean, reflect: true, attribute: 'scroll-shadow' }) scrollShadow = false;

  /**
   * Controls vertical scrolling to the bottom. Follow pauses while scrolled away; always returns on content growth or viewport resizing.
   * Overflow changes from CSS animations inside a fixed-size child do not trigger measurements.
   */
  @property({ type: String, attribute: 'auto-scroll' }) autoScroll: 'off' | 'follow' | 'always' = 'off';

  #resizeObserver?: ResizeObserver;
  #mutationObserver?: MutationObserver;
  #frame?: number;
  #authorTabIndex = false;
  #settingTabIndex = false;
  #scrollEnd?: number;
  #scrollPosition = 0;
  #following = true;
  #autoScrolling = false;

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host class="content"><slot @slotchange=${this.#scheduleMeasure}></slot></div>
      ${
        this.scrollShadow
          ? html`
        <div class="shadow-layer" aria-hidden="true" hidden>
          <div class="shadows">
            <div class="edge top"></div>
            <div class="edge right"></div>
            <div class="edge bottom"></div>
            <div class="edge left"></div>
          </div>
        </div>
      `
          : nothing
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'region';
    if (this.hasUpdated) this.#observe();
  }

  firstUpdated() {
    this.#observe();
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('autoScroll')) {
      if (this.#autoScrolling) this.scrollTo({ top: this.scrollTop, behavior: 'instant' });
      this.#scrollEnd = undefined;
      this.#following = true;
      this.#autoScrolling = false;
    }
    this.#syncFollowingState();
    this.#scheduleMeasure();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#resizeObserver?.disconnect();
    this.#mutationObserver?.disconnect();
    this.removeEventListener('load', this.#scheduleMeasure, true);
    this.removeEventListener('scroll', this.#onScroll);
    this.removeEventListener('scrollend', this.#onScrollEnd);
    this.ownerDocument.fonts.removeEventListener('loadingdone', this.#scheduleMeasure);
    if (this.#frame !== undefined) cancelAnimationFrame(this.#frame);
    this.#frame = undefined;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'tabindex' && !this.#settingTabIndex) {
      this.#authorTabIndex = newValue !== null;
      this.#scheduleMeasure();
    }
  }

  #observe() {
    if (!this.isConnected) return;
    // Detaching resets native scroll coordinates. Restore an active follower.
    if (this.#following) this.#scrollEnd = undefined;
    this.#resizeObserver = new ResizeObserver(this.#onResize);
    this.#resizeObserver.observe(this);
    const content = this.renderRoot.querySelector('[internal-host]');
    if (content) this.#resizeObserver.observe(content);
    this.#mutationObserver = new MutationObserver(this.#scheduleMeasure);
    this.#mutationObserver.observe(this, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
    this.addEventListener('load', this.#scheduleMeasure, true);
    this.addEventListener('scroll', this.#onScroll);
    this.addEventListener('scrollend', this.#onScrollEnd);
    this.ownerDocument.fonts.addEventListener('loadingdone', this.#scheduleMeasure);
    this.#scheduleMeasure();
  }

  #scheduleMeasure = () => {
    if (!this.isConnected || !this.hasUpdated || this.#frame !== undefined) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = undefined;
      this.#measure();
    });
  };

  #measure() {
    const layer = this.renderRoot.querySelector<HTMLElement>('.shadow-layer');
    // Exclude the decorative layer so content can shrink after a previous overflow.
    if (layer) layer.hidden = true;
    this.#syncTabIndex();
    this.#syncAutoScroll();

    const shadows = layer?.querySelector<HTMLElement>('.shadows');
    if (!layer || !shadows) return;
    this.#sizeShadows(layer, shadows);
  }

  #onScroll = () => {
    if (this.clientHeight === 0) return;
    // Upward movement interrupts our own smooth scrolling too.
    if (this.scrollTop < this.#scrollPosition - 1) this.#autoScrolling = false;
    if (!this.#autoScrolling) {
      const end = Math.min(this.#scrollEnd ?? 0, this.scrollHeight - this.clientHeight);
      this.#following = this.scrollTop >= end - 1;
    }
    this.#scrollPosition = this.scrollTop;
    this.#syncFollowingState();
  };

  #onScrollEnd = () => {
    this.#autoScrolling = false;
    this.#onScroll();
  };

  #onResize = () => {
    // Always also applies when resizing leaves the bottom coordinate unchanged.
    if (this.autoScroll === 'always') this.#scrollEnd = undefined;
    this.#scheduleMeasure();
  };

  #syncFollowingState() {
    const following =
      this.#following &&
      this.orientation !== 'horizontal' &&
      (this.autoScroll === 'follow' || this.autoScroll === 'always');
    if (following) this._internals.states.add('following');
    else this._internals.states.delete('following');
  }

  #syncAutoScroll() {
    if (!['follow', 'always'].includes(this.autoScroll)) return;
    if (this.orientation === 'horizontal' || this.clientHeight === 0 || this.clientWidth === 0) return;

    const end = Math.max(0, this.scrollHeight - this.clientHeight);
    // A scroll can precede its event. Compare against the previous layout so
    // content growth does not look like the user scrolling away from the bottom.
    this.#onScroll();
    if (this.#scrollEnd === end) return;
    const scroll = this.#scrollEnd === undefined || this.autoScroll === 'always' || this.#following;
    this.#scrollEnd = end;

    if (scroll && Math.abs(end - this.scrollTop) > 1) {
      this.#autoScrolling = true;
      this.#following = true;
      this.scrollTo({ top: end, behavior: 'auto' });
    }
    this.#onScroll();
  }

  #sizeShadows(layer: HTMLElement, shadows: HTMLElement) {
    const { clientWidth, clientHeight, scrollWidth, scrollHeight } = this;
    const style = getComputedStyle(this);
    layer.style.width = `${scrollWidth}px`;
    layer.style.height = `${scrollHeight}px`;
    shadows.style.width = `${clientWidth}px`;
    shadows.style.height = `${clientHeight}px`;
    // Guard disabled axes because scroll-state queries can include hidden overflow.
    shadows.style.setProperty('--_shadow-x', ['auto', 'scroll'].includes(style.overflowX) ? '1' : '0');
    shadows.style.setProperty('--_shadow-y', ['auto', 'scroll'].includes(style.overflowY) ? '1' : '0');
    // Sticky offsets start inside the scrollport's padding.
    shadows.style.inset = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
      .map(value => `${-parseFloat(value)}px`)
      .join(' ');
    layer.hidden = clientWidth === 0 || clientHeight === 0;
  }

  #syncTabIndex() {
    if (this.#authorTabIndex) return;
    const { clientWidth, clientHeight, scrollWidth, scrollHeight } = this;
    const style = getComputedStyle(this);
    const horizontal = ['auto', 'scroll'].includes(style.overflowX) && scrollWidth > clientWidth;
    const vertical = ['auto', 'scroll'].includes(style.overflowY) && scrollHeight > clientHeight;

    const value = clientWidth > 0 && clientHeight > 0 && (horizontal || vertical) ? '0' : null;
    if (this.getAttribute('tabindex') === value) return;
    this.#settingTabIndex = true;
    try {
      if (value === null) this.removeAttribute('tabindex');
      else this.setAttribute('tabindex', value);
    } finally {
      this.#settingTabIndex = false;
    }
  }
}
