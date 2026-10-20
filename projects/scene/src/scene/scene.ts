// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { attachInternals, useStyles } from '@nvidia-elements/core/internal';
import { html, LitElement, type TemplateResult } from 'lit';
import { DEVICE_LOST, WEBGPU_UNAVAILABLE, type SceneErrorCode } from '../internal/diagnostics/errors.js';
import { diagnosticReporterService } from '../internal/diagnostics/reporter.service.js';
import {
  sharedDeviceService,
  type SharedDeviceLease,
  type SharedDeviceListener
} from '../internal/gpu/shared-device.service.js';
import { scenePlatform, type SceneGPUDeviceLostInfo } from '../internal/gpu/platform.js';
import { registerSceneRenderNotifications } from '../internal/composition/scene/notifications.js';
import type { SceneCameraState } from '../internal/composition/camera/math.js';
import type { ScenePickHit } from '../internal/interaction/picking/routing.js';
import { CameraController } from '../internal/composition/camera/camera.controller.js';
import { PickController } from '../internal/interaction/picking/pick.controller.js';
import { SceneRenderer } from '../internal/rendering/renderer.js';
import { SceneContent } from '../internal/composition/scene/content.js';
import { createReadyCycle, type ReadyCycle } from '../internal/composition/scene/ready-cycle.js';
import styles from './scene.css?inline';
import { invertPreciseMat4 } from '../internal/math/mat4.js';
import {
  createProjectionRay,
  isInsideClipVolume,
  ndcToViewport,
  projectPoint,
  viewportToNdc
} from '../internal/math/projection.js';
import type { Vec3 } from '../internal/math/types.js';
import { getDevicePixelSize } from '../internal/dom/viewport-size.js';
import { SceneInteractionSource } from '../internal/interaction/source.js';
import type { SceneCamera } from '../camera/camera.js';
import type { SceneBounds } from '../internal/math/bounds.js';
import { getSceneBounds, type SceneBoundsQueryOptions } from '../internal/composition/scene/bounds.js';
import type { SceneCameraFitOptions } from '../internal/composition/camera/fit.js';

export type { SceneBounds } from '../internal/math/bounds.js';
export type { SceneBoundsQueryOptions } from '../internal/composition/scene/bounds.js';
export type { SceneCameraFitOptions } from '../internal/composition/camera/fit.js';

export type {
  SceneClick,
  ScenePickHit,
  ScenePickTarget,
  ScenePointerEnter,
  ScenePointerLeave
} from '../internal/interaction/picking/routing.js';
export type { SceneErrorCode, SceneErrorDetail } from '../internal/diagnostics/errors.js';
export type {
  SceneCameraProjection,
  SceneCameraState,
  SceneCameraChangeDetail
} from '../internal/composition/camera/math.js';
export type { ScenePose } from '../internal/math/types.js';

type SceneState = 'disconnected' | 'initializing' | 'ready' | 'failed';

export interface SceneClientPoint {
  readonly clientX: number;
  readonly clientY: number;
  readonly depth: number;
  readonly visibility: 'clipped' | 'visible';
}

export interface SceneRay {
  readonly direction: Readonly<Vec3>;
  readonly origin: Readonly<Vec3>;
}

/**
 * @element nve-scene
 * @description A WebGPU-backed visualization foundation for operational robotics and spatial monitoring.
 * Declarative Web Components describe stable structure; packed record buffers carry
 * frequently updated geometry. Weighted blended order-independent transparency keeps
 * intersecting translucent layers independent of document order.
 *
 * Applications own transport and middleware, source timestamps and clocks, buffering,
 * retention, interpolation, extrapolation, replay controls, and selection state. Prepare
 * one coherent set of transforms, sensor buffers, and annotations before assigning it.
 * Scene validates the current snapshot, composes scene-local frames, stages CPU data,
 * manages GPU resources, schedules drawing, projects labels, and resolves picking.
 * Device recovery rebuilds from the latest captured state, preserving unpublished edits
 * in producer storage without displaying them. Scene stores no transform history,
 * infers no synchronization between independent assignments, and does not treat wall-clock
 * time as render time.
 * @documentation https://nvidia.github.io/elements/docs/scene/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/scene
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 * @event {SceneClick} nve-scene-click - Dispatched on the owning interactive layer when pointer activation resolves to geometry. Read detail.target for submitted source identity, detail.featureId for application identity, and detail.worldPosition for an immutable world coordinate. Instance records create no DOM targets; Scene stores no selection state.
 * @event {ScenePointerEnter} nve-scene-pointerenter - Dispatched on the owning interactive layer when the pointer enters a resolved target. Read detail.target rather than treating a record as a DOM element.
 * @event {ScenePointerLeave} nve-scene-pointerleave - Dispatched once for the last hovered target when the pointer leaves or cancels over the canvas. Pending hover work cancels; late readback cannot restore it. Transitions to overlays inside the scene do not create false leaves. Down, up, and click work remains ordered independently; reentry starts a fresh hover query.
 * @event {SceneCameraChangeDetail} nve-scene-camera-change - Dispatched after the resolved camera state changes.
 * @event {void} nve-scene-ready - Dispatched after the scene submits the first frame of the current initialization or recovery cycle.
 * @event {SceneErrorDetail} nve-scene-error - Dispatched when the scene reports a rendering or configuration error.
 * @slot - default slot for scene-owned composition and components introduced together.
 * @slot fallback - slot for non-WebGPU content while scene rendering is unavailable.
 * @stable false
 */
export class Scene extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scene',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  #canvas?: HTMLCanvasElement;
  readonly #camera: CameraController;
  #connectionToken = 0;
  readonly #content: SceneContent;
  #hasConnected = false;
  #mutationObserver?: MutationObserver;
  #needsIdentityRefresh = false;
  #needsRender = true;
  readonly #picking: PickController;
  readonly #interactionSource: SceneInteractionSource;
  #readyCycle: ReadyCycle = createReadyCycle();
  readonly #renderer: SceneRenderer;
  #resizeObserver?: ResizeObserver;
  #state: SceneState = 'disconnected';
  #tickHandle?: number;
  #unsubscribeDevice?: () => void;

  readonly #deviceListener: SharedDeviceListener = {
    deviceLost: info => this.#handleDeviceLost(info),
    deviceRecovered: lease => this.#handleDeviceRecovered(lease),
    recoveryFailed: error => this.#handleRecoveryFailure(error)
  };

  constructor() {
    super();
    this.#renderer = new SceneRenderer(
      () => this.#scheduleTick(),
      error => this.#failWebGPU(error)
    );
    this.#content = new SceneContent(this);
    this.#interactionSource = new SceneInteractionSource({
      getContainerRect: () => this.#canvas?.getBoundingClientRect() ?? this.getBoundingClientRect(),
      project: worldPosition => this.getClientPoint(worldPosition)
    });
    this.#picking = new PickController({
      host: this,
      driver: this.#renderer.pick.bind(this.#renderer),
      hasInteractiveTargets: () => this.#content.hasInteractiveTargets(),
      updateClickSource: hit => this.#interactionSource.update(hit)
    });
    this.#camera = new CameraController({
      host: this,
      requestRender: () => this.#requestRender()
    });
    registerSceneRenderNotifications(this, (source, kind) => {
      this.#content.refreshLayer(source);
      if (kind === 'composition') this.#content.resolveReferences();
      if (kind === 'identity') {
        this.#needsIdentityRefresh = true;
        this.#scheduleTick();
      } else {
        this.#requestRender();
      }
    });
  }

  /** Gets an independent snapshot of the resolved camera state. */
  get cameraState(): SceneCameraState {
    return this.#camera.state;
  }

  /**
   * Queries captured geometry under an explicit selection using current effective frame transforms.
   * Select layers, frames, ancestor containers, or the scene itself with content; omit
   * reference geometry with exclude. Overlapping roots contribute each layer once and
   * nested scenes do not contribute. Foreign selected or excluded elements throw TypeError.
   *
   * Returns a frozen, independent world-space axis-aligned box with minimum and maximum
   * XYZ tuples in meters, or null for an empty selection or no contributing geometry.
   * Composition and accumulation preserve JavaScript number precision at large origins.
   * The query reads the latest captured assignment or successful publication and current
   * CPU transforms, independently of GPU submission. It does not publish producer edits,
   * drain uploads, allocate GPU resources, or wait for ready; queries support detached
   * scene-owned content before initialization. Frame and joint position and orientation
   * assignments apply immediately.
   *
   * | Content or state | Contribution |
   * | --- | --- |
   * | Primitive instances | Conservative boxes transformed by instance and frame poses; arrows extend from origin toward the head |
   * | Meshes, bodies, polygons | Captured geometry boxes transformed by instances; geometry without a source uses identity placement |
   * | Terrain | Captured grid positions and heights |
   * | Triangle vertices | Published effective vertex prefix |
   * | World-sized points | Positions expanded to contain the camera-facing square at any orientation |
   * | World-width lines | Positions expanded for width and bounded joins; incomplete topology contributes nothing |
   * | Pixel-sized points and lines | Positions only |
   * | Labels, including world-scaled labels | Anchors only, independent of text metrics and camera |
   * | countLimit | Restricts the published active prefix as rendering does |
   * | Hidden layer or DOM ancestor | Omitted unless includeHidden is true; arbitrary CSS visibility does not change selection |
   * | Empty or invalid source, invalid frame chain, pending element | No contribution; unrelated valid content still contributes |
   * | Unloaded mesh part | No contribution; await body.loadComplete for its mesh files |
   *
   * Opacity, occlusion, culling, and unused capacity do not change bounds. Curved primitives,
   * transformed mesh boxes, and line joins can be conservative. Pixel footprints and label
   * text can extend beyond a fitted view; increase fit padding when those footprints matter.
   * SceneBounds and SceneBoundsQueryOptions types come from the package root or its scene entrypoint.
   */
  getBounds(options: SceneBoundsQueryOptions): SceneBounds | null {
    return getSceneBounds(this, options);
  }

  /**
   * Fits an explicit camera once; later publications, transforms, visibility, and layout
   * changes preserve the user's view. Accepts an enabled, valid pose, orbit, or top camera
   * in this scene. Returns true after applying inputs and scheduling rendering, without
   * waiting for submission or emitting a navigation event. Null bounds returns false unchanged.
   *
   * Preserves projection mode, perspective field of view, orientation, roll, and orbit angles.
   * Standalone orbit and top cameras target the box center; a pose camera moves to view it
   * while preserving optical rotation. A framed pose keeps its frame and local orientation.
   * Orbit plus follow keeps the tracked target and heading, changing distance and extent
   * to contain bounds around that target. Follow alone cannot fit.
   *
   * Perspective fitting considers every corner and depth. Orthographic fitting changes
   * frustumHeight independently of distance or top altitude. Both derive positive near and
   * far clipping distances with numerical slack. Orbit preserves minDistance and expands
   * maxDistance when needed. Applications with additional moving content may widen clipping afterward.
   *
   * Options use SceneCameraFitOptions from the package root or its scene entrypoint. Padding defaults to 0.1
   * of each viewport dimension at each edge; it must be finite and in [0, 0.5). Aspect
   * defaults to scene width / height and must be positive and finite. Supply aspect to fit
   * before layout, or wait for nonzero viewport dimensions. Resize never refits automatically.
   * Planar and linear bounds fit normally; a single point uses a virtual one-meter box,
   * without changing the original query result.
   *
   * Malformed or reversed bounds, invalid options, and non-finite arithmetic throw before
   * applying fitted inputs. Disabled, conflicted, unresolved, invalid, or follow-only cameras
   * throw InvalidStateError; a foreign camera throws TypeError.
   */
  fitCamera(camera: SceneCamera, bounds: SceneBounds | null, options?: SceneCameraFitOptions): boolean {
    if (bounds !== null) {
      this.#content.refresh();
      this.#content.resolveFrames();
    }
    return this.#camera.fitCamera(camera, bounds, options);
  }

  /**
   * Resolves after the cycle's first valid geometry submission, before GPU completion;
   * empty scenes resolve and invalid layers stay inert. Later additions initialize lazily
   * without replacing this promise. Disconnect rejects a pending cycle; reconnect and
   * device recovery start new ones. Required failures report nve-scene-error once per
   * episode and leave unavailable content inert.
   */
  get ready(): Promise<void> {
    return this.#readyCycle.promise;
  }

  /**
   * Resolves rendered geometry at finite browser viewport clientX/clientY coordinates.
   * Returns a promise of ScenePickHit or null. Uses event coordinates directly, accounting
   * for canvas position, size, and device pixel ratio. Includes rendered layers without
   * interactive and dispatches no interaction events.
   *
   * Hit element and layer both identify the owning layer. Narrow target.kind before reading
   * indices: instance identifies a primitive, body, or mesh placement; label and point identify
   * records; segment includes its submitted vertex pair; triangle includes three submitted
   * vertex indices. Meshes identify instances, not faces; terrain reports surface without
   * a cell index. worldPosition is an immutable XYZ tuple in Scene world coordinates.
   * The hit, target, and nested tuples snapshot submitted geometry: later source or topology
   * changes cannot reinterpret a pending result. Storage indices identify submitted slots;
   * use featureId for stable application identity.
   *
   * Record buffers expose featureIds as a uint32 scalar, Uint32Array, or descriptor mapping
   * target i through values[offset + floor(i / repeat) * stride]. Optional LSB-first validity
   * bits mark absent IDs. Assigning copies arrays immediately; reassign and publish the
   * owning layer to capture a new generation. Primitive and mesh targets use instance indices;
   * connected-line segments use their starting vertex. Bodies, meshes, polygons, and terrain
   * also expose a singular featureId for uninstanced geometry. Applications own reverse indexes,
   * selection state, and publishing any visual color changes.
   */
  pick(clientX: number, clientY: number): Promise<ScenePickHit | null> {
    return this.#picking.pick(clientX, clientY);
  }

  /**
   * Projects a world point through the most recently submitted frame. Returns viewport
   * clientX/clientY, WebGPU depth, and visible or clipped status. Returns null before the
   * first valid frame, behind a perspective camera, for invalid input, or while a resize
   * awaits matching submission. Does not test geometric occlusion. Supports an axis-aligned
   * canvas; rotated or perspective-transformed DOM canvases need application coordinate mapping.
   * Frame point conversions instead use current CPU transforms, which may postdate a pick.
   */
  getClientPoint(worldPoint: Readonly<Vec3>): SceneClientPoint | null {
    if (!isFiniteVec3(worldPoint)) return null;
    const snapshot = this.#renderer.getSubmittedProjection();
    if (!snapshot) return null;
    const point = projectPoint(snapshot.projection, worldPoint);
    if (!point) return null;
    const rect = snapshot.canvas.getBoundingClientRect();
    const viewport = ndcToViewport(point, rect);
    const visibility = isInsideClipVolume(point) ? 'visible' : 'clipped';
    return Object.freeze({
      clientX: rect.left + viewport[0],
      clientY: rect.top + viewport[1],
      depth: point[2],
      visibility
    });
  }

  /**
   * Creates a world ray through viewport client coordinates using the most recently submitted
   * frame, without GPU readback. The origin lies on the near plane; direction has unit length.
   * Returns null for invalid or out-of-canvas input or unavailable projection. Does not test
   * occlusion. Supports an axis-aligned canvas; applications map transformed DOM canvases.
   */
  getRay(clientX: number, clientY: number): SceneRay | null {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
    const snapshot = this.#renderer.getSubmittedProjection();
    if (!snapshot) return null;
    const rect = snapshot.canvas.getBoundingClientRect();
    if (!clientPointIsInside(rect, clientX, clientY)) return null;
    const inverse = invertPreciseMat4(snapshot.projection);
    if (!inverse) return null;
    const point = viewportToNdc([clientX - rect.left, clientY - rect.top, 0], rect);
    const ray = createProjectionRay(inverse, [point[0], point[1]]);
    return ray ? Object.freeze({ direction: Object.freeze(ray.direction), origin: Object.freeze(ray.origin) }) : null;
  }

  render(): TemplateResult<1> {
    return html`
      <div internal-host>
        <canvas aria-hidden="true"></canvas>
        <span data-interaction-source aria-hidden="true" hidden></span>
        <slot name="fallback" ?hidden=${this.#state !== 'failed'}></slot>
      </div>
    `;
  }

  protected override updated(): void {
    this.#scheduleTick();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'region';
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
    const resumedLease = this.#prepareConnection();
    void resumedLease?.catch(() => undefined);
    void this.#initialize(resumedLease);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#connectionToken += 1;
    this.#stopObservers();
    this.#camera.unbindCanvas();
    this.#interactionSource.unbind();
    this.#canvas = undefined;
    this.#unsubscribeDevice?.();
    this.#unsubscribeDevice = undefined;
    this.#renderer.disconnect();
    this.#readyCycle.reject(new DOMException('The scene disconnected before it became ready.', 'AbortError'));
    this.#state = 'disconnected';
  }

  #prepareConnection(): Promise<SharedDeviceLease> | undefined {
    const resumedLease = this.#hasConnected ? sharedDeviceService.resumeRecoveryAfterReconnect() : undefined;
    if (this.#hasConnected) this.#readyCycle = createReadyCycle();
    this.#hasConnected = true;
    this.#state = 'initializing';
    this.#requestRender();
    this.#unsubscribeDevice = sharedDeviceService.subscribe(this.#deviceListener);
    this.requestUpdate();
    return resumedLease;
  }

  async #initialize(resumedLease?: Promise<SharedDeviceLease>): Promise<void> {
    const token = ++this.#connectionToken;
    try {
      await this.updateComplete;
      if (!this.#isCurrentConnection(token)) return;
      this.#bindShadowDOM();
      const lease = await (resumedLease ?? sharedDeviceService.acquire());
      if (this.#isCurrentConnection(token)) this.#initializeRenderer(lease);
    } catch (error) {
      if (this.#isCurrentConnection(token)) this.#failWebGPU(error);
    }
  }

  #bindShadowDOM(): void {
    const canvas = this.renderRoot.querySelector('canvas');
    if (canvas instanceof HTMLCanvasElement) this.#bindCanvas(canvas);
    const source = this.renderRoot.querySelector('[data-interaction-source]');
    if (!(source instanceof HTMLElement)) {
      throw new DOMException('The scene interaction source is unavailable.', 'NotSupportedError');
    }
    this.#interactionSource.bind(source);
    this.#content.refresh();
    this.#content.resolveReferences();
    this.#picking.reconcileInteractionAvailability();
    this.#startObservers();
    this.#sampleBackground();
    this.#scheduleTick();
  }

  #bindCanvas(canvas: HTMLCanvasElement): void {
    if (this.#canvas === canvas) return;
    this.#camera.unbindCanvas();
    this.#canvas = canvas;
    this.#picking.bindCanvas(canvas);
    this.#camera.bindCanvas(canvas);
  }

  #initializeRenderer(lease: SharedDeviceLease): void {
    const canvas = this.#canvas ?? this.renderRoot.querySelector('canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new DOMException('The scene canvas is unavailable.', 'NotSupportedError');
    }
    this.#renderer.initialize(canvas, lease);
    this.#observeResize();
    this.#resizeFromRect();
    this.#sampleBackground();
    this.#trackRuntimeChanges();
    this.#needsRender = true;
    this.#renderIfNeeded();
  }

  #startObservers(): void {
    this.#mutationObserver ??= scenePlatform.createMutationObserver(records => this.#handleMutations(records));
    this.#mutationObserver.observe(this, {
      attributes: true,
      childList: true,
      subtree: true
    });
    this.#resizeObserver ??= scenePlatform.createResizeObserver(entries => this.#handleResize(entries));
    this.#observeResize();
  }

  #observeResize(): void {
    try {
      this.#resizeObserver?.observe(this, { box: 'device-pixel-content-box' });
    } catch {
      this.#resizeObserver?.observe(this);
    }
  }

  #stopObservers(): void {
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = undefined;
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
    if (this.#tickHandle !== undefined) {
      scenePlatform.cancelAnimationFrame(this.#tickHandle);
      this.#tickHandle = undefined;
    }
  }

  #handleMutations(records: MutationRecord[]): void {
    const owned = records.filter(record => this.#content.ownsNode(record.target));
    if (owned.length === 0) return;
    if (owned.some(record => record.type === 'childList')) {
      this.#syncStructuralMutations();
      return;
    }
    if (owned.every(record => record.type === 'attributes' && record.attributeName === 'feature-id')) return;
    if (owned.some(record => record.type === 'attributes' && record.attributeName === 'name'))
      this.#content.resolveReferences();
    this.#requestRender();
  }

  #syncStructuralMutations(): void {
    this.#content.refresh();
    this.#content.resolveReferences();
    this.#picking.reconcileInteractionAvailability();
    this.#observeResize();
    this.#requestRender();
  }

  #handleResize(entries: ResizeObserverEntry[]): void {
    const entry = entries.find(candidate => candidate.target === this);
    if (entry) {
      const size = getDevicePixelSize(entry, scenePlatform.getDevicePixelRatio());
      this.#renderer.resize(size.width, size.height);
      this.#requestRender();
    }
  }

  #resizeFromRect(): void {
    const rect = this.getBoundingClientRect();
    const ratio = scenePlatform.getDevicePixelRatio();
    const changed = this.#renderer.resize(rect.width * ratio, rect.height * ratio);
    this.#needsRender = this.#needsRender || changed;
  }

  #sampleBackground(): void {
    const background = scenePlatform.getComputedStyle(this).backgroundColor;
    const changed = this.#renderer.setBackgroundColor(background);
    this.#needsRender = this.#needsRender || changed;
  }

  #scheduleTick(): void {
    if (this.#tickHandle !== undefined || !this.isConnected) return;
    this.#tickHandle = scenePlatform.requestAnimationFrame(() => this.#tick());
  }

  #requestRender(): void {
    this.#needsRender = true;
    this.#scheduleTick();
  }

  #tick(): void {
    this.#tickHandle = undefined;
    if (!this.isConnected) return;
    this.#sampleBackground();
    this.#trackRuntimeChanges();
    const rendererRequested = this.#renderer.consumeRenderRequest();
    this.#needsRender = this.#needsRender || rendererRequested;
    this.#renderIfNeeded();
    this.#refreshIdentityIfNeeded();
  }

  #trackRuntimeChanges(): void {
    const cameraChanged = this.#camera.trackChanges();
    this.#needsRender = this.#needsRender || cameraChanged;
  }

  #renderIfNeeded(): void {
    if (!this.#needsRender || !this.#renderer.active) return;
    try {
      this.#content.resolveFrames();
      this.#camera.resolve();
      const viewProjection = this.#camera.viewProjection();
      const items = this.#content.compileRenderItems();
      this.#picking.reconcileInteractionAvailability();
      if (this.#renderer.render(items, viewProjection)) {
        this.#needsIdentityRefresh = false;
        this.#needsRender = false;
        this.#interactionSource.refresh();
        this.#completeReadyCycle();
        this.#camera.dispatchPendingChange();
      }
    } catch (error) {
      this.#failWebGPU(error);
    }
  }

  #refreshIdentityIfNeeded(): void {
    if (!this.#needsIdentityRefresh || this.#needsRender || !this.#renderer.active) return;
    try {
      this.#renderer.updateFeatureIdentity(this.#content.compileRenderItems());
      this.#picking.reconcileInteractionAvailability();
      this.#needsIdentityRefresh = false;
    } catch (error) {
      this.#failWebGPU(error);
    }
  }

  #completeReadyCycle(): void {
    if (this.#readyCycle.settled) return;
    this.#state = 'ready';
    this.#clearError(WEBGPU_UNAVAILABLE);
    this.#clearError(DEVICE_LOST);
    this.#readyCycle.resolve();
    this.dispatchEvent(new CustomEvent('nve-scene-ready', { bubbles: true, composed: true, cancelable: false }));
    this.requestUpdate();
  }

  #handleDeviceLost(info: SceneGPUDeviceLostInfo): void {
    this.#picking.invalidate(new DOMException('The WebGPU device was lost while picking.', 'AbortError'));
    this.#renderer.disconnect();
    this.#readyCycle.reject(new DOMException('The WebGPU device was lost.', 'AbortError'));
    this.#readyCycle = createReadyCycle();
    this.#state = 'failed';
    this.#requestRender();
    this.#dispatchError(DEVICE_LOST, info.message ?? 'The WebGPU device was lost.');
    this.requestUpdate();
  }

  #handleDeviceRecovered(lease: SharedDeviceLease): void {
    if (!this.isConnected) return;
    this.#state = 'initializing';
    this.requestUpdate();
    void this.updateComplete
      .then(() => {
        if (this.isConnected) this.#initializeRenderer(lease);
      })
      .catch(error => {
        if (this.isConnected) this.#failWebGPU(error);
      });
  }

  #handleRecoveryFailure(error: unknown): void {
    if (!this.isConnected) return;
    this.#state = 'failed';
    this.#readyCycle.reject(toNotSupportedError(error));
    this.requestUpdate();
  }

  #failWebGPU(error: unknown): void {
    this.#renderer.disconnect();
    this.#state = 'failed';
    this.#dispatchError(WEBGPU_UNAVAILABLE, getErrorMessage(error));
    this.#readyCycle.reject(toNotSupportedError(error));
    this.requestUpdate();
  }

  #dispatchError(code: SceneErrorCode, message: string): void {
    diagnosticReporterService.update({ active: true, code, element: this, message, severity: 'error' });
  }

  #clearError(code: SceneErrorCode): void {
    diagnosticReporterService.update({ active: false, code, element: this, message: '', severity: 'error' });
  }

  #isCurrentConnection(token: number): boolean {
    return this.isConnected && token === this.#connectionToken;
  }
}

function clientPointIsInside(rect: DOMRect, x: number, y: number): boolean {
  return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
}

function isFiniteVec3(value: unknown): value is Readonly<Vec3> {
  return Array.isArray(value) && value.length === 3 && value.every(component => Number.isFinite(component));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'WebGPU is unavailable.';
}

function toNotSupportedError(error: unknown): DOMException {
  return error instanceof DOMException && error.name === 'NotSupportedError'
    ? error
    : new DOMException(getErrorMessage(error), 'NotSupportedError');
}
