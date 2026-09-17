// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  audit,
  attachInternals,
  finiteOr,
  nonnegativeFiniteOr,
  positiveFiniteOr,
  useStyles
} from '@nvidia-elements/core/internal';
import styles from './viewport.css?inline';
import { ViewportAnimationController } from './viewport-animation.controller.js';
import { ViewportAutoFitController } from './viewport-autofit.controller.js';
import {
  contentBoundsFromClientRects,
  revealTarget,
  type ViewportClientRect,
  type ViewportFitOptions
} from './viewport-fitting.utils.js';
import { ViewportGestureNavigationController } from './viewport-gesture-navigation.controller.js';
import { ViewportNavigationController } from './viewport-navigation.controller.js';
import type { ViewportNavigationEventDelegate, ViewportZoomAction } from './viewport-navigation.types.js';
import type {
  ViewportAnimationOptions,
  ViewportPanBehavior,
  ViewportPoint,
  ViewportRect,
  ViewportRevealOptions,
  ViewportTransform
} from './viewport.types.js';
import { centeredScaleTransform, contentPointFromViewport } from './viewport-projection.utils.js';

const DEFAULT_MIN_SCALE = 0.05;
const DEFAULT_MAX_SCALE = 20;
const DEFAULT_DRAG_THRESHOLD = 5;
const ZOOM_SCALE_STEPS = [0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8, 16, 20] as const;
const BEHAVIOR_PAN_CONVERTER = {
  fromAttribute(value: string | null): ViewportPanBehavior {
    if (value === null) return false;
    return value === 'space' ? 'space' : true;
  },
  toAttribute(value: ViewportPanBehavior): string | null {
    if (!value) return null;
    return value === 'space' ? 'space' : '';
  }
};

/**
 * @element nve-viewport
 * @description A viewport provides a spatial surface for arbitrary content, with optional pan and zoom navigation.
 * @documentation https://nvidia.github.io/elements/docs/elements/viewport/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/viewport
 * @slot - Content positioned in the viewport's infinite content space.
 * @slot background - Custom content rendered behind viewport content and excluded from content fitting
 * @event panstart - Dispatched when pointer movement crosses the pan threshold. Cancel to disable built-in pointer panning for the sequence.
 * @event pan - Dispatched when pointer, wheel, keyboard, or command input requests a pan. Cancel to skip the proposed transform mutation.
 * @event panend - Dispatched when a pointer pan ends, including its terminal reason.
 * @event zoom - Dispatched when wheel, pinch, or command input requests a scale change. Cancel to skip the proposed transform mutation.
 * @event viewportchange - Dispatched once after a render that commits one or more viewport transform changes.
 * @cssprop --background - Background color of the fixed viewport area.
 * @cssprop --min-height
 * @cssprop --pan-cursor - Cursor shown over a background eligible for primary-pointer panning.
 * @cssprop --panning-cursor - Cursor shown while a pointer pan is active.
 * @command --pan-left - With behavior-pan enabled, pans left by one discrete step.
 * @command --pan-right - With behavior-pan enabled, pans right by one discrete step.
 * @command --pan-up - With behavior-pan enabled, pans up by one discrete step.
 * @command --pan-down - With behavior-pan enabled, pans down by one discrete step.
 * @command --zoom-in - With behavior-zoom enabled, animates to the next permitted scale step.
 * @command --zoom-out - With behavior-zoom enabled, animates to the previous permitted scale step.
 * @command --zoom-reset - With behavior-zoom enabled, animates to 100% scale.
 * @command --zoom-to-fit - With behavior-zoom enabled, animates to fit direct default-slot element boxes.
 */
@audit()
export class Viewport extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-viewport',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  @query('[internal-host]') private internalHost: HTMLElement | null;
  readonly #navigationController: ViewportNavigationController;
  readonly #gestureNavigationController: ViewportGestureNavigationController;
  readonly #animationController: ViewportAnimationController;
  readonly #autoFitController = new ViewportAutoFitController(this, clientRects =>
    this.#applyInitialAutoFit(clientRects)
  );
  readonly #navigationEvents: ViewportNavigationEventDelegate = {
    dispatchPanStart: detail => this.#dispatchNavigationEvent('panstart', detail, true),
    dispatchPan: detail => this.#dispatchNavigationEvent('pan', detail, true),
    dispatchPanEnd: detail => {
      this.#dispatchNavigationEvent('panend', detail, false);
    },
    dispatchZoom: detail => this.#dispatchNavigationEvent('zoom', detail, true)
  };
  #publishTransformChanges = false;
  #x = 0;
  #y = 0;
  #scale = 1;
  #minScale = DEFAULT_MIN_SCALE;
  #maxScale = DEFAULT_MAX_SCALE;
  #dragThreshold = DEFAULT_DRAG_THRESHOLD;
  #fitInset = 0;
  #behaviorPan: ViewportPanBehavior = false;
  constructor() {
    super();
    this.#animationController = new ViewportAnimationController(this, {
      commitTransform: next => {
        this.#applyAnimationTransform(next);
      },
      clampScale: value => this.#clampScale(value),
      getTransform: () => this.getTransform(),
      getViewportSize: () => ({ height: this.clientHeight, width: this.clientWidth })
    });
    this.#navigationController = new ViewportNavigationController(this, {
      animateTo: (target, options) => this.animateTo(target, options),
      commitTransform: next => this.#commitTransform(next),
      cancelAnimation: () => this.#animationController.cancel(),
      consumeAutoFit: () => this.#autoFitController.consume(),
      events: this.#navigationEvents,
      getTransform: () => this.getTransform(),
      getZoomTarget: action => this.#getZoomTarget(action, this.#animationController.destinationScale ?? this.#scale),
      rebasePointerSessions: () => this.#gestureNavigationController.rebasePointerSessions(),
      viewportToClient: (viewportX, viewportY) => this.#viewportToClient(viewportX, viewportY)
    });
    this.#gestureNavigationController = new ViewportGestureNavigationController(this, {
      commitTransform: next => this.#commitTransform(next),
      cancelAnimation: () => this.#animationController.cancel(),
      clampScale: value => this.#clampScale(value),
      clientToViewport: (clientX, clientY) => this.#clientToViewport(clientX, clientY),
      consumeAutoFit: () => this.#autoFitController.consume(),
      events: this.#navigationEvents,
      getTransform: () => this.getTransform()
    });
  }

  /** Horizontal content-space coordinate at the viewport origin. */
  @property({ type: Number })
  get x(): number {
    return this.#x;
  }

  set x(value: number) {
    this.#applyExternalTransform({ ...this.getTransform(), x: finiteOr(value, 0) });
  }

  /** Vertical content-space coordinate at the viewport origin. */
  @property({ type: Number })
  get y(): number {
    return this.#y;
  }

  set y(value: number) {
    this.#applyExternalTransform({ ...this.getTransform(), y: finiteOr(value, 0) });
  }

  /** Content-to-viewport CSS-pixel scale. */
  @property({ type: Number })
  get scale(): number {
    return this.#scale;
  }

  set scale(value: number) {
    this.#applyExternalTransform({ ...this.getTransform(), scale: value });
  }

  /** Inclusive lower scale limit. */
  @property({ attribute: 'min-scale', type: Number, reflect: true })
  get minScale(): number {
    return this.#minScale;
  }

  set minScale(value: number) {
    const next = Math.min(positiveFiniteOr(value, DEFAULT_MIN_SCALE), this.#maxScale);
    if (next === this.#minScale) return;
    const previous = this.#minScale;
    this.#animationController.cancel();
    this.#minScale = next;
    this.requestUpdate('minScale', previous);
    this.#commitExternalTransform({ ...this.getTransform(), scale: this.#scale });
  }

  /** Inclusive upper scale limit. */
  @property({ attribute: 'max-scale', type: Number, reflect: true })
  get maxScale(): number {
    return this.#maxScale;
  }

  set maxScale(value: number) {
    const next = Math.max(positiveFiniteOr(value, DEFAULT_MAX_SCALE), this.#minScale);
    if (next === this.#maxScale) return;
    const previous = this.#maxScale;
    this.#animationController.cancel();
    this.#maxScale = next;
    this.requestUpdate('maxScale', previous);
    this.#commitExternalTransform({ ...this.getTransform(), scale: this.#scale });
  }

  /** Enables panning by pointer, focused wheel, focused keyboard, and Invoker commands; requires Space for primary-pointer dragging when set to space. */
  @property({ attribute: 'behavior-pan', converter: BEHAVIOR_PAN_CONVERTER, reflect: true })
  get behaviorPan(): ViewportPanBehavior {
    return this.#behaviorPan;
  }

  set behaviorPan(value: ViewportPanBehavior | null | undefined) {
    const next = value === 'space' ? 'space' : Boolean(value);
    if (next === this.#behaviorPan) return;
    const previous = this.#behaviorPan;
    this.#behaviorPan = next;
    this.requestUpdate('behaviorPan', previous);
  }

  /** Enables zooming by pinch, focused modified wheel, focused keyboard, and Invoker commands. */
  @property({ type: Boolean, attribute: 'behavior-zoom', reflect: true }) behaviorZoom = false;
  /** Fits measurable direct default-slot content once after initial layout. */
  @property({ type: Boolean, reflect: true }) autoFit = false;
  /** Default uniform CSS-pixel inset reserved around bounds when fitting content. */
  @property({ attribute: 'fit-inset', type: Number, reflect: true })
  get fitInset(): number {
    return this.#fitInset;
  }

  set fitInset(value: number) {
    const next = nonnegativeFiniteOr(value, 0);
    if (next === this.#fitInset) return;
    const previous = this.#fitInset;
    this.#fitInset = next;
    this.requestUpdate('fitInset', previous);
  }

  /** CSS-pixel pointer movement required before a pointer pan begins. */
  @property({ attribute: 'drag-threshold', type: Number, reflect: true })
  get dragThreshold(): number {
    return this.#dragThreshold;
  }

  set dragThreshold(value: number) {
    const next = nonnegativeFiniteOr(value, DEFAULT_DRAG_THRESHOLD);
    if (next === this.#dragThreshold) return;
    const previous = this.#dragThreshold;
    this.#dragThreshold = next;
    this.requestUpdate('dragThreshold', previous);
  }

  connectedCallback(): void {
    super.connectedCallback();
    attachInternals(this);
    if (this.hasUpdated && !this.isUpdatePending) this.#publishTransformChanges = true;
  }

  disconnectedCallback(): void {
    this.#publishTransformChanges = false;
    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (
      this.isConnected &&
      this.#publishTransformChanges &&
      (changed.has('x') || changed.has('y') || changed.has('scale'))
    ) {
      this.dispatchEvent(
        new CustomEvent<ViewportTransform>('viewportchange', {
          bubbles: true,
          composed: true,
          detail: this.getTransform()
        })
      );
    }
    this.#publishTransformChanges = this.isConnected;
  }

  render() {
    return html`
      <div internal-host focusable>
        <div
          class="plane"
          style=${styleMap({ transform: `scale(${this.#scale}) translate(${-this.#x}px, ${-this.#y}px)` })}
        >
          <slot name="background"></slot>
          <slot @slotchange=${this.#autoFitController.contentChanged}></slot>
        </div>
      </div>
    `;
  }

  /** Converts a content-space point to viewport CSS pixels. */
  toViewportCoords(contentX: number, contentY: number): ViewportPoint {
    return {
      x: (contentX - this.#x) * this.#scale,
      y: (contentY - this.#y) * this.#scale
    };
  }

  /** Converts a viewport CSS-pixel point to content space. */
  toContentCoords(viewportX: number, viewportY: number): ViewportPoint {
    return contentPointFromViewport(viewportX, viewportY, this.getTransform());
  }

  /** Returns the current content-space origin and CSS-pixel scale. */
  getTransform(): ViewportTransform {
    return { scale: this.#scale, x: this.#x, y: this.#y };
  }

  /** Returns the visible content-space rectangle. */
  getVisibleRect(): ViewportRect {
    return {
      x: this.#x,
      y: this.#y,
      width: this.clientWidth / this.#scale,
      height: this.clientHeight / this.#scale
    };
  }

  /** Animates the viewport to the requested partial transform. */
  animateTo(target: Partial<ViewportTransform>, options: ViewportAnimationOptions = {}): void {
    this.#animationController.animateTo(target, options);
  }

  /** Centers or fits a content-space region within the viewport. */
  reveal(region: { x: number; y: number; width?: number; height?: number }, options: ViewportRevealOptions = {}): void {
    this.#applyRevealTarget(this.#getRevealTarget(region, this.#revealFitOptions(options)), options);
  }

  /** Fits the union of direct default-slot element boxes within the viewport. */
  fitContents(options: ViewportRevealOptions = {}): void {
    const target = this.#getFitContentsTargetFromClientRects(
      this.#clientRectsFromChildren(Array.from(this.children).filter(child => !child.slot)),
      this.#resolveFitOptions(options)
    );
    if (target) this.#applyRevealTarget(target, options);
  }

  #getFitContentsTargetFromClientRects(
    clientRects: Iterable<ViewportClientRect>,
    options: ViewportFitOptions
  ): ViewportTransform | undefined {
    if (!this.internalHost) return undefined;
    const transform = this.getTransform();
    const viewportFrame = this.#viewportFrame();
    const region = contentBoundsFromClientRects(clientRects, viewportFrame, transform);
    return region ? this.#getRevealTarget(region, options, transform) : undefined;
  }

  #applyInitialAutoFit(clientRects: readonly ViewportClientRect[]): void {
    const target = this.#getFitContentsTargetFromClientRects(clientRects, this.#resolveFitOptions({}));
    if (!target) return;
    this.#animationController.cancel();
    if (this.#commitTransform(target)) {
      this.#gestureNavigationController.rebasePointerSessions();
    }
  }

  #applyRevealTarget(target: ViewportTransform, options: ViewportRevealOptions): void {
    if (options.animated) {
      if (options.duration === undefined) this.animateTo(target);
      else this.animateTo(target, { duration: options.duration });
    } else {
      this.#applyExternalTransform(target);
    }
  }

  #getRevealTarget(
    region: { x: number; y: number; width?: number; height?: number },
    options: ViewportFitOptions,
    transform = this.getTransform()
  ): ViewportTransform {
    return revealTarget(region, {
      options,
      scaleRange: this.#getScaleRange(),
      transform,
      viewport: { height: this.clientHeight, width: this.clientWidth }
    });
  }

  #getZoomTarget(action: ViewportZoomAction, stepScale: number): ViewportTransform | undefined {
    if (action === 'in') return this.#getCenteredScaleTransform(nextScaleStep(1, stepScale, this.#getScaleRange()));
    if (action === 'out') return this.#getCenteredScaleTransform(nextScaleStep(-1, stepScale, this.#getScaleRange()));
    if (action === 'reset') return this.#getCenteredScaleTransform(this.#clampScale(1));
    return this.#getFitContentsTargetFromClientRects(
      this.#clientRectsFromChildren(Array.from(this.children).filter(child => !child.slot)),
      this.#resolveFitOptions({})
    );
  }

  #clientRectsFromChildren(children: Iterable<Element>): Iterable<ViewportClientRect> {
    return (function* (): Generator<ViewportClientRect> {
      for (const child of children) yield child.getBoundingClientRect();
    })();
  }

  #revealFitOptions(options: ViewportRevealOptions): ViewportFitOptions {
    return { inset: options.inset, scale: options.scale };
  }

  #resolveFitOptions(options: ViewportRevealOptions): ViewportFitOptions {
    return { inset: options.inset ?? this.#fitInset, scale: options.scale };
  }
  #getScaleRange(): { min: number; max: number } {
    return { min: this.#minScale, max: this.#maxScale };
  }
  #getCenteredScaleTransform(scale: number): ViewportTransform {
    return centeredScaleTransform(scale, this.getTransform(), { height: this.clientHeight, width: this.clientWidth });
  }

  #viewportFrame(): DOMRect {
    return this.internalHost?.getBoundingClientRect() ?? DOMRect.fromRect();
  }
  #clientToViewport(clientX: number, clientY: number, frame = this.#viewportFrame()): ViewportPoint {
    return { x: clientX - frame.left, y: clientY - frame.top };
  }

  #viewportToClient(viewportX: number, viewportY: number): ViewportPoint {
    const frame = this.#viewportFrame();
    return { x: frame.left + viewportX, y: frame.top + viewportY };
  }

  #commitTransform(next: ViewportTransform): boolean {
    const x = finiteOr(next.x, this.#x);
    const y = finiteOr(next.y, this.#y);
    const scale = this.#clampScale(next.scale);
    if (x === this.#x && y === this.#y && scale === this.#scale) return false;
    this.#updateTransformFields({ scale, x, y });
    return true;
  }

  #applyExternalTransform(next: ViewportTransform): void {
    this.#animationController.cancel();
    this.#commitExternalTransform(next);
  }

  #commitExternalTransform(next: ViewportTransform): void {
    if (!this.#commitTransform(next)) return;
    if (this.isConnected) this.#autoFitController.consume();
    this.#gestureNavigationController.rebasePointerSessions();
  }

  #applyAnimationTransform(next: ViewportTransform): void {
    const committed = this.#commitTransform(next);
    if (!committed) return;
    if (this.isConnected) this.#autoFitController.consume();
    this.#gestureNavigationController.rebasePointerSessions();
  }

  #dispatchNavigationEvent<T>(type: string, detail: T, cancelable: boolean): boolean {
    return this.dispatchEvent(
      new CustomEvent<T>(type, {
        bubbles: true,
        cancelable,
        composed: true,
        detail
      })
    );
  }

  #updateTransformFields(next: ViewportTransform): void {
    const previousX = this.#x;
    const previousY = this.#y;
    const previousScale = this.#scale;
    this.#x = next.x;
    this.#y = next.y;
    this.#scale = next.scale;
    if (next.x !== previousX) this.requestUpdate('x', previousX);
    if (next.y !== previousY) this.requestUpdate('y', previousY);
    if (next.scale !== previousScale) this.requestUpdate('scale', previousScale);
  }
  #clampScale(value: number): number {
    const finite = Number.isFinite(value) && value > 0 ? value : this.#minScale;
    return Math.min(this.#maxScale, Math.max(this.#minScale, finite));
  }
}

function nextScaleStep(direction: -1 | 1, current: number, scaleRange: { min: number; max: number }): number {
  const steps = [...ZOOM_SCALE_STEPS, scaleRange.min, scaleRange.max]
    .map(scale => Math.min(scaleRange.max, Math.max(scaleRange.min, scale)))
    .sort((first, second) => first - second)
    .filter((scale, index, all) => index === 0 || scale !== all[index - 1]);
  if (direction > 0) return steps.find(scale => scale > current) ?? scaleRange.max;
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    const scale = steps[index];
    if (scale !== undefined && scale < current) return scale;
  }
  return scaleRange.min;
}
