// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable max-lines -- Scene coordinates its public camera, input, and rendering lifecycle. */

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, useStyles } from '@nvidia-elements/core/internal';
import {
  DEVICE_LOST,
  FRAME_NAME_DUPLICATE,
  LABEL_TEXTURE_FALLBACK,
  SCENE_STALE_AFTER,
  WEBGPU_UNAVAILABLE,
  type SceneErrorDetail
} from '../errors.js';
import { SceneCamera, sceneCameraController } from '../camera/camera.js';
import { resolveCameraState, type CameraContribution, type CameraField } from '../internal/camera/state.js';
import {
  sharedDeviceManager,
  type SharedDeviceLease,
  type SharedDeviceListener
} from '../internal/gpu/device-manager.js';
import {
  frameHasTimestampedSamples,
  getFrameName,
  getFrameVersion,
  getFrameWorldMatrix,
  getNamedSceneFrame,
  isFrameStateRegistered,
  resolveFrameForScene,
  setSceneNamedFrames,
  setSceneSampledTime
} from '../internal/frame/state.js';
import { verifyLabelBrowserCopy } from '../internal/label/browser-probe.js';
import {
  copyLabelElementImage,
  getLabelCaptureCapabilities,
  type LabelCaptureCapabilities
} from '../internal/label/capture.js';
import { registerSceneLabelNotifications, registerSceneRenderNotifications } from '../internal/label/notifications.js';
import { LabelOcclusionTracker } from '../internal/label/occlusion.js';
import { waitForLabelMutationPaint } from '../internal/label/overlay.js';
import type { LabelTextureRenderItem } from '../internal/label/renderer.js';
import { LabelSceneController, markLabelProbe } from '../internal/label/scene-controller.js';
import { consumeLabelDirty, setLabelSceneState } from '../internal/label/state.js';
import { LabelTextureController } from '../internal/label/texture.js';
import {
  getMarkerLayerVersion,
  isMarkerLayerRegistered,
  takeMarkerLayerRenderData
} from '../internal/markers/layer-state.js';

import {
  getHeightfieldLayerVersion,
  isHeightfieldLayerRegistered,
  takeHeightfieldLayerRenderData
} from '../internal/heightfield/layer-state.js';
import {
  getModelLayerVersion,
  isModelLayerRegistered,
  takeModelLayerRenderData
} from '../internal/model/layer-state.js';
import { getMeshLayerVersion, takeMeshLayerRenderData } from '../internal/mesh/layer-state.js';
import {
  getStreamingLayerKind,
  getStreamingLayerVersion,
  isStreamingLayerRegistered,
  takeStreamingLayerRenderData,
  type StreamingLayerRenderData
} from '../internal/streaming-layer-state.js';
import {
  getLiveSceneTime,
  scenePlatform,
  type SceneGPUDevice,
  type SceneGPUDeviceLostInfo,
  type SceneGPUTexture
} from '../internal/gpu/platform.js';
import { createReadyCycle, type ReadyCycle } from './ready-cycle.js';
import type { Vec3 } from '../internal/types.js';
import {
  KeynavController,
  type KeynavCommand,
  type KeynavHandling
} from '../internal/interactions/keynav.controller.js';
import {
  TouchController,
  type TouchCapabilities,
  type TouchGesture,
  type UnhandledPointerInput
} from '../internal/interactions/touch.controller.js';
import { registerSceneMarkerInteractionController } from '../internal/markers/interaction.js';
import { copyPickHit, requestScenePick, type PickHit } from '../internal/pick/routing.js';
import { PickCoordinator, type PickCompletion } from '../internal/pick/coordinator.js';
import {
  registerSceneRenderer,
  SceneRenderer,
  type MeshRenderItem,
  type SceneRenderItem
} from './rendering/renderer.js';
import { identityMat4 } from '../internal/math/mat4.js';
import {
  applyOrbitDrag,
  applyOrbitKey,
  applyOrbitWheel,
  copyCameraState,
  createCameraViewProjection,
  DEFAULT_CAMERA_STATE,
  pinchDistance,
  type CameraChangeSource,
  type CameraState,
  type CameraTarget,
  type SceneCameraChangeDetail
} from '../internal/math/camera.js';
import styles from './scene.css?inline';

type CameraBehaviorContribution = NonNullable<ReturnType<typeof sceneCameraController.getContribution>>;

interface ResolvedCameraBehavior {
  readonly behavior: SceneCamera;
  readonly contribution: CameraBehaviorContribution;
}

export type { PickHit } from '../internal/pick/routing.js';
export type { SceneErrorDetail } from '../errors.js';
export type { CameraState, SceneCameraChangeDetail } from '../internal/math/camera.js';

type SceneState = 'disconnected' | 'initializing' | 'ready' | 'failed';

const nonnegativeNumberConverter = {
  fromAttribute(value: string | null): number {
    const parsed = value === null ? 1_000 : Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1_000;
  }
};

const MARKER_LAYER_SELECTOR = [
  'nve-scene-arrows',
  'nve-scene-cones',
  'nve-scene-cubes',
  'nve-scene-cylinders',
  'nve-scene-pyramids',
  'nve-scene-spheres'
].join(',');

const STREAMING_LAYER_SELECTOR = ['nve-scene-lines', 'nve-scene-points', 'nve-scene-triangles'].join(',');
// Reference elements use the private streaming-layer path and may register
// after custom-element discovery, so Scene verifies registration at render time.
const REFERENCE_LAYER_SELECTOR = ['nve-scene-axes', 'nve-scene-gridlines'].join(',');
const HEIGHTFIELD_LAYER_SELECTOR = 'nve-scene-heightfield';
const MESH_LAYER_SELECTOR = 'nve-scene-mesh';
const MODEL_LAYER_SELECTOR = 'nve-scene-model';
const RENDERABLE_LAYER_SELECTOR = `${MARKER_LAYER_SELECTOR},${STREAMING_LAYER_SELECTOR},${REFERENCE_LAYER_SELECTOR},${HEIGHTFIELD_LAYER_SELECTOR},${MESH_LAYER_SELECTOR},${MODEL_LAYER_SELECTOR}`;
const LABEL_SELECTOR = 'nve-scene-label';

interface SceneLabelTestingOptions {
  readonly captureCapabilities?: LabelCaptureCapabilities;
  readonly copy?: (options: {
    readonly slot: HTMLSlotElement;
    readonly size: { readonly height: number; readonly width: number };
  }) => void;
  readonly getGeometryPixel?: (
    pixelX: number,
    pixelY: number
  ) => { readonly depth: number; readonly id: number } | undefined;
  readonly prefetchGeometryPixel?: (pixelX: number, pixelY: number) => void;
}

const LABEL_TESTING = Symbol.for('nve.scene.label-testing');
const TICK_PERFORMANCE = Symbol.for('nve.scene.tick-performance');

interface SceneTickPerformanceSnapshot {
  readonly animationFrameRequests: number;
  readonly backgroundSamples: number;
  readonly cameraScans: number;
  readonly frameScans: number;
  readonly layerScans: number;
  readonly parked: boolean;
  readonly ticks: number;
}

/**
 * @element nve-scene
 * @description A visual scene component.
 * @documentation https://nvidia.github.io/elements/docs/scene/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/scene
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 * @property ready - Resolves after the scene submits the first frame of the current initialization or recovery cycle.
 * @slot - default slot for scene-owned composition and components introduced together.
 * @slot fallback - slot for non-WebGPU content while scene rendering is unavailable.
 * @stable false
 */
export class Scene extends LitElement {
  static styles = useStyles([styles]);

  static override readonly shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    slotAssignment: 'manual' as const
  };

  static readonly metadata = {
    tag: 'nve-scene',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  #activeErrors = new Set<string>();
  #cameraState = copyCameraState(DEFAULT_CAMERA_STATE);
  #cameraBehaviors: readonly ResolvedCameraBehavior[] = [];
  #cameraContributions: readonly CameraBehaviorContribution[] = [];
  #cameraBehaviorSignature = '';
  #pendingCameraChange?: { readonly source: CameraChangeSource; readonly state: CameraState };
  #blockedLabelPointers = new Map<number, HTMLElement>();
  #canvas?: HTMLCanvasElement;
  #connectionToken = 0;
  #duplicateFrames = new Set<HTMLElement>();
  #frames: HTMLElement[] = [];
  #frameVersions = new WeakMap<HTMLElement, number>();
  #hasConnected = false;
  #layers: HTMLElement[] = [];
  #labelOverlay?: LabelSceneController;
  #labelCaptureCapabilities: LabelCaptureCapabilities = { available: false };
  #labelControllers = new Map<HTMLElement, LabelTextureController<SceneGPUTexture>>();
  #labelFallbackDiagnostics = new WeakMap<HTMLElement, Set<string>>();
  #labelOcclusion = new WeakMap<HTMLElement, LabelOcclusionTracker>();
  #labels: HTMLElement[] = [];
  #labelProbedDevice?: SceneGPUDevice;
  #layerVersions = new WeakMap<HTMLElement, number>();
  #heightfieldVersions = new WeakMap<HTMLElement, number>();
  #meshVersions = new WeakMap<HTMLElement, number>();
  #modelVersions = new WeakMap<HTMLElement, number>();
  #mutationObserver?: MutationObserver;
  #needsRender = true;
  #pendingPickEvents = new Map<number, PointerEvent>();
  #pickEpoch = 0;
  #pickInvalidation = new DOMException('The scene is unavailable for picking.', 'AbortError');
  #pickCoordinator = this.#createPickCoordinator();
  #hoverHit: PickHit | null = null;
  #markerInteractionCleanup?: () => void;
  #readyCycle: ReadyCycle = createReadyCycle();
  #renderer = new SceneRenderer(() => this.#scheduleTick());
  #resizeObserver?: ResizeObserver;
  #state: SceneState = 'disconnected';
  #syntheticPointerEvents = new WeakSet<Event>();
  #textureSlotPool = new Map<HTMLElement, HTMLSlotElement>();
  #staleAfter = 1_000;
  #streamRenderConfig = new WeakMap<HTMLElement, string>();
  #tickHandle?: number;
  #tickPerformance = {
    animationFrameRequests: 0,
    backgroundSamples: 0,
    cameraScans: 0,
    frameScans: 0,
    layerScans: 0,
    parked: true,
    ticks: 0
  };
  #time: 'live' | number = 'live';
  #unsubscribeDevice?: () => void;
  #unsubscribeLabels?: () => void;
  #labelDevice?: SceneGPUDevice;
  readonly #touchController: TouchController<number>;

  readonly #deviceListener: SharedDeviceListener = {
    deviceLost: info => this.#handleDeviceLost(info),
    deviceRecovered: lease => this.#handleDeviceRecovered(lease),
    recoveryFailed: error => this.#handleRecoveryFailure(error)
  };

  constructor() {
    super();
    registerSceneRenderer(this, this.#renderer);
    registerSceneRenderNotifications(this, () => this.#requestRender());
    new KeynavController(this, {
      onCommand: command => this.#handleCameraKeynav(command),
      prepare: () => this.#resolveCameraState()
    });
    this.#touchController = new TouchController(this, {
      createPinchContext: () => this.#cameraState.offset.distance,
      getCapabilities: () => this.#getTouchCapabilities(),
      onGesture: gesture => this.#handleCameraGesture(gesture),
      onUnhandledPointer: input => this.#handleUnhandledPointer(input),
      prepare: () => this.#resolveCameraState(),
      shouldIgnore: event => this.#isSceneLabelEvent(event)
    });
  }

  /** Defines how many milliseconds may pass before timestamped frames become stale. */
  @property({ attribute: 'stale-after', converter: nonnegativeNumberConverter })
  get staleAfter(): number {
    return this.#staleAfter;
  }

  set staleAfter(value: number) {
    assertNonnegativeNumber(value, 'staleAfter');
    if (value !== this.#staleAfter) {
      this.#staleAfter = value;
      this.#requestRender();
    }
  }

  /** Controls the current scene clock or resumes live time sampling. */
  get time(): 'live' | number {
    return this.#time;
  }

  set time(value: 'live' | number) {
    assertSceneTime(value);
    if (value !== this.#time) {
      this.#time = value;
      this.#requestRender();
    }
  }

  /** Gets an independent snapshot of the resolved camera state. */
  get cameraState(): CameraState {
    return copyCameraState(this.#cameraState);
  }

  /** Resolves after the scene submits the first frame of the current initialization or recovery cycle. */
  get ready(): Promise<void> {
    return this.#readyCycle.promise;
  }

  get [TICK_PERFORMANCE](): SceneTickPerformanceSnapshot {
    return { ...this.#tickPerformance };
  }

  /** Resolves the rendered element beneath finite viewport coordinates without dispatching interaction events. */
  pick(clientX: number, clientY: number): Promise<PickHit | null> {
    assertFiniteCoordinate(clientX, 'clientX');
    assertFiniteCoordinate(clientY, 'clientY');
    if (!this.isConnected) {
      return Promise.reject(new DOMException('The scene is not connected.', 'InvalidStateError'));
    }
    return this.#createPickResolver(clientX, clientY)();
  }

  #createPickResolver(clientX: number, clientY: number): () => Promise<PickHit | null> {
    const epoch = this.#pickEpoch;
    const ready = this.ready;
    return () =>
      ready.then(() => {
        this.#assertPickEpoch(epoch);
        const canvas = this.#canvas;
        if (!canvas) {
          throw new DOMException('The scene canvas is unavailable.', 'InvalidStateError');
        }
        return this.#resolvePick({ canvas, clientX, clientY, epoch });
      });
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'stale-after' && oldValue !== newValue) {
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div internal-host>
        <canvas aria-hidden="true"></canvas>
        <div class="overlay"></div>
        <div class="fallback" ?hidden=${this.#state !== 'failed'}><slot name="fallback"></slot></div>
      </div>
    `;
  }

  protected override updated(): void {
    this.#validateStaleAfterAttribute();
    this.#scheduleTick();
  }

  // eslint-disable-next-line max-statements -- Connection installs independent input, label, and rendering lifecycles.
  override connectedCallback(): void {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'region';
    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = 0;
    }
    this.addEventListener('input', this.#handleLabelContentChange, true);
    this.addEventListener('change', this.#handleLabelContentChange, true);
    this.addEventListener('focusin', this.#handleLabelFocus, true);
    this.addEventListener('focusout', this.#handleLabelFocus, true);
    this.addEventListener('pointerdown', this.#handleTextureLabelPointer, true);
    this.addEventListener('pointerup', this.#handleTextureLabelPointer, true);
    this.addEventListener('pointermove', this.#handleTextureLabelPointer, true);
    this.addEventListener('click', this.#handleTextureLabelPointer, true);
    this.addEventListener('pointercancel', this.#handleTextureLabelPointer, true);
    globalThis.document.addEventListener('selectionchange', this.#handleLabelSelection);
    void globalThis.document.fonts?.ready?.then(() => this.#markAllLabelsDirty());
    globalThis.document.fonts?.addEventListener('loadingdone', this.#handleFontsLoaded);
    this.#markerInteractionCleanup = registerSceneMarkerInteractionController(this, {
      activateMarker: (marker, event) => this.#activateMarker(marker, event)
    });
    this.#prepareConnection();
    void this.#initialize();
  }

  // eslint-disable-next-line max-statements -- Disconnect releases every independent Scene resource.
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#connectionToken += 1;
    this.#invalidatePicks(new DOMException('The scene disconnected while picking.', 'AbortError'));
    this.#stopObservers();
    this.removeEventListener('input', this.#handleLabelContentChange, true);
    this.removeEventListener('change', this.#handleLabelContentChange, true);
    this.removeEventListener('focusin', this.#handleLabelFocus, true);
    this.removeEventListener('focusout', this.#handleLabelFocus, true);
    this.removeEventListener('pointerdown', this.#handleTextureLabelPointer, true);
    this.removeEventListener('pointerup', this.#handleTextureLabelPointer, true);
    this.removeEventListener('pointermove', this.#handleTextureLabelPointer, true);
    this.removeEventListener('click', this.#handleTextureLabelPointer, true);
    this.removeEventListener('pointercancel', this.#handleTextureLabelPointer, true);
    globalThis.document.removeEventListener('selectionchange', this.#handleLabelSelection);
    globalThis.document.fonts?.removeEventListener('loadingdone', this.#handleFontsLoaded);
    this.#unbindCanvas();
    this.#markerInteractionCleanup?.();
    this.#markerInteractionCleanup = undefined;
    this.#unsubscribeDevice?.();
    this.#unsubscribeDevice = undefined;
    this.#unsubscribeLabels?.();
    this.#unsubscribeLabels = undefined;
    this.#disposeLabelTextures();
    this.#labelDevice = undefined;
    this.#renderer.disconnect();
    this.#readyCycle.reject(new DOMException('The scene disconnected before it became ready.', 'AbortError'));
    this.#state = 'disconnected';
  }

  #prepareConnection(): void {
    if (this.#hasConnected) {
      this.#readyCycle = createReadyCycle();
      sharedDeviceManager.allowRecoveryAfterReconnect();
    }
    this.#hasConnected = true;
    this.#pickCoordinator = this.#createPickCoordinator();
    this.#state = 'initializing';
    this.#requestRender();
    this.#unsubscribeDevice = sharedDeviceManager.subscribe(this.#deviceListener);
    this.requestUpdate();
  }

  async #initialize(): Promise<void> {
    const token = ++this.#connectionToken;
    try {
      await this.updateComplete;
      if (!this.#isCurrentConnection(token)) {
        return;
      }
      this.#bindShadowDOM();
      const lease = await sharedDeviceManager.acquire();
      if (this.#isCurrentConnection(token)) {
        this.#initializeRenderer(lease);
      }
    } catch (error) {
      if (this.#isCurrentConnection(token)) {
        this.#failWebGPU(error);
      }
    }
  }

  #bindShadowDOM(): void {
    const canvas = this.renderRoot.querySelector('canvas');
    if (canvas instanceof HTMLCanvasElement) {
      this.#bindCanvas(canvas);
    }
    this.#syncFallbackSlot();
    this.#refreshFrames();
    this.#refreshLayers();
    this.#refreshLabels();
    this.#loadLabelOverlayController();
    this.#syncLabelSlots();
    this.#startObservers();
    if (this.#labels.some(label => label.parentElement === this)) this.#prepareLabelCapture();
    this.#sampleBackground();
    this.#scheduleTick();
  }

  #initializeRenderer(lease: SharedDeviceLease): void {
    const canvas = this.#canvas ?? this.renderRoot.querySelector('canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new DOMException('The scene canvas is unavailable.', 'NotSupportedError');
    }
    this.#renderer.initialize(canvas, lease);
    this.#labelDevice = lease.device;
    this.#loadLabelOverlayController();
    if (this.#labels.some(label => label.parentElement === this)) this.#prepareLabelCapture(lease);
    this.#resizeFromRect();
    this.#sampleBackground();
    this.#trackCameraBehaviorChanges();
    this.#trackLayerChanges();
    this.#needsRender = true;
    this.#renderIfNeeded();
  }

  #prepareLabelCapture(lease?: SharedDeviceLease): void {
    this.#installLabelNotifications();
    const device = lease?.device ?? this.#labelDevice;
    if (!device) return;
    const testing = this.#getLabelTesting();
    if (testing?.captureCapabilities) {
      this.#labelCaptureCapabilities = testing.captureCapabilities;
      this.#requestRender();
    } else if (this.#labelProbedDevice !== device) {
      this.#labelProbedDevice = device;
      void this.#probeLabelCapture(device);
    }
  }

  #loadLabelOverlayController(): void {
    if (this.#labelOverlay || !this.#labels.some(label => label.parentElement === this)) return;
    this.#labelOverlay = new LabelSceneController(
      this,
      () => this.renderRoot.querySelector<HTMLElement>('.overlay') ?? undefined,
      () => this.#requestRender()
    );
    this.#labelOverlay.refresh();
    this.#labels = [...this.#labelOverlay.labels];
    this.#syncLabelSlots();
    this.#requestRender();
  }

  #installLabelNotifications(): void {
    if (this.#unsubscribeLabels) return;
    this.#unsubscribeLabels = registerSceneLabelNotifications(this, () => {
      this.#refreshLabels();
      this.#loadLabelOverlayController();
      this.#syncLabelSlots();
      if (this.#labels.some(label => label.parentElement === this)) this.#prepareLabelCapture();
      this.#requestRender();
    });
  }

  #getLabelTesting(): SceneLabelTestingOptions | undefined {
    return Reflect.get(this, LABEL_TESTING) as SceneLabelTestingOptions | undefined;
  }

  #startObservers(): void {
    this.#mutationObserver ??= scenePlatform.createMutationObserver(records => this.#handleMutations(records));
    this.#mutationObserver.observe(this, {
      attributes: true,
      childList: true,
      characterData: true,
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
    for (const label of this.#labels) {
      const child = getLabelChild(label);
      if (child) this.#resizeObserver?.observe(child);
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
    this.#tickPerformance.parked = true;
  }

  #bindCanvas(canvas: HTMLCanvasElement): void {
    if (this.#canvas === canvas) {
      return;
    }
    this.#unbindCanvas();
    this.#canvas = canvas;
    canvas.addEventListener('paint', this.#handleLabelPaint);
    this.#touchController.target = canvas;
  }

  #unbindCanvas(): void {
    if (this.#canvas) {
      this.#canvas.removeEventListener('paint', this.#handleLabelPaint);
      this.#touchController.target = undefined;
      this.#canvas = undefined;
    }
  }

  #isSceneLabelEvent(event: Event): boolean {
    const label = event.composedPath().find(target => target instanceof HTMLElement && target.matches(LABEL_SELECTOR));
    return label instanceof HTMLElement && label.parentElement === this;
  }

  #handleUnhandledPointer(input: UnhandledPointerInput): void {
    if (input.kind === 'pointermove') {
      this.#requestHover(input.event);
      return;
    }
    const { event, kind } = input;
    event.stopImmediatePropagation();
    const handle = this.#pickCoordinator.request(kind, () => this.pick(event.clientX, event.clientY));
    this.#pendingPickEvents.set(handle.request.sequence, event);
    void handle.result.catch(() => this.#pendingPickEvents.delete(handle.request.sequence));
  }

  #getTouchCapabilities(): TouchCapabilities {
    const orbit = this.#getInteractiveOrbit();
    const interactive = Boolean(orbit || this.#getInteractiveTop());
    return { drag: interactive, pan: interactive, pinch: Boolean(orbit), wheel: Boolean(orbit) };
  }

  #handleCameraGesture(gesture: TouchGesture<number>): void {
    switch (gesture.kind) {
      case 'drag':
        this.#handleCameraDrag(gesture);
        break;
      case 'pan':
        this.#handleCameraPan(gesture);
        break;
      case 'pinch':
        this.#handleCameraPinch(gesture);
        break;
      case 'wheel':
        this.#handleCameraWheel(gesture);
        break;
      default: {
        const exhaustive: never = gesture;
        throw new Error(`Unhandled camera gesture: ${String(exhaustive)}`);
      }
    }
  }

  #handleCameraDrag(gesture: Extract<TouchGesture<number>, { kind: 'drag' }>): void {
    const canvas = this.#canvas;
    if (!canvas) return;
    const top = this.#getInteractiveTop();
    const orbit = this.#getInteractiveOrbit();
    if (top) {
      const next = copyCameraState(this.#cameraState);
      const metersPerPixel =
        next.projection.mode === 'ortho' ? next.projection.frustumHeight / canvas.getBoundingClientRect().height : 0;
      next.target.position[0] -= gesture.movementX * metersPerPixel;
      next.target.position[1] += gesture.movementY * metersPerPixel;
      this.#setUserCameraState(next, pointerCameraSource(gesture.event));
    } else if (orbit) {
      this.#setUserCameraState(
        applyOrbitDrag(this.#cameraState, gesture.movementX, gesture.movementY, orbit.minDistance, orbit.maxDistance),
        pointerCameraSource(gesture.event)
      );
    }
  }

  #handleCameraPan(gesture: Extract<TouchGesture<number>, { kind: 'pan' }>): void {
    const top = this.#getInteractiveTop();
    if (top || !this.#hasTargetOwner()) {
      this.#setUserCameraState(
        this.#panCameraByPixels(-gesture.movementX, -gesture.movementY, top),
        pointerCameraSource(gesture.event)
      );
    }
  }

  #handleCameraPinch(gesture: Extract<TouchGesture<number>, { kind: 'pinch' }>): void {
    const orbit = this.#getInteractiveOrbit();
    if (!orbit) return;
    const next = copyCameraState(this.#cameraState);
    next.offset.distance = Math.min(
      orbit.maxDistance,
      Math.max(orbit.minDistance, pinchDistance(gesture.context, gesture.scale))
    );
    this.#setUserCameraState(next, 'touch');
  }

  #handleCameraWheel(gesture: Extract<TouchGesture<number>, { kind: 'wheel' }>): void {
    const orbit = this.#getInteractiveOrbit();
    if (!orbit) return;
    this.#setUserCameraState(
      applyOrbitWheel(this.#cameraState, gesture.deltaPixels, orbit.minDistance, orbit.maxDistance),
      'wheel'
    );
  }

  #handleCameraKeynav(command: KeynavCommand): KeynavHandling {
    const top = this.#getInteractiveTop();
    const orbit = this.#getInteractiveOrbit();
    if (!top && !orbit) return 'ignored';
    let next: CameraState | null = null;
    if (command.kind === 'direction' && command.shiftKey) {
      if (!this.#hasTargetOwner()) next = this.#panCameraByPixels(command.horizontal * 20, command.vertical * 20, top);
    } else if (command.kind === 'direction' && top) {
      next = this.#panCameraByPixels(command.horizontal * 20, command.vertical * 20, top);
    } else if (orbit) {
      next = applyOrbitKey(this.#cameraState, command.key, orbit.minDistance, orbit.maxDistance);
    }
    if (!next) return 'ignored';
    this.#setUserCameraState(next, 'keyboard');
    return 'handled';
  }

  #handleLabelContentChange = (event: Event): void => {
    const label = event.composedPath().find(target => target instanceof HTMLElement && target.matches(LABEL_SELECTOR));
    if (label instanceof HTMLElement && label.parentElement === this) {
      this.#labelControllers.get(label)?.markDirty();
      this.#requestRender();
    }
  };

  #handleLabelFocus = (event: FocusEvent): void => {
    const label = this.#getOwningLabel(event.target as Node);
    if (!label) return;
    this.#labelControllers.get(label)?.markDirty();
    this.#requestRender();
  };

  #handleLabelSelection = (): void => {
    const label = this.#getOwningLabel(globalThis.document.activeElement ?? this);
    if (!label) return;
    this.#labelControllers.get(label)?.markDirty();
    this.#requestRender();
  };

  // eslint-disable-next-line max-statements, complexity -- Capture routing retains pointer ownership across target changes.
  #handleTextureLabelPointer = (event: Event): void => {
    if (this.#syntheticPointerEvents.has(event)) return;
    if (!(event instanceof PointerEvent)) return;
    const pathLabel = event
      .composedPath()
      .find(target => target instanceof HTMLElement && target.matches(LABEL_SELECTOR));
    const label =
      pathLabel instanceof HTMLElement && pathLabel.parentElement === this
        ? pathLabel
        : this.#blockedLabelPointers.get(event.pointerId);
    if (!label) return;
    const tracker = this.#labelOcclusion.get(label);
    if (!tracker) return;
    if (event.type === 'pointermove') {
      this.#prefetchLabelGeometry(event);
      return;
    }
    const decision = tracker.handlePointerEvent({
      pointerId: event.pointerId,
      type: event.type as 'pointerdown' | 'pointerup' | 'click' | 'pointercancel',
      visibility: this.#labelPixelVisibility(label, event)
    });
    if (event.type === 'pointercancel') {
      this.#blockedLabelPointers.delete(event.pointerId);
      return;
    }
    if (decision !== 'block') return;
    if (event.type === 'pointerdown') this.#blockedLabelPointers.set(event.pointerId, label);
    if (event.type === 'click') this.#blockedLabelPointers.delete(event.pointerId);
    event.preventDefault();
    event.stopImmediatePropagation();
    this.#routeBlockedLabelPointer(event);
  };

  #prefetchLabelGeometry(event: PointerEvent): void {
    const canvas = this.#canvas;
    if (!canvas) return;
    const pixel = getCanvasDevicePixel(canvas, event.clientX, event.clientY);
    const testing = this.#getLabelTesting();
    if (testing?.prefetchGeometryPixel) {
      testing.prefetchGeometryPixel(pixel.x, pixel.y);
      return;
    }
    void this.#renderer.prefetchGeometryPixel({
      canvas,
      clientX: event.clientX,
      clientY: event.clientY,
      pixelX: pixel.x,
      pixelY: pixel.y
    });
  }

  // eslint-disable-next-line complexity -- The cache/fallback gate intentionally favors native label input.
  #labelPixelVisibility(
    label: HTMLElement,
    event: PointerEvent
  ): 'geometry-in-front' | 'label-visible' | 'unavailable' | undefined {
    if (event.type !== 'pointerdown') return undefined;
    const canvas = this.#canvas;
    if (!canvas) return 'unavailable';
    const pixel = getCanvasDevicePixel(canvas, event.clientX, event.clientY);
    const geometry =
      this.#getLabelTesting()?.getGeometryPixel?.(pixel.x, pixel.y) ??
      this.#renderer.getCompletedGeometryPixel(pixel.x, pixel.y);
    const depth = this.#labelOverlay?.getDepth(label);
    return geometry && depth !== undefined && geometry.id !== 0 && geometry.depth < depth
      ? 'geometry-in-front'
      : 'label-visible';
  }

  #routeBlockedLabelPointer(event: PointerEvent): void {
    const resolver = this.#createPickResolver(event.clientX, event.clientY);
    const handle = this.#pickCoordinator.request(event.type as 'pointerdown' | 'pointerup' | 'click', resolver);
    this.#pendingPickEvents.set(handle.request.sequence, event);
    void handle.result.catch(() => this.#pendingPickEvents.delete(handle.request.sequence));
  }

  #handleLabelPaint = (): void => this.#markAllLabelsDirty();

  #handleFontsLoaded = (): void => this.#markAllLabelsDirty();

  #markAllLabelsDirty(): void {
    this.#labelControllers.forEach(controller => controller.markDirty());
    this.#requestRender();
  }

  #requestHover(event: PointerEvent): void {
    const handle = this.#pickCoordinator.request('hover', this.#createPickResolver(event.clientX, event.clientY));
    this.#pendingPickEvents.set(handle.request.sequence, event);
    void handle.result.catch(() => this.#pendingPickEvents.delete(handle.request.sequence));
  }

  #handlePickCompletion(completion: PickCompletion): void {
    const event = this.#pendingPickEvents.get(completion.request.sequence);
    this.#pendingPickEvents.delete(completion.request.sequence);
    if (!event || !this.isConnected) {
      return;
    }
    if (completion.request.kind === 'hover') {
      this.#updateHover(event, completion.hit);
      return;
    }
    this.#dispatchResolvedPointer(event, completion.hit);
  }

  #resolvePick(options: {
    readonly canvas: HTMLCanvasElement;
    readonly clientX: number;
    readonly clientY: number;
    readonly epoch: number;
  }): Promise<PickHit | null> {
    const { canvas, clientX, clientY, epoch } = options;
    return requestScenePick({ canvas, clientX, clientY, renderer: this.#renderer, scene: this }).then(
      result => {
        this.#assertPickEpoch(epoch);
        return result ? copyPickHit(result) : null;
      },
      error => {
        if (epoch !== this.#pickEpoch) {
          throw this.#pickInvalidation;
        }
        throw error;
      }
    );
  }

  #assertPickEpoch(epoch: number): void {
    if (epoch !== this.#pickEpoch) {
      throw this.#pickInvalidation;
    }
    if (!this.isConnected) {
      throw new DOMException('The scene is not connected.', 'InvalidStateError');
    }
  }

  #invalidatePicks(reason: DOMException): void {
    this.#pickEpoch += 1;
    this.#pickInvalidation = reason;
    this.#pendingPickEvents.clear();
    this.#hoverHit = null;
    this.#pickCoordinator = this.#createPickCoordinator();
  }

  #createPickCoordinator(): PickCoordinator {
    const epoch = this.#pickEpoch;
    return new PickCoordinator({
      now: () => scenePlatform.now(),
      onComplete: completion => {
        if (epoch === this.#pickEpoch) this.#handlePickCompletion(completion);
      },
      onHoverLatency: latency => {
        if (epoch === this.#pickEpoch) this.#renderer.recordLatestPointLatency(latency);
      },
      onStaleHover: request => {
        if (epoch === this.#pickEpoch) this.#pendingPickEvents.delete(request.sequence);
      }
    });
  }

  #updateHover(event: PointerEvent, next: PickHit | null): void {
    const previous = this.#hoverHit;
    if (isSameHoverTarget(previous, next)) {
      return;
    }
    if (previous) {
      this.#dispatchHoverEvent('leave', event, previous);
    }
    this.#hoverHit = next;
    if (next) {
      this.#dispatchHoverEvent('enter', event, next);
    }
  }

  #dispatchResolvedPointer(event: PointerEvent, hit: PickHit | null): void {
    const target = hit?.element ?? this;
    const synthetic = createSyntheticPointerEvent(event.type, event, { bubbles: true, cancelable: true });
    this.#syntheticPointerEvents.add(synthetic);
    target.dispatchEvent(synthetic);
    if (event.type === 'click' && hit && hit.element === hit.layer) {
      hit.layer.dispatchEvent(createPickEvent('nve-scene-pick', hit));
    }
  }

  #dispatchHoverEvent(kind: 'enter' | 'leave', event: PointerEvent, hit: PickHit): void {
    if (hit.element === hit.layer) {
      hit.layer.dispatchEvent(createPickEvent(`nve-scene-pick${kind}`, hit));
      return;
    }
    hit.element.dispatchEvent(
      createSyntheticPointerEvent(`pointer${kind}`, event, { bubbles: false, cancelable: false })
    );
  }

  #activateMarker(marker: HTMLElement, event: KeyboardEvent): void {
    if (!this.isConnected || marker.closest(Scene.metadata.tag) !== this) {
      return;
    }
    marker.dispatchEvent(createSyntheticPointerEvent('click', event, { bubbles: true, cancelable: true }));
  }

  #handleMutations(records: MutationRecord[]): void {
    const owned = records.filter(record => this.#ownsNode(record.target));
    if (owned.length === 0) {
      return;
    }

    const dirtyLabels = this.#markMutationLabelsDirty(owned);
    if (owned.some(record => record.type === 'childList')) {
      this.#syncStructuralMutations();
      return;
    }

    if (owned.some(record => this.#isDirectNamedSlotMutation(record))) {
      this.#syncFallbackSlot();
    }

    if (dirtyLabels && this.#labelDevice && this.#labels.some(label => label.parentElement === this)) {
      this.#prepareLabelCapture();
    }
    this.#requestRender();
  }

  #ownsNode(node: Node): boolean {
    const element = node instanceof Element ? node : node.parentElement;
    return element?.closest(Scene.metadata.tag) === this;
  }

  #getOwningLabel(node: Node): HTMLElement | undefined {
    const element = node instanceof Element ? node : node.parentElement;
    const label = element?.closest<HTMLElement>(LABEL_SELECTOR);
    return label?.parentElement === this ? label : undefined;
  }

  #isDirectNamedSlotMutation(record: MutationRecord): boolean {
    return (
      record.type === 'attributes' &&
      record.attributeName === 'slot' &&
      record.target instanceof HTMLElement &&
      record.target.parentElement === this
    );
  }

  #syncStructuralMutations(): void {
    this.#syncFallbackSlot();
    this.#refreshFrames();
    this.#refreshLayers();
    this.#refreshLabels();
    this.#loadLabelOverlayController();
    this.#syncLabelSlots();
    if (this.#labelDevice && this.#labels.some(label => label.parentElement === this)) this.#prepareLabelCapture();
    this.#requestRender();
  }

  #markMutationLabelsDirty(records: readonly MutationRecord[]): boolean {
    let dirtyLabels = false;
    for (const record of records) {
      const label = this.#getOwningLabel(record.target);
      if (!label) {
        continue;
      }
      this.#labelControllers.get(label)?.markDirty();
      dirtyLabels = true;
    }
    return dirtyLabels;
  }

  #syncFallbackSlot(): void {
    const fallback = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="fallback"]');
    const children = [...this.children];
    fallback?.assign(...children.filter(child => child.getAttribute('slot') === 'fallback'));
  }

  #handleResize(entries: ResizeObserverEntry[]): void {
    const entry = entries.find(candidate => candidate.target === this);
    if (entry) {
      const size = getDevicePixelSize(entry, scenePlatform.getDevicePixelRatio());
      this.#renderer.resize(size.width, size.height);
      this.#requestRender();
    }
    if (entries.some(candidate => this.#labels.some(label => getLabelChild(label) === candidate.target))) {
      entries.forEach(candidate => {
        const label = this.#labels.find(current => getLabelChild(current) === candidate.target);
        if (label) this.#labelControllers.get(label)?.markDirty();
      });
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
    this.#tickPerformance.backgroundSamples += 1;
    const background = scenePlatform.getComputedStyle(this).backgroundColor;
    const changed = this.#renderer.setBackgroundColor(background);
    this.#needsRender = this.#needsRender || changed;
  }

  #scheduleTick(): void {
    if (this.#tickHandle === undefined && this.isConnected) {
      this.#tickPerformance.animationFrameRequests += 1;
      this.#tickPerformance.parked = false;
      this.#tickHandle = scenePlatform.requestAnimationFrame(() => this.#tick());
    }
  }

  #requestRender(): void {
    this.#needsRender = true;
    this.#scheduleTick();
  }

  #tick(): void {
    this.#tickHandle = undefined;
    this.#tickPerformance.ticks += 1;
    if (!this.isConnected) {
      this.#tickPerformance.parked = true;
      return;
    }
    this.#sampleBackground();
    this.#trackCameraBehaviorChanges();
    this.#trackFrameChanges();
    this.#trackLayerChanges();
    if (this.#labelOverlay) this.#resolveSceneState();
    this.#syncOverlayLabels();
    this.#needsRender ||= this.#renderer.consumeRenderRequest();
    this.#renderIfNeeded();
    if (this.#shouldTickContinuously()) this.#scheduleTick();
    else this.#tickPerformance.parked = true;
  }

  #shouldTickContinuously(): boolean {
    return (
      this.#time === 'live' &&
      this.#frames.some(frame => isFrameStateRegistered(frame) && frameHasTimestampedSamples(frame))
    );
  }

  #renderIfNeeded(): void {
    if (!this.#needsRender || !this.#renderer.active) {
      return;
    }
    try {
      if (!this.#labelOverlay) this.#resolveSceneState();
      const viewProjection = this.#cameraViewProjection();
      const labels = this.#createTextureLabelItems(viewProjection);
      if (this.#renderer.render(this.#createRenderItems(), viewProjection, labels)) {
        this.#needsRender = false;
        this.#retireLabelTextures();
        this.#completeReadyCycle();
        this.#dispatchPendingCameraChange();
      }
    } catch (error) {
      this.#failWebGPU(error);
    }
  }

  #resolveSceneState(): void {
    this.#resolveFrames();
    this.#resolveCameraState();
  }

  #syncOverlayLabels(): void {
    const overlay = this.#labelOverlay;
    if (!overlay) return;
    overlay.synchronize(this.#cameraViewProjection(), this.getBoundingClientRect(), (label, slot) =>
      this.#disposeRemovedLabel(label, slot)
    );
    this.#labels = [...overlay.labels];
  }

  #completeReadyCycle(): void {
    if (this.#readyCycle.settled) {
      return;
    }
    this.#state = 'ready';
    this.#activeErrors.delete(WEBGPU_UNAVAILABLE);
    this.#activeErrors.delete(DEVICE_LOST);
    this.#readyCycle.resolve();
    this.dispatchEvent(new CustomEvent('nve-scene-ready', { bubbles: true, composed: true, cancelable: false }));
    this.requestUpdate();
  }

  #handleDeviceLost(info: SceneGPUDeviceLostInfo): void {
    this.#invalidatePicks(new DOMException('The WebGPU device was lost while picking.', 'AbortError'));
    this.#renderer.disconnect();
    this.#disposeLabelTextures();
    this.#labelDevice = undefined;
    this.#readyCycle.reject(new DOMException('The WebGPU device was lost.', 'AbortError'));
    this.#readyCycle = createReadyCycle();
    this.#state = 'failed';
    this.#requestRender();
    this.#dispatchError(DEVICE_LOST, info.message ?? 'The WebGPU device was lost.');
    this.requestUpdate();
  }

  #handleDeviceRecovered(lease: SharedDeviceLease): void {
    if (!this.isConnected) {
      return;
    }
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
    if (!this.isConnected) {
      return;
    }
    this.#state = 'failed';
    this.#readyCycle.reject(toNotSupportedError(error));
    this.requestUpdate();
  }

  #failWebGPU(error: unknown): void {
    this.#renderer.disconnect();
    this.#disposeLabelTextures();
    this.#labelDevice = undefined;
    this.#state = 'failed';
    this.#dispatchError(WEBGPU_UNAVAILABLE, getErrorMessage(error));
    this.#readyCycle.reject(toNotSupportedError(error));
    this.requestUpdate();
  }

  #dispatchError(code: string, message: string): void {
    if (this.#activeErrors.has(code)) {
      return;
    }
    this.#activeErrors.add(code);
    const detail: SceneErrorDetail = { code, message, element: this, severity: 'error' };
    console.error(`[${code}] ${message}`, this);
    this.dispatchEvent(
      new CustomEvent<SceneErrorDetail>('nve-scene-error', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail
      })
    );
  }

  #validateStaleAfterAttribute(): void {
    const source = this.getAttribute('stale-after');
    const value = source === null ? 1_000 : Number(source);
    if (Number.isFinite(value) && value >= 0) {
      this.#activeErrors.delete(SCENE_STALE_AFTER);
      return;
    }
    this.#dispatchWarning(
      SCENE_STALE_AFTER,
      'The stale-after attribute must be a finite nonnegative number; using 1000 milliseconds.'
    );
  }

  #dispatchWarning(code: string, message: string): void {
    if (this.#activeErrors.has(code)) {
      return;
    }
    this.#activeErrors.add(code);
    const detail: SceneErrorDetail = { code, message, element: this, severity: 'warning' };
    console.warn(`[${code}] ${message}`, this);
    this.dispatchEvent(
      new CustomEvent<SceneErrorDetail>('nve-scene-error', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail
      })
    );
  }

  #trackCameraBehaviorChanges(): void {
    this.#tickPerformance.cameraScans += 1;
    const signature = getSceneCameras(this)
      .map(behavior => {
        const contribution = sceneCameraController.getContribution(behavior);
        return contribution
          ? `${contribution.kind}:${contribution.fields.join(',')}:${JSON.stringify(contribution)}`
          : '';
      })
      .join('|');
    if (signature !== this.#cameraBehaviorSignature) {
      this.#cameraBehaviorSignature = signature;
      this.#needsRender = true;
    }
  }

  #resolveCameraState(): void {
    const contributions = this.#resolveCameraBehaviorContributions();
    this.#cameraBehaviors = contributions;
    this.#cameraContributions = contributions.map(entry => entry.contribution);
    const stateContributions = contributions.map(entry => this.#toCameraContribution(entry));
    this.#cameraState = resolveCameraState({
      prior: this.#cameraState,
      contributions: stateContributions
    });
  }

  #resolveCameraBehaviorContributions(): ResolvedCameraBehavior[] {
    const behaviors = getSceneCameras(this);
    const configured = behaviors
      .map(behavior => ({ behavior, contribution: sceneCameraController.getContribution(behavior) }))
      .filter(
        (entry): entry is { behavior: SceneCamera; contribution: CameraBehaviorContribution } =>
          entry.contribution !== null
      );
    for (const entry of configured) {
      if (entry.contribution.kind === 'follow') {
        sceneCameraController.setFrameResolved(
          entry.behavior,
          getNamedSceneFrame(this, entry.contribution.frame) !== undefined
        );
      } else {
        sceneCameraController.setFrameResolved(entry.behavior, true);
      }
    }
    const resolvable = configured.filter(entry => sceneCameraController.isResolvable(entry.behavior));
    const conflicted = getConflictedCameraBehaviors(resolvable);
    const active = this.#assignOrbitTargetFields(resolvable.filter(entry => !conflicted.has(entry.behavior)));
    for (const behavior of behaviors) sceneCameraController.setConflict(behavior, conflicted.has(behavior));
    return active;
  }

  #toCameraContribution(entry: ResolvedCameraBehavior): CameraContribution {
    const { contribution } = entry;
    if (contribution.kind === 'orbit') return this.#toOrbitCameraContribution(contribution);
    if (contribution.kind === 'top') return this.#toTopCameraContribution(contribution);
    return this.#toFollowCameraContribution(contribution);
  }

  #toOrbitCameraContribution(contribution: Extract<CameraBehaviorContribution, { kind: 'orbit' }>): CameraContribution {
    const target = this.#getOrbitTargetPatch(contribution);
    return {
      fields: contribution.fields,
      patch: {
        ...(target ? { target } : {}),
        offset: { distance: contribution.distance, phi: contribution.phi, theta: contribution.theta },
        projection: contribution.projection
      }
    };
  }

  #toTopCameraContribution(contribution: Extract<CameraBehaviorContribution, { kind: 'top' }>): CameraContribution {
    return {
      fields: contribution.fields,
      patch: {
        target: contribution.target,
        offset: { distance: contribution.height, phi: 0, theta: 0 },
        projection: { mode: 'ortho', frustumHeight: contribution.height }
      }
    };
  }

  #toFollowCameraContribution(
    contribution: Extract<CameraBehaviorContribution, { kind: 'follow' }>
  ): CameraContribution {
    const frame = getNamedSceneFrame(this, contribution.frame);
    if (!frame) return { fields: contribution.fields, patch: {} };
    const matrix = getFrameWorldMatrix(frame);
    return {
      fields: contribution.fields,
      patch: {
        target: {
          position: [matrix[12] ?? 0, matrix[13] ?? 0, matrix[14] ?? 0],
          ...(contribution.mode === 'pose' ? { heading: Math.atan2(matrix[1] ?? 0, matrix[0] ?? 1) } : {})
        }
      }
    };
  }

  #assignOrbitTargetFields(contributions: readonly ResolvedCameraBehavior[]): ResolvedCameraBehavior[] {
    const owned = new Set(
      contributions.filter(entry => entry.contribution.kind !== 'orbit').flatMap(entry => entry.contribution.fields)
    );
    return contributions.map(entry =>
      entry.contribution.kind === 'orbit'
        ? {
            behavior: entry.behavior,
            contribution: {
              ...entry.contribution,
              fields: [
                ...entry.contribution.fields,
                ...(!owned.has('target.position') ? (['target.position'] as const) : []),
                ...(!owned.has('target.heading') ? (['target.heading'] as const) : [])
              ]
            }
          }
        : entry
    );
  }

  #getOrbitTargetPatch(
    contribution: Extract<CameraBehaviorContribution, { kind: 'orbit' }>
  ): Partial<CameraTarget> | undefined {
    const position = contribution.fields.includes('target.position') ? contribution.target.position : undefined;
    const heading = contribution.fields.includes('target.heading') ? contribution.target.heading : undefined;
    return position || heading !== undefined
      ? { ...(position ? { position } : {}), ...(heading !== undefined ? { heading } : {}) }
      : undefined;
  }

  #cameraViewProjection(): Float32Array {
    const rect = this.getBoundingClientRect();
    return createCameraViewProjection(this.#cameraState, Math.max(rect.width, 1) / Math.max(rect.height, 1));
  }

  #getInteractiveOrbit(): Extract<CameraBehaviorContribution, { kind: 'orbit' }> | undefined {
    if (this.#getInteractiveTop()) return undefined;
    const orbit = this.#cameraContributions.find(
      (contribution): contribution is Extract<CameraBehaviorContribution, { kind: 'orbit' }> =>
        contribution.kind === 'orbit'
    );
    return (
      orbit ??
      (this.#cameraContributions.length === 0
        ? {
            fields: ['offset.distance', 'offset.phi', 'offset.theta'],
            kind: 'orbit',
            distance: DEFAULT_CAMERA_STATE.offset.distance,
            minDistance: 0.5,
            maxDistance: 200,
            phi: DEFAULT_CAMERA_STATE.offset.phi,
            projection: DEFAULT_CAMERA_STATE.projection,
            target: DEFAULT_CAMERA_STATE.target,
            theta: DEFAULT_CAMERA_STATE.offset.theta
          }
        : undefined)
    );
  }

  #getInteractiveTop(): Extract<CameraBehaviorContribution, { kind: 'top' }> | undefined {
    return this.#cameraContributions.find(
      (contribution): contribution is Extract<CameraBehaviorContribution, { kind: 'top' }> =>
        contribution.kind === 'top'
    );
  }

  #hasTargetOwner(): boolean {
    return this.#cameraContributions.some(
      contribution => contribution.kind === 'follow' && contribution.fields.includes('target.position')
    );
  }

  #panCameraByPixels(
    rightPixels: number,
    forwardPixels: number,
    top: Extract<CameraBehaviorContribution, { kind: 'top' }> | undefined
  ): CameraState {
    const next = copyCameraState(this.#cameraState);
    const rect = this.#canvas?.getBoundingClientRect();
    const height = Math.max(rect?.height ?? 0, 1);
    const scale = top
      ? (next.projection.mode === 'ortho' ? next.projection.frustumHeight : top.height) / height
      : (2 * next.offset.distance * Math.tan(next.projection.mode === 'perspective' ? next.projection.fovy / 2 : 0.5)) /
        height;
    const azimuth = next.target.heading + next.offset.theta;
    const right: [number, number] = [-Math.sin(azimuth), Math.cos(azimuth)];
    const forward: [number, number] = [Math.cos(azimuth), Math.sin(azimuth)];
    next.target.position[0] += (right[0] * rightPixels + forward[0] * forwardPixels) * scale;
    next.target.position[1] += (right[1] * rightPixels + forward[1] * forwardPixels) * scale;
    return next;
  }

  #setUserCameraState(state: CameraState, source: CameraChangeSource): void {
    this.#syncUserCameraStateToBehaviors(state);
    this.#cameraState = copyCameraState(state);
    this.#pendingCameraChange = { source, state: copyCameraState(state) };
    this.#requestRender();
  }

  #syncUserCameraStateToBehaviors(state: CameraState): void {
    for (const { behavior, contribution } of this.#cameraBehaviors) {
      if (contribution.kind === 'orbit') {
        behavior.distance = state.offset.distance;
        behavior.phi = state.offset.phi;
        behavior.theta = state.offset.theta;
        behavior.projection = state.projection.mode;
        if (state.projection.mode === 'perspective') behavior.fovy = state.projection.fovy;
        else behavior.frustumHeight = state.projection.frustumHeight;
        this.#syncUserCameraTarget(behavior, contribution.fields, state.target);
      } else if (contribution.kind === 'top') {
        behavior.height = state.projection.mode === 'ortho' ? state.projection.frustumHeight : state.offset.distance;
        this.#syncUserCameraTarget(behavior, contribution.fields, state.target);
      }
    }
  }

  #syncUserCameraTarget(behavior: SceneCamera, fields: readonly CameraField[], target: CameraTarget): void {
    if (fields.includes('target.position')) behavior.target = [...target.position];
    if (fields.includes('target.heading')) behavior.heading = target.heading;
  }

  #dispatchPendingCameraChange(): void {
    const pending = this.#pendingCameraChange;
    this.#pendingCameraChange = undefined;
    if (!pending) return;
    this.dispatchEvent(
      new CustomEvent<SceneCameraChangeDetail>('nve-scene-camerachange', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { cameraState: copyCameraState(pending.state), source: pending.source }
      })
    );
  }

  #isCurrentConnection(token: number): boolean {
    return this.isConnected && token === this.#connectionToken;
  }

  #refreshFrames(): void {
    this.#frames = [...this.querySelectorAll<HTMLElement>('nve-scene-frame')].filter(
      frame => frame.closest(Scene.metadata.tag) === this
    );
  }

  #refreshLayers(): void {
    this.#layers = [...this.querySelectorAll<HTMLElement>(RENDERABLE_LAYER_SELECTOR)].filter(
      layer => layer.closest(Scene.metadata.tag) === this
    );
  }

  #refreshLabels(): void {
    this.#labelOverlay?.refresh();
    if (this.#labelOverlay) {
      this.#labels = [...this.#labelOverlay.labels];
      this.#observeResize();
      return;
    }
    this.#labels = [...this.querySelectorAll<HTMLElement>(LABEL_SELECTOR)].filter(
      label => label.closest(Scene.metadata.tag) === this
    );
    this.#observeResize();
  }

  #syncLabelSlots(): void {
    if (this.#labelOverlay) {
      this.#labelOverlay.syncSlots((label, slot) => this.#disposeRemovedLabel(label, slot));
    }
  }

  #disposeRemovedLabel(label: HTMLElement, slot: HTMLSlotElement): void {
    this.#moveLabelSlotToOverlay(slot);
    this.#labelControllers.get(label)?.dispose();
    this.#labelControllers.delete(label);
    this.#textureSlotPool.delete(label);
    this.#labelOcclusion.delete(label);
  }

  // eslint-disable-next-line max-statements -- The complete probe owns disposable DOM, GPU, and failure cleanup.
  async #probeLabelCapture(device: SceneGPUDevice): Promise<void> {
    const canvas = this.#canvas;
    if (!canvas) return;
    const token = this.#connectionToken;
    const source = globalThis.document.createElement('nve-scene-label');
    const child = globalThis.document.createElement('div');
    const control = globalThis.document.createElement('input');
    const slot = globalThis.document.createElement('slot');
    markLabelProbe(source);
    child.style.cssText = 'display:block;width:2px;height:2px;background:rgb(255 0 255)';
    control.setAttribute('aria-label', 'Label capture focus probe');
    control.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;border:0';
    control.value = 'probe';
    child.append(control);
    source.append(child);
    try {
      this.append(source);
      slot.assign(source);
      Reflect.set(canvas, 'layoutsubtree', true);
      canvas.append(slot);
      await waitForLabelProbePaint();
      let verifiedSignature: Extract<LabelCaptureCapabilities, { available: true }>['copySignature'];
      const capabilities = await getLabelCaptureCapabilities({
        device,
        realm: globalThis,
        verifyCopy: async signature => {
          const copied = await verifyLabelBrowserCopy({ device, signature, slot });
          if (copied) verifiedSignature = signature;
          return copied;
        },
        verifyLayoutSubtreeSlotCapture: () => this.#verifyLabelSlotCapture(canvas, slot, source, child),
        verifyMutationPaint: () => this.#verifyLabelMutationPaint(canvas, child),
        verifyFocus: () => this.#verifyLabelFocusCapture(source, control),
        verifyTransform: () => this.#verifyLabelTransform(slot, device, verifiedSignature)
      });
      if (this.#isCurrentConnection(token) && this.#labelDevice === device) {
        this.#labelCaptureCapabilities = capabilities;
      }
    } catch {
      if (this.#isCurrentConnection(token) && this.#labelDevice === device) {
        this.#labelCaptureCapabilities = { available: false };
      }
    } finally {
      slot.remove();
      source.remove();
    }
    if (this.#isCurrentConnection(token) && this.#labelDevice === device) this.#requestRender();
  }

  // eslint-disable-next-line max-params -- The probe verifies the exact host, slot, and boxed-child topology.
  #verifyLabelSlotCapture(
    canvas: HTMLCanvasElement,
    slot: HTMLSlotElement,
    source: HTMLElement,
    child: HTMLElement
  ): boolean {
    return (
      canvas.contains(slot) &&
      slot.parentElement === canvas &&
      slot.assignedElements()[0] === source &&
      'layoutsubtree' in canvas &&
      scenePlatform.getComputedStyle(source).display === 'contents' &&
      child.getBoundingClientRect().width > 0 &&
      child.getBoundingClientRect().height > 0
    );
  }

  #verifyLabelMutationPaint(canvas: HTMLCanvasElement, child: HTMLElement): Promise<boolean> {
    const before = child.getBoundingClientRect().width;
    return waitForLabelMutationPaint(canvas, () => {
      child.style.width = '3px';
    }).then(painted => painted && child.getBoundingClientRect().width > before);
  }

  #verifyLabelFocusCapture(source: HTMLElement, control: HTMLInputElement): boolean {
    const previous = globalThis.document.activeElement;
    try {
      control.focus();
      control.select();
      return (
        globalThis.document.activeElement === control &&
        source.matches(':focus-within') &&
        control.selectionStart === 0 &&
        control.selectionEnd === control.value.length
      );
    } finally {
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    }
  }

  async #verifyLabelTransform(
    slot: HTMLSlotElement,
    device: SceneGPUDevice,
    signature: Extract<LabelCaptureCapabilities, { available: true }>['copySignature'] | undefined
  ): Promise<boolean> {
    if (!signature) return false;
    const before = slot.getBoundingClientRect();
    slot.style.transform = 'translate(1px, 1px)';
    await waitForLabelProbePaint();
    const after = slot.getBoundingClientRect();
    return (
      slot.style.transform === 'translate(1px, 1px)' &&
      (after.x !== before.x || after.y !== before.y || (before.width === 0 && after.width === 0)) &&
      verifyLabelBrowserCopy({ device, signature, slot })
    );
  }

  #createTextureLabelItems(viewProjection: Float32Array): LabelTextureRenderItem[] {
    if (!this.#labelCaptureCapabilities.available || !this.#labelDevice) return [];
    const rect = this.getBoundingClientRect();
    return this.#labels.flatMap(label => this.#createTextureLabelItem(label, rect, viewProjection));
  }

  // eslint-disable-next-line max-statements, complexity, max-lines-per-function -- Capture promotion bridges DOM state, texture lifetime, and GPU item creation.
  #createTextureLabelItem(
    label: HTMLElement,
    viewport: DOMRect,
    _viewProjection: Float32Array
  ): LabelTextureRenderItem[] {
    const slot = this.#labelOverlay?.getSlot(label);
    const child = getLabelChild(label);
    if (!slot || !child || !this.#labelOverlay?.isProjected(label)) {
      if (slot) this.#setLabelOverlayState(label);
      return [];
    }
    const controller = this.#getLabelTextureController(label, slot);
    controller.setFocused(label.matches(':focus-within'));
    if (consumeLabelDirty(label)) controller.markDirty();
    controller.setSize({
      height: Math.round(child.offsetHeight * scenePlatform.getDevicePixelRatio()),
      width: Math.round(child.offsetWidth * scenePlatform.getDevicePixelRatio())
    });
    if (controller.needsCapture) this.#moveLabelSlotToCanvas(label, slot);
    const update = controller.update();
    if (update.kind === 'fallback') {
      if (update.warning) this.#dispatchLabelTextureFallback(label);
      this.#moveLabelSlotToOverlay(slot);
      return [];
    }
    if (!update.texture) {
      this.#moveLabelSlotToOverlay(slot);
      return [];
    }
    const bounds = slot.getBoundingClientRect();
    const tracker = this.#labelOcclusion.get(label) ?? new LabelOcclusionTracker();
    tracker.setTextureMode(true);
    this.#labelOcclusion.set(label, tracker);
    setLabelSceneState(label, {
      occluded: tracker.occluded,
      stale: label.hasAttribute('stale')
    });
    return [
      {
        texture: update.texture,
        quad: {
          bottom: 1 - ((bounds.bottom - viewport.top) / viewport.height) * 2,
          depth: this.#labelOverlay.getDepth(label) ?? 0.5,
          left: ((bounds.left - viewport.left) / viewport.width) * 2 - 1,
          right: ((bounds.right - viewport.left) / viewport.width) * 2 - 1,
          top: 1 - ((bounds.top - viewport.top) / viewport.height) * 2
        },
        onOcclusionSamples: samples => {
          const occluded = tracker.recordOcclusionSamples(samples);
          slot.style.pointerEvents = tracker.pointerEnabled ? 'auto' : 'none';
          setLabelSceneState(label, {
            occluded,
            stale: label.hasAttribute('stale')
          });
          if (tracker.needsSample) this.#requestRender();
        }
      }
    ];
  }

  #getLabelTextureController(label: HTMLElement, slot: HTMLSlotElement): LabelTextureController<SceneGPUTexture> {
    const current = this.#labelControllers.get(label);
    if (current) return current;
    const device = this.#labelDevice;
    const signature = this.#labelCaptureCapabilities.available
      ? this.#labelCaptureCapabilities.copySignature
      : undefined;
    if (!device || !signature || !device.createTexture)
      throw new DOMException('Label capture is unavailable.', 'NotSupportedError');
    const controller = new LabelTextureController<SceneGPUTexture>({
      copy: (texture, size) => {
        const testingCopy = this.#getLabelTesting()?.copy;
        if (testingCopy) {
          testingCopy({ size, slot });
          return;
        }
        const copy = Reflect.get(device.queue, 'copyElementImageToTexture');
        if (typeof copy !== 'function') throw new DOMException('Label copy is unavailable.', 'NotSupportedError');
        copyLabelElementImage(signature, {
          copy: (...arguments_) => Reflect.apply(copy, device.queue, arguments_),
          destination: { texture },
          height: size.height,
          source: slot,
          width: size.width
        });
      },
      create: size =>
        device.createTexture!({
          format: 'rgba8unorm-srgb',
          size: { height: size.height, width: size.width },
          usage: 0x02 | 0x04 | 0x10
        }),
      destroy: texture => texture.destroy?.()
    });
    this.#labelControllers.set(label, controller);
    return controller;
  }

  #moveLabelSlotToCanvas(label: HTMLElement, slot: HTMLSlotElement): void {
    const canvas = this.#canvas;
    if (!canvas || slot.parentElement === canvas) return;
    canvas.append(slot);
    canvas.removeAttribute('aria-hidden');
    this.#textureSlotPool.set(label, slot);
  }

  #moveLabelSlotToOverlay(slot: HTMLSlotElement): void {
    const overlay = this.renderRoot.querySelector<HTMLElement>('.overlay');
    if (overlay && slot.parentElement !== overlay) overlay.append(slot);
    slot.style.pointerEvents = 'auto';
    if (this.#canvas && !this.#canvas.querySelector('slot')) this.#canvas.setAttribute('aria-hidden', 'true');
  }

  #setLabelOverlayState(label: HTMLElement): void {
    this.#labelOcclusion.get(label)?.setTextureMode(false);
    setLabelSceneState(label, {
      occluded: false,
      stale: label.hasAttribute('stale')
    });
  }

  #retireLabelTextures(): void {
    const completion = this.#labelDevice?.queue.onSubmittedWorkDone?.();
    if (completion) this.#labelControllers.forEach(controller => controller.retireAfterSubmission(completion));
  }

  #disposeLabelTextures(): void {
    for (const [label, controller] of this.#labelControllers) {
      controller.dispose();
      const slot = this.#labelOverlay?.getSlot(label);
      if (slot) this.#moveLabelSlotToOverlay(slot);
      this.#setLabelOverlayState(label);
    }
    this.#labelControllers.clear();
    this.#textureSlotPool.clear();
    this.#blockedLabelPointers.clear();
    this.#labelCaptureCapabilities = { available: false };
    this.#labelProbedDevice = undefined;
    this.#labelFallbackDiagnostics = new WeakMap<HTMLElement, Set<string>>();
  }

  #dispatchLabelTextureFallback(label: HTMLElement): void {
    const message = 'The label texture capture failed repeatedly; the overlay remains active.';
    const activeCodes = this.#labelFallbackDiagnostics.get(label) ?? new Set<string>();
    if (activeCodes.has(LABEL_TEXTURE_FALLBACK)) return;
    activeCodes.add(LABEL_TEXTURE_FALLBACK);
    this.#labelFallbackDiagnostics.set(label, activeCodes);
    console.warn(`[${LABEL_TEXTURE_FALLBACK}] ${message}`, label);
    label.dispatchEvent(
      new CustomEvent<SceneErrorDetail>('nve-scene-error', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { code: LABEL_TEXTURE_FALLBACK, element: label, message, severity: 'warning' }
      })
    );
  }

  #trackFrameChanges(): void {
    this.#tickPerformance.frameScans += 1;
    for (const frame of this.#frames) {
      if (!isFrameStateRegistered(frame)) continue;
      const version = getFrameVersion(frame);
      if (this.#frameVersions.get(frame) !== version) {
        this.#frameVersions.set(frame, version);
        this.#needsRender = true;
      }
      if (this.#time === 'live' && frameHasTimestampedSamples(frame)) {
        this.#needsRender = true;
      }
    }
  }

  // eslint-disable-next-line max-statements -- One scan dispatches every supported internal layer kind.
  #trackLayerChanges(): void {
    this.#tickPerformance.layerScans += 1;
    for (const layer of this.#layers) {
      if (layer.matches(HEIGHTFIELD_LAYER_SELECTOR)) {
        this.#trackHeightfieldLayerChange(layer);
        continue;
      }
      if (layer.matches(MESH_LAYER_SELECTOR)) {
        this.#trackMeshLayerChange(layer);
        continue;
      }
      if (layer.matches(MODEL_LAYER_SELECTOR)) {
        this.#trackModelLayerChange(layer);
        continue;
      }
      if (isMarkerLayerRegistered(layer)) {
        this.#trackMarkerLayerChange(layer);
        continue;
      }
      if (isStreamingLayerRegistered(layer)) {
        this.#trackStreamingLayerChange(layer);
      }
    }
  }

  #trackHeightfieldLayerChange(layer: HTMLElement): void {
    if (!isHeightfieldLayerRegistered(layer)) return;
    const version = getHeightfieldLayerVersion(layer);
    if (this.#heightfieldVersions.get(layer) !== version) {
      this.#heightfieldVersions.set(layer, version);
      this.#needsRender = true;
    }
  }

  #trackMeshLayerChange(layer: HTMLElement): void {
    const version = getMeshLayerVersion(layer);
    if (this.#meshVersions.get(layer) !== version) {
      this.#meshVersions.set(layer, version);
      this.#needsRender = true;
    }
    // Meshes are marker layers too: streamed instance updates must request a
    // frame without consuming their ranges while the mesh remains hidden.
    if (isMarkerLayerRegistered(layer)) {
      this.#trackMarkerLayerChange(layer);
    }
  }

  #trackModelLayerChange(layer: HTMLElement): void {
    if (!isModelLayerRegistered(layer)) return;
    const version = getModelLayerVersion(layer);
    if (this.#modelVersions.get(layer) !== version) {
      this.#modelVersions.set(layer, version);
      this.#needsRender = true;
    }
    // Models are marker layers too: instance updates request a frame while a
    // hidden model retains its upload ranges.
    if (isMarkerLayerRegistered(layer)) {
      this.#trackMarkerLayerChange(layer);
    }
  }

  #trackMarkerLayerChange(layer: HTMLElement): void {
    const version = getMarkerLayerVersion(layer);
    if (this.#layerVersions.get(layer) !== version) {
      this.#layerVersions.set(layer, version);
      this.#needsRender = true;
    }
  }

  #trackStreamingLayerChange(layer: HTMLElement): void {
    const version = getStreamingLayerVersion(layer);
    const config = getStreamRenderConfig(layer, getStreamingLayerKind(layer));
    if (this.#layerVersions.get(layer) !== version || this.#streamRenderConfig.get(layer) !== config) {
      this.#layerVersions.set(layer, version);
      this.#streamRenderConfig.set(layer, config);
      this.#needsRender = true;
    }
  }

  #createRenderItems(): SceneRenderItem[] {
    return this.#layers.flatMap<SceneRenderItem>(layer => {
      if (layer.closest('[hidden]') !== null) return [];
      const mesh = this.#createMeshRenderItem(layer);
      if (mesh) return [mesh];
      if (isMarkerLayerRegistered(layer)) {
        return [{ data: takeMarkerLayerRenderData(layer), frameMatrix: getOwningFrameMatrix(layer), layer }];
      }
      if (!isStreamingLayerRegistered(layer)) {
        return [];
      }
      const data = takeStreamingLayerRenderData(layer);
      const frameMatrix = getOwningFrameMatrix(layer);
      if (data.kind === 'point') {
        return [
          {
            data,
            frameMatrix,
            layer,
            size: getLayerNumber(layer, 'size', 3),
            sizeUnit: Reflect.get(layer, 'sizeUnit') === 'world' ? 'world' : 'pixel',
            type: 'point'
          }
        ];
      }
      if (data.kind === 'line') {
        return [
          {
            data,
            frameMatrix,
            layer,
            topology: data.topology,
            type: 'line',
            widthUnit: data.widthUnit
          }
        ];
      }
      return [{ data, frameMatrix, layer, type: 'triangle' }];
    });
  }

  #createMeshRenderItem(layer: HTMLElement): MeshRenderItem | undefined {
    if (layer.matches(HEIGHTFIELD_LAYER_SELECTOR)) {
      if (!isHeightfieldLayerRegistered(layer)) return undefined;
      return {
        data: takeHeightfieldLayerRenderData(layer),
        frameMatrix: getOwningFrameMatrix(layer),
        instances: undefined,
        layer,
        type: 'mesh'
      };
    }
    if (layer.matches(MODEL_LAYER_SELECTOR)) {
      if (!isModelLayerRegistered(layer)) return undefined;
      return {
        data: takeModelLayerRenderData(layer),
        frameMatrix: getOwningFrameMatrix(layer),
        instances: isMarkerLayerRegistered(layer) ? takeMarkerLayerRenderData(layer) : undefined,
        layer,
        type: 'mesh'
      };
    }
    if (!layer.matches(MESH_LAYER_SELECTOR)) return undefined;
    return {
      data: takeMeshLayerRenderData(layer),
      frameMatrix: getOwningFrameMatrix(layer),
      instances: isMarkerLayerRegistered(layer) ? takeMarkerLayerRenderData(layer) : undefined,
      layer,
      type: 'mesh'
    };
  }

  #resolveFrames(): void {
    const sceneTime = this.#time === 'live' ? getLiveSceneTime() : this.#time;
    setSceneSampledTime(this, sceneTime);
    this.#updateNamedFrames();
    for (const frame of this.#frames) {
      if (!isFrameStateRegistered(frame)) continue;
      resolveFrameForScene(frame, sceneTime, this.#staleAfter);
    }
  }

  #updateNamedFrames(): void {
    const registeredFrames = this.#frames.filter(isFrameStateRegistered);
    const { duplicates, unique } = classifyFrameNames(registeredFrames);
    for (const frame of duplicates) {
      if (!this.#duplicateFrames.has(frame)) {
        this.#dispatchFrameNameWarning(frame, getFrameName(frame));
      }
    }
    this.#duplicateFrames = duplicates;
    setSceneNamedFrames(this, unique);
  }

  #dispatchFrameNameWarning(frame: HTMLElement, name: string): void {
    const detail: SceneErrorDetail = {
      code: FRAME_NAME_DUPLICATE,
      message: `More than one scene frame uses the name "${name}".`,
      element: frame,
      severity: 'warning'
    };
    console.warn(`[${detail.code}] ${detail.message}`, frame);
    frame.dispatchEvent(
      new CustomEvent<SceneErrorDetail>('nve-scene-error', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail
      })
    );
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'WebGPU is unavailable.';
}

function getLabelElementChildren(label: HTMLElement): HTMLElement[] {
  return [...label.children].filter((child): child is HTMLElement => child instanceof HTMLElement);
}

function getLabelChild(label: HTMLElement): HTMLElement | undefined {
  return getLabelElementChildren(label)[0];
}

async function waitForLabelProbePaint(): Promise<void> {
  await new Promise<void>(resolve => globalThis.requestAnimationFrame(() => resolve()));
  await new Promise<void>(resolve => globalThis.requestAnimationFrame(() => resolve()));
}

function getCanvasDevicePixel(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): { readonly x: number; readonly y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((clientX - rect.left) * (canvas.width / Math.max(rect.width, 1))),
    y: Math.floor((clientY - rect.top) * (canvas.height / Math.max(rect.height, 1)))
  };
}

function toNotSupportedError(error: unknown): DOMException {
  return error instanceof DOMException && error.name === 'NotSupportedError'
    ? error
    : new DOMException(getErrorMessage(error), 'NotSupportedError');
}

function getDevicePixelSize(entry: ResizeObserverEntry, devicePixelRatio: number): { width: number; height: number } {
  const fallback = {
    width: entry.contentRect.width * devicePixelRatio,
    height: entry.contentRect.height * devicePixelRatio
  };
  const devicePixels = entry.devicePixelContentBoxSize?.[0];
  return devicePixels && sizesApproximatelyEqual(devicePixels, fallback)
    ? { width: devicePixels.inlineSize, height: devicePixels.blockSize }
    : fallback;
}

function sizesApproximatelyEqual(
  devicePixels: ResizeObserverSize,
  fallback: { width: number; height: number }
): boolean {
  return (
    Math.abs(devicePixels.inlineSize - fallback.width) <= 1 && Math.abs(devicePixels.blockSize - fallback.height) <= 1
  );
}

function assertNonnegativeNumber(value: number, name: string): void {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number.`);
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be finite and nonnegative.`);
  }
}

function assertSceneTime(value: 'live' | number): void {
  if (value !== 'live' && typeof value !== 'number') {
    throw new TypeError('Scene time must be "live" or a number.');
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new RangeError('Scene time must be finite.');
  }
}

function assertFiniteCoordinate(value: number, name: string): void {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number.`);
  }
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite.`);
  }
}

function isSameHoverTarget(previous: PickHit | null, next: PickHit | null): boolean {
  return (
    previous?.element === next?.element &&
    previous?.layer === next?.layer &&
    previous?.instanceIndex === next?.instanceIndex
  );
}

function pointerCameraSource(event: PointerEvent): Extract<CameraChangeSource, 'pointer' | 'touch'> {
  return event.pointerType === 'touch' ? 'touch' : 'pointer';
}

function createSyntheticPointerEvent(
  type: string,
  source: PointerEvent | KeyboardEvent,
  options: { bubbles: boolean; cancelable: boolean }
): PointerEvent {
  return new PointerEvent(type, {
    bubbles: options.bubbles,
    cancelable: options.cancelable,
    composed: true,
    altKey: source.altKey,
    button: source instanceof PointerEvent ? source.button : 0,
    buttons: source instanceof PointerEvent ? source.buttons : 0,
    clientX: source instanceof PointerEvent ? source.clientX : 0,
    clientY: source instanceof PointerEvent ? source.clientY : 0,
    ctrlKey: source.ctrlKey,
    metaKey: source.metaKey,
    pointerId: source instanceof PointerEvent ? source.pointerId : 0,
    pointerType: source instanceof PointerEvent ? source.pointerType : '',
    pressure: source instanceof PointerEvent ? source.pressure : 0,
    screenX: source instanceof PointerEvent ? source.screenX : 0,
    screenY: source instanceof PointerEvent ? source.screenY : 0,
    shiftKey: source.shiftKey
  });
}

function createPickEvent(
  type: 'nve-scene-pick' | 'nve-scene-pickenter' | 'nve-scene-pickleave',
  hit: PickHit
): CustomEvent<PickHit> {
  return new CustomEvent<PickHit>(type, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: copyPickHit({
      layer: hit.layer as HTMLElement,
      marker: hit.element === hit.layer ? undefined : (hit.element as HTMLElement),
      instanceIndex: hit.instanceIndex,
      worldPosition: hit.worldPosition as Vec3
    })
  });
}

function classifyFrameNames(frames: readonly HTMLElement[]): {
  duplicates: Set<HTMLElement>;
  unique: Map<string, HTMLElement>;
} {
  const framesByName = new Map<string, HTMLElement[]>();
  for (const frame of frames) {
    const name = getFrameName(frame);
    if (name) {
      framesByName.set(name, [...(framesByName.get(name) ?? []), frame]);
    }
  }

  const duplicates = new Set<HTMLElement>();
  const unique = new Map<string, HTMLElement>();
  for (const [name, namedFrames] of framesByName) {
    if (namedFrames.length === 1 && namedFrames[0]) {
      unique.set(name, namedFrames[0]);
    } else {
      namedFrames.forEach(frame => duplicates.add(frame));
    }
  }
  return { duplicates, unique };
}

function getConflictedCameraBehaviors(
  entries: readonly { behavior: SceneCamera; contribution: CameraBehaviorContribution }[]
): Set<SceneCamera> {
  const owners = new Map<CameraField, SceneCamera[]>();
  for (const entry of entries) {
    for (const field of entry.contribution.fields) {
      owners.set(field, [...(owners.get(field) ?? []), entry.behavior]);
    }
  }
  const conflicted = new Set<SceneCamera>();
  for (const elements of owners.values()) {
    if (elements.length > 1) elements.forEach(element => conflicted.add(element));
  }
  return conflicted;
}

function getSceneCameras(scene: HTMLElement): SceneCamera[] {
  return [...scene.querySelectorAll('nve-scene-camera')].filter(
    (element): element is SceneCamera => element instanceof SceneCamera && element.closest('nve-scene') === scene
  );
}

function getOwningFrameMatrix(layer: HTMLElement): Float32Array {
  const frame = layer.closest<HTMLElement>('nve-scene-frame');
  return frame ? getFrameWorldMatrix(frame) : identityMat4();
}

function getLayerNumber(layer: HTMLElement, name: 'size', fallback: number): number {
  const value = Reflect.get(layer, name);
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function getStreamRenderConfig(layer: HTMLElement, kind: StreamingLayerRenderData['kind']): string {
  if (kind === 'point') {
    return `${String(getLayerNumber(layer, 'size', 3))}:${String(Reflect.get(layer, 'sizeUnit'))}`;
  }
  if (kind === 'line') {
    return `${String(Reflect.get(layer, 'topology'))}:${String(Reflect.get(layer, 'widthUnit'))}`;
  }
  return '';
}
