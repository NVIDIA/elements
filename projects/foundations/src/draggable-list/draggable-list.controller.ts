// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import { I18nService } from '../internal/i18n/index.js';

export interface DraggableSourceDetail {
  readonly source: HTMLElement;
  readonly sourceContainer: HTMLElement;
  /** Zero-based rendered item index at pickup, excluding dropzones. */
  readonly sourceIndex: number;
  readonly interaction: 'pointer' | 'keyboard';
}

export interface DraggableDropDetail extends DraggableSourceDetail {
  readonly target: HTMLElement;
  readonly targetContainer: HTMLElement;
  /** Zero-based insertion index in the destination after removing the source. */
  readonly targetIndex: number;
  readonly placement: 'before' | 'after' | 'append';
}

export interface DraggableEndDetail extends DraggableSourceDetail {
  /** A drop request fired; this does not imply the application accepted it. */
  readonly dropped: boolean;
}

export interface DraggableListControllerConfig {
  readonly items: Iterable<HTMLElement>;
  readonly dropZones?: Iterable<HTMLElement>;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly disabled?: boolean;
  /** Require an explicit `nve-draggable="handle"` control for pickup. */
  readonly handlesOnly?: boolean;
  /** Defaults to accepting sources from other instances of this controller. */
  readonly accepts?: (source: HTMLElement, sourceContainer: HTMLElement) => boolean;
  /** Render messages in a polite live status region owned by the host. */
  readonly announce?: (message: string) => void;
}

interface PlacementTarget {
  target: HTMLElement;
  placement: DraggableDropDetail['placement'];
  keyboardTarget?: HTMLElement;
}

interface Placement extends PlacementTarget {
  controller: DraggableListController;
  indicator: { target: HTMLElement; placement: DraggableDropDetail['placement']; direction?: 'ltr' | 'rtl' };
  index: number;
  items: HTMLElement[];
}

interface Session {
  mode: 'native' | 'placement';
  owner: DraggableListController;
  detail: DraggableSourceDetail;
  items: HTMLElement[];
  control: HTMLElement;
  pressed?: boolean;
  ariaPressed: string | null;
  candidate?: Placement;
  abort: AbortController;
}

const sessions = new WeakMap<Document, Session>();
const controllers = new WeakMap<HTMLElement, Set<DraggableListController>>();
const handleSelector = '[nve-draggable~="handle"]';
const interactive =
  'a[href],button,input,select,textarea,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="checkbox"],[role="combobox"],[role="textbox"]';

function unavailable(element: HTMLElement): boolean {
  return (
    !!element.closest('[hidden],[inert]') ||
    element.matches('[disabled],[readonly],[aria-disabled="true"]') ||
    ('disabled' in element && element.disabled === true) ||
    ('readOnly' in element && element.readOnly === true)
  );
}

function visible(element: HTMLElement): boolean {
  return (
    element.isConnected && !element.closest('[hidden],[inert]') && element.checkVisibility({ visibilityProperty: true })
  );
}

function sameItems(a: readonly HTMLElement[], b: readonly HTMLElement[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function descendantShadowRoots(ancestor: HTMLElement, descendant: HTMLElement): ShadowRoot[] | undefined {
  const roots: ShadowRoot[] = [];
  let node: Node = descendant;
  while (!ancestor.contains(node)) {
    const root = node.getRootNode();
    if (!(root instanceof ShadowRoot)) return;
    roots.push(root);
    node = root.host;
  }
  return roots;
}

function hasHandle(root: HTMLElement | ShadowRoot): boolean {
  if (root.querySelector(handleSelector)) return true;
  if (root instanceof HTMLElement && root.shadowRoot && hasHandle(root.shadowRoot)) return true;
  return Array.from(root.querySelectorAll('*')).some(element => element.shadowRoot && hasHandle(element.shadowRoot));
}

function marker(element: HTMLElement, value: string, present: boolean) {
  const values = new Set(element.getAttribute('nve-draggable')?.split(/\s+/).filter(Boolean));
  if (present) values.add(value);
  else values.delete(value);
  if (values.size) element.setAttribute('nve-draggable', [...values].join(' '));
  else element.removeAttribute('nve-draggable');
}

function getIndicator(
  { items, target, placement }: Pick<Placement, 'items' | 'target' | 'placement'>,
  source: HTMLElement
): Placement['indicator'] {
  // Both sides of an insertion position draw on the leading edge of the next item.
  const next = placement === 'after' ? items[items.indexOf(target) + 1] : undefined;
  return next && next !== source && visible(next) ? { target: next, placement: 'before' } : { target, placement };
}

function markIndicator({ target, placement, direction }: Placement['indicator'], present: boolean) {
  marker(target, 'target', present);
  marker(target, placement, present);
  if (direction) marker(target, direction, present);
}

/** Shared native drag and pick–choose–drop behavior. The application owns item order and data. */
export class DraggableListController implements ReactiveController {
  #abort?: AbortController;
  #observer?: MutationObserver;
  #managed = new Set<HTMLElement>();
  #activationKey?: string;

  constructor(
    readonly host: ReactiveElement,
    private readonly getConfig: () => DraggableListControllerConfig
  ) {
    host.addController(this);
    I18nService.registerDefaults({
      dragPickedUp:
        'Picked up {label}. Use arrow keys to choose a position, Tab to another list, Enter or Space to drop, or Escape to cancel.',
      dragPosition: '{label}: position {position} of {count}.',
      dragDropped: 'Move requested for {label}.',
      dragCanceled: 'Move canceled for {label}.'
    });
  }

  get #items() {
    return Array.from(this.getConfig().items);
  }
  get #dropZones() {
    return Array.from(this.getConfig().dropZones ?? []);
  }
  get #session() {
    return sessions.get(this.host.ownerDocument);
  }

  hostConnected() {
    this.#abort = new AbortController();
    const registered = controllers.get(this.host) ?? new Set<DraggableListController>();
    registered.add(this);
    controllers.set(this.host, registered);
    this.#listen(this.#abort.signal);
    this.#observer = new MutationObserver(() => this.#sync());
    this.#observer.observe(this.host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['draggable', 'disabled', 'readonly', 'hidden', 'inert', 'aria-disabled', 'tabindex']
    });
    this.#sync();
  }

  #listen(signal: AbortSignal) {
    const options = { capture: true, signal };
    this.host.addEventListener('dragstart', this.#dragStart, options);
    this.host.addEventListener('drag', this.#drag, options);
    this.host.addEventListener('dragenter', this.#dragEnter, options);
    this.host.addEventListener('dragover', this.#dragOver, options);
    this.host.addEventListener('dragleave', this.#dragLeave, options);
    this.host.addEventListener('drop', this.#drop, options);
    this.host.addEventListener('click', this.#click, options);
    this.host.addEventListener('keydown', this.#keydown, options);
    this.host.addEventListener('keyup', this.#keyup, options);
  }

  hostUpdate() {
    this.#sync();
  }

  hostDisconnected() {
    const session = this.#session;
    if (session && (session.owner === this || session.candidate?.controller === this)) session.owner.cancel();
    this.#abort?.abort();
    this.#abort = undefined;
    this.#observer?.disconnect();
    this.#observer = undefined;
    controllers.get(this.host)?.delete(this);
    this.#restoreItems();
    this.#activationKey = undefined;
  }

  /** End an unfinished interaction without requesting a reorder. */
  cancel(): void {
    const session = this.#session;
    if (session && (session.owner === this || session.candidate?.controller === this)) this.#finish(session);
  }

  #restoreItems() {
    for (const item of this.#managed) if (item.getAttribute('draggable') === 'true') item.removeAttribute('draggable');
    this.#managed.clear();
  }

  #sync() {
    if (!this.#abort || !this.host.isConnected) return;
    this.#syncItems();
    const session = this.#session;
    if (session && !this.#valid(session)) session.owner.cancel();
  }

  #syncItems() {
    const items = this.#items;
    const enabled = !this.getConfig().disabled;
    for (const item of this.#managed) {
      if (items.includes(item) && enabled) continue;
      if (item.getAttribute('draggable') === 'true') item.removeAttribute('draggable');
      this.#managed.delete(item);
    }
    if (!enabled) return;
    for (const item of items) {
      if (item.hasAttribute('draggable')) continue;
      item.draggable = true;
      this.#managed.add(item);
    }
  }

  #canPickup(item: HTMLElement, control: HTMLElement): boolean {
    return (
      this.host.isConnected &&
      !this.getConfig().disabled &&
      !unavailable(item) &&
      !unavailable(control) &&
      visible(item) &&
      item.getAttribute('draggable') !== 'false'
    );
  }

  #valid(session: Session, candidate = session.candidate): boolean {
    const {
      detail: { source },
      control
    } = session;
    if (!session.owner.#canPickup(source, control)) return false;
    if (!descendantShadowRoots(source, control)) return false;
    if (!sameItems(session.owner.#items, session.items)) return false;
    return !candidate || candidate.controller.#validPlacement(session, candidate);
  }

  #validPlacement(session: Session, candidate: Placement): boolean {
    return (
      this.host.isConnected &&
      visible(candidate.target) &&
      !descendantShadowRoots(session.detail.source, candidate.target) &&
      (candidate.indicator.target === candidate.target || visible(candidate.indicator.target)) &&
      sameItems(this.#items, candidate.items) &&
      (candidate.placement !== 'append' || this.#dropZones.includes(candidate.target)) &&
      this.#accepts(session)
    );
  }

  #eventTarget(event: Event): HTMLElement | undefined {
    const path = event.composedPath();
    if (path.find(node => node instanceof HTMLElement && controllers.has(node)) !== this.host) return;
    const targets = [...this.#items, ...this.#dropZones];
    return targets.find(item => path.includes(item));
  }

  #control(event: Event, item: HTMLElement): HTMLElement | undefined {
    const path = event.composedPath();
    const children = path.slice(0, path.indexOf(item));
    const handle = children.find(
      (node): node is HTMLElement => node instanceof HTMLElement && node.matches(handleSelector)
    );
    if (handle) return unavailable(handle) ? undefined : handle;
    if (item.matches(handleSelector)) return unavailable(item) ? undefined : item;
    if (this.getConfig().handlesOnly || children.some(node => node instanceof HTMLElement && node.matches(interactive)))
      return;
    if (hasHandle(item)) return;
    return item;
  }

  #accepts(session: Session) {
    return (
      !this.getConfig().disabled &&
      (this.getConfig().accepts?.(session.detail.source, session.detail.sourceContainer) ?? true)
    );
  }

  #emit(type: string, detail: DraggableSourceDetail | DraggableDropDetail | DraggableEndDetail) {
    this.host.dispatchEvent(
      new CustomEvent(`draggable-${type}`, { detail: Object.freeze(detail), bubbles: true, composed: true })
    );
  }

  #label(session: Session): string {
    return (
      session.control.getAttribute('aria-label') ??
      session.detail.source.getAttribute('aria-label') ??
      session.detail.source.textContent?.trim() ??
      ''
    );
  }

  #announce(
    key: 'dragPickedUp' | 'dragPosition' | 'dragDropped' | 'dragCanceled',
    session: Session,
    placement?: Placement
  ) {
    const position = placement ? placement.index : session.detail.sourceIndex;
    let count = placement ? placement.items.length : session.items.length;
    if (placement && placement.controller !== session.owner) count++;
    const values: Record<string, string> = {
      label: this.#label(session),
      position: String(position + 1),
      count: String(count)
    };
    const template = I18nService.i18n[key] ?? '';
    this.getConfig().announce?.(template.replace(/\{(\w+)\}/g, (_, name: string) => values[name] ?? ''));
  }

  #begin(item: HTMLElement, control: HTMLElement, input: 'drag' | 'keyboard' | 'click'): Session | undefined {
    if (!this.#canPickup(item, control)) return;
    this.#session?.owner.cancel();
    const items = this.#items;
    const session: Session = {
      mode: input === 'drag' ? 'native' : 'placement',
      owner: this,
      items,
      control,
      ariaPressed: control.getAttribute('aria-pressed'),
      abort: new AbortController(),
      detail: {
        source: item,
        sourceContainer: this.host,
        sourceIndex: items.indexOf(item),
        interaction: input === 'keyboard' ? 'keyboard' : 'pointer'
      }
    };
    sessions.set(this.host.ownerDocument, session);
    marker(item, 'active', true);
    if (session.mode === 'placement') this.#pickControl(session);
    this.#watchSession(session);
    this.#emit('start', session.detail);
    return this.#session === session ? session : undefined;
  }

  #pickControl(session: Session) {
    const control = session.control;
    if ('pressed' in control && typeof control.pressed === 'boolean') {
      session.pressed = control.pressed;
      control.pressed = true;
    } else if (control.matches('button,[role="button"],[nve-draggable~="handle"]')) {
      control.setAttribute('aria-pressed', 'true');
    }
    this.#announce('dragPickedUp', session);
  }

  #watchSession(session: Session) {
    this.#watchControl(session);
    const document = this.host.ownerDocument;
    const options = { signal: session.abort.signal };
    document.addEventListener('dragend', () => this.#finish(session), { ...options, capture: true });
    document.addEventListener('drop', () => this.#finish(session), options);
    document.addEventListener(
      'keydown',
      event => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        this.#finish(session);
      },
      options
    );
    document.addEventListener(
      'pointerdown',
      event => {
        if (!event.composedPath().some(node => node instanceof HTMLElement && controllers.has(node))) {
          this.#finish(session);
        }
      },
      options
    );
    document.defaultView?.addEventListener('blur', () => this.#finish(session), options);
  }

  #watchControl(session: Session) {
    const roots = descendantShadowRoots(session.detail.source, session.control);
    if (!roots?.length) return;
    const observer = new MutationObserver(() => this.#sync());
    for (const root of roots) observer.observe(root, { childList: true, subtree: true });
    session.abort.signal.onabort = () => observer.disconnect();
  }

  #detail(session: Session, candidate: Placement): DraggableDropDetail {
    return {
      ...session.detail,
      target: candidate.target,
      targetContainer: candidate.controller.host,
      targetIndex: candidate.index,
      placement: candidate.placement
    };
  }

  #clearCandidate(session: Session) {
    if (!session.candidate) return;
    const previous = session.candidate;
    session.candidate = undefined;
    const { controller, indicator } = previous;
    markIndicator(indicator, false);
    controller.#emit('leave', controller.#detail(session, previous));
  }

  #choose(session: Session, proposal: PlacementTarget): boolean {
    const { target, placement, keyboardTarget } = proposal;
    if (!this.#canChoose(session, target)) return false;
    const previous = session.candidate;
    if (previous?.controller === this && previous.target === target && previous.placement === placement) {
      previous.keyboardTarget = keyboardTarget;
      return true;
    }
    if (previous) {
      this.#clearCandidate(session);
      if (this.#session !== session || !this.#canChoose(session, target)) return false;
    }
    const candidate = this.#createPlacement(session, proposal);
    return !!candidate && this.#setCandidate(session, candidate);
  }

  #setCandidate(session: Session, candidate: Placement): boolean {
    session.candidate = candidate;
    markIndicator(candidate.indicator, true);
    this.#emit('enter', this.#detail(session, candidate));
    if (this.#session !== session) return false;
    this.#announce('dragPosition', session, candidate);
    return true;
  }

  #createPlacement(session: Session, proposal: PlacementTarget): Placement | undefined {
    const { target, placement } = proposal;
    const items = this.#items;
    const remaining = items.filter(item => item !== session.detail.source);
    const index = placement === 'append' ? remaining.length : remaining.indexOf(target);
    if (index < 0) return;
    const indicator = getIndicator({ items, target, placement }, session.detail.source);
    if (this.getConfig().orientation === 'horizontal') {
      indicator.direction = getComputedStyle(this.host).direction === 'rtl' ? 'rtl' : 'ltr';
    }

    return {
      ...proposal,
      controller: this,
      indicator,
      index: index + (placement === 'after' ? 1 : 0),
      items
    };
  }

  #canChoose(session: Session, target: HTMLElement): boolean {
    return (
      this.#valid(session) &&
      this.#accepts(session) &&
      visible(target) &&
      !descendantShadowRoots(session.detail.source, target)
    );
  }

  #pointerPlacement(event: MouseEvent, target: HTMLElement): DraggableDropDetail['placement'] {
    if (this.#dropZones.includes(target)) return 'append';
    const rect = target.getBoundingClientRect();
    if (this.getConfig().orientation !== 'horizontal')
      return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    const before = event.clientX < rect.left + rect.width / 2;
    return before !== (getComputedStyle(this.host).direction === 'rtl') ? 'before' : 'after';
  }

  #committedDetail(session: Session, candidate?: Placement): DraggableDropDetail | undefined {
    if (!candidate || this.#session || !this.#valid(session, candidate)) return;
    if (candidate.controller === session.owner && candidate.index === session.detail.sourceIndex) return;
    return candidate.controller.#detail(session, candidate);
  }

  #finish(session: Session, candidate?: Placement) {
    if (this.#session !== session) return;
    sessions.delete(this.host.ownerDocument);
    session.abort.abort();
    marker(session.detail.source, 'active', false);
    this.#restoreControl(session);
    this.#clearCandidate(session);
    const detail = this.#committedDetail(session, candidate);
    if (detail && candidate) candidate.controller.#emit('drop', detail);
    session.owner.#announce(detail ? 'dragDropped' : 'dragCanceled', session);
    session.owner.#emit('end', { ...session.detail, dropped: !!detail });
    this.#restoreFocus(session);
  }

  #restoreControl(session: Session) {
    if (session.mode !== 'placement') return;
    if (session.pressed !== undefined && 'pressed' in session.control) session.control.pressed = session.pressed;
    else if (session.ariaPressed === null) session.control.removeAttribute('aria-pressed');
    else session.control.setAttribute('aria-pressed', session.ariaPressed);
  }

  #restoreFocus(session: Session) {
    if (session.mode !== 'placement') return;
    queueMicrotask(() => {
      const document = this.host.ownerDocument;
      const active = document.activeElement;
      if (this.#session || !session.control.isConnected) return;
      if (!active || active === document.body) session.control.focus({ preventScroll: true });
    });
  }

  #nativeSource(event: DragEvent): HTMLElement | undefined {
    if (this.getConfig().disabled || event.defaultPrevented) return;
    const item = this.#eventTarget(event);
    if (!item || !this.#items.includes(item)) return;
    const origin = event.composedPath()[0];
    return origin === item || (origin instanceof HTMLElement && origin.matches(handleSelector)) ? item : undefined;
  }

  #dragStart = (event: DragEvent) => {
    const item = this.#nativeSource(event);
    if (!item) return;
    const control = this.#control(event, item);
    const { dataTransfer } = event;
    if (!control || !dataTransfer) {
      event.preventDefault();
      return;
    }
    const session = this.#begin(item, control, 'drag');
    if (!session) {
      event.preventDefault();
      return;
    }
    dataTransfer.effectAllowed = 'move';
    dataTransfer.setData('application/x-nve-draggable', 'move');
    dataTransfer.setDragImage(item, 0, 0);
    queueMicrotask(() => {
      if (event.defaultPrevented) this.#finish(session);
    });
  };

  #drag = (event: DragEvent) => {
    const session = this.#session;
    if (session?.owner === this && this.#eventTarget(event) === session.detail.source)
      this.#emit('drag', session.detail);
  };

  #dragEnter = (event: DragEvent) => {
    const session = this.#session;
    const target = this.#eventTarget(event);
    if (session?.mode === 'native' && target)
      this.#choose(session, { target, placement: this.#pointerPlacement(event, target) });
  };

  #dragOver = (event: DragEvent) => {
    const session = this.#session;
    const target = this.#eventTarget(event);
    if (session?.mode !== 'native' || !target) return;
    if (!this.#choose(session, { target, placement: this.#pointerPlacement(event, target) }) || !session.candidate)
      return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.#emit('over', this.#detail(session, session.candidate));
  };

  #dragLeave = (event: DragEvent) => {
    const session = this.#session;
    const target = this.#eventTarget(event);
    if (session?.candidate?.controller !== this || session.candidate.target !== target) return;
    if (event.relatedTarget instanceof Node && target?.contains(event.relatedTarget)) return;
    this.#clearCandidate(session);
  };

  #drop = (event: DragEvent) => {
    const session = this.#session;
    const target = this.#eventTarget(event);
    if (session?.mode !== 'native' || !target) return;
    if (!this.#choose(session, { target, placement: this.#pointerPlacement(event, target) })) return;
    event.preventDefault();
    this.#finish(session, session.candidate);
  };

  #interactiveDescendant(event: Event, target: HTMLElement): boolean {
    const path = event.composedPath();
    return path.slice(0, path.indexOf(target)).some(node => node instanceof HTMLElement && node.matches(interactive));
  }

  #click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    const target = this.#eventTarget(event);
    if (!target) return;
    const session = this.#session;
    if (session?.mode === 'placement') this.#placeByClick(event, target, session);
    else {
      const control = this.#control(event, target);
      if (control && this.#items.includes(target) && this.#begin(target, control, event.detail ? 'click' : 'keyboard'))
        event.preventDefault();
    }
  };

  #placeByClick(event: MouseEvent, target: HTMLElement, session: Session) {
    const control = this.#control(event, target);
    if (target === session.detail.source && control) {
      event.preventDefault();
      this.#finish(session, session.candidate);
      return;
    }
    if (!control && this.#interactiveDescendant(event, target)) return;
    const chosen = this.#choose(session, { target, placement: this.#pointerPlacement(event, target) });
    if (chosen || (control?.matches(handleSelector) && !this.getConfig().disabled)) event.preventDefault();
    if (chosen) this.#finish(session, session.candidate);
  }

  get #placementSession(): Session | undefined {
    const session = this.#session;
    return session?.mode === 'placement' ? session : undefined;
  }

  #ignoreKey(event: KeyboardEvent): boolean {
    return event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey;
  }

  #keydown = (event: KeyboardEvent) => {
    if (this.getConfig().disabled || this.#ignoreKey(event)) return;
    const target = this.#eventTarget(event);
    if (!target) return;
    const session = this.#placementSession;
    if (event.key === 'Escape' && session) {
      this.#consume(event);
      this.#finish(session);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      this.#activateKey(event, target);
      return;
    }
    if (session && this.#control(event, target)) this.#navigate(event, target, session);
  };

  #activateKey(event: KeyboardEvent, target: HTMLElement) {
    const control = this.#control(event, target);
    if (!control && !this.#dropZones.includes(target)) return;
    if (event.repeat) {
      this.#consume(event);
      return;
    }
    const session = this.#session;
    if (session) {
      this.#commitKey(event, target, session);
      return;
    }
    if (control && this.#items.includes(target) && this.#begin(target, control, 'keyboard')) this.#consume(event);
  }

  #commitKey(event: KeyboardEvent, target: HTMLElement, session: Session) {
    if (session.mode !== 'placement' || !this.#accepts(session)) return;
    const append = this.#dropZones.includes(target);
    const chooseFocused = append || (target !== session.detail.source && session.candidate?.keyboardTarget !== target);
    this.#consume(event);
    if (chooseFocused && !this.#choose(session, { target, placement: append ? 'append' : 'before' })) return;
    this.#finish(session, session.candidate);
  }

  #movementKeys() {
    if (this.getConfig().orientation !== 'horizontal') return { previous: 'ArrowUp', next: 'ArrowDown' };
    return getComputedStyle(this.host).direction === 'rtl'
      ? { previous: 'ArrowRight', next: 'ArrowLeft' }
      : { previous: 'ArrowLeft', next: 'ArrowRight' };
  }

  #keyboardBaseline(session: Session, target: HTMLElement): number {
    if (session.candidate?.keyboardTarget === target) return session.candidate.index;
    if (target === session.detail.source) return session.detail.sourceIndex;
    return Math.max(0, this.#items.filter(item => item !== session.detail.source).indexOf(target));
  }

  #insertionSlots(session: Session) {
    const remaining = this.#items.filter(item => item !== session.detail.source);
    const items = remaining.filter(visible);
    const slots: { target: HTMLElement; placement: DraggableDropDetail['placement']; index: number }[] = items.map(
      item => ({ target: item, placement: 'before', index: remaining.indexOf(item) })
    );
    const last = items.at(-1);
    if (last) slots.push({ target: last, placement: 'after', index: remaining.indexOf(last) + 1 });
    else {
      const dropzone = this.#dropZones.find(visible);
      if (dropzone) slots.push({ target: dropzone, placement: 'append', index: 0 });
    }
    return slots;
  }

  #navigate(event: KeyboardEvent, target: HTMLElement, session: Session) {
    if (!this.#accepts(session)) return;
    const { previous, next } = this.#movementKeys();
    if (![previous, next, 'Home', 'End'].includes(event.key)) return;
    this.#consume(event);
    const slots = this.#insertionSlots(session);
    const baseline = this.#keyboardBaseline(session, target);
    let slot;
    switch (event.key) {
      case 'Home':
        slot = slots[0];
        break;
      case 'End':
        slot = slots.at(-1);
        break;
      case previous:
        slot = slots.filter(item => item.index < baseline).at(-1);
        break;
      default:
        slot = slots.find(item => item.index > baseline);
    }
    if (slot) this.#choose(session, { target: slot.target, placement: slot.placement, keyboardTarget: target });
  }

  #consume(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.#activationKey = event.key;
  }

  #keyup = (event: KeyboardEvent) => {
    if (event.key !== this.#activationKey) return;
    event.preventDefault();
    event.stopPropagation();
    this.#activationKey = undefined;
  };
}

/**
 * Add a draggable list controller to a custom Lit element.
 * @public
 */
export function draggableList<T extends ReactiveElement>(
  config: (host: T) => DraggableListControllerConfig
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function & { addInitializer?: (initializer: (host: T) => void) => void }) => {
    target.addInitializer?.(host => new DraggableListController(host, () => config(host)));
  };
}
