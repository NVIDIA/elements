// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { attachInternals, useStyles } from '@nvidia-elements/core/internal';
import { html, LitElement } from 'lit';
import { DEVICE_LOST, WEBGPU_UNAVAILABLE, type SceneErrorCode } from '../errors.js';
import { diagnosticReporterService } from '../internal/services/diagnostic-reporter.service.js';
import {
  sharedDeviceService,
  type SharedDeviceLease,
  type SharedDeviceListener
} from '../internal/services/shared-device.service.js';
import { scenePlatform, type SceneGPUDeviceLostInfo } from '../internal/gpu/platform.js';
import { registerSceneRenderNotifications } from '../internal/scene/notifications.js';
import type { SceneCameraState } from '../internal/math/camera.js';
import type { ScenePickHit } from '../internal/pick/routing.js';
import { CameraController } from '../internal/camera/camera.controller.js';
import { PickController } from '../internal/pick/pick.controller.js';
import { SceneRenderer } from '../internal/rendering/renderer.js';
import { SceneContent } from '../internal/scene/content.js';
import { createReadyCycle, type ReadyCycle } from '../internal/scene/ready-cycle.js';
import styles from './scene.css?inline';
import { invertPreciseMat4, multiplyMat4Vec4 } from '../internal/math/mat4.js';
import type { Matrix4, Vec3 } from '../internal/types.js';
import { getDevicePixelSize } from '../internal/device/index.js';

export type { ScenePickHit, ScenePickTarget } from '../internal/pick/routing.js';
export type { SceneErrorCode, SceneErrorDetail } from '../errors.js';
export type { SceneCameraProjection, SceneCameraState, SceneCameraChangeDetail } from '../internal/math/camera.js';
export type { ScenePose } from '../internal/types.js';

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
 * @description A visual scene component.
 * @documentation https://nvidia.github.io/elements/docs/scene/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/scene
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 * @property ready - Resolves after the scene submits the first frame of the current initialization or recovery cycle.
 * @event {ScenePickHit} nve-scene-click - Dispatched when pointer activation resolves to scene geometry.
 * @event {ScenePickHit} nve-scene-pointerenter - Dispatched when the pointer enters resolved scene geometry.
 * @event {ScenePickHit} nve-scene-pointerleave - Dispatched when the pointer leaves resolved scene geometry.
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
    this.#picking = new PickController({
      host: this,
      driver: this.#renderer.pick.bind(this.#renderer),
      hasInteractiveTargets: () => this.#content.hasInteractiveTargets()
    });
    this.#camera = new CameraController({
      host: this,
      requestRender: () => this.#requestRender()
    });
    registerSceneRenderNotifications(this, (source, kind) => {
      this.#content.refreshLayer(source);
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

  /** Resolves after the scene submits the first frame of the current initialization or recovery cycle. */
  get ready(): Promise<void> {
    return this.#readyCycle.promise;
  }

  /** Resolves the rendered element beneath finite viewport coordinates without dispatching interaction events. */
  pick(clientX: number, clientY: number): Promise<ScenePickHit | null> {
    return this.#picking.pick(clientX, clientY);
  }

  /** Projects a world point through the most recently submitted frame. */
  getClientPoint(worldPoint: Readonly<Vec3>): SceneClientPoint | null {
    if (!isFiniteVec3(worldPoint)) return null;
    const snapshot = this.#renderer.getSubmittedProjection();
    if (!snapshot) return null;
    const clip = multiplyMat4Vec4(snapshot.projection, [...worldPoint, 1]);
    if (!isProjectableClipPoint(clip)) return null;
    const inverseW = 1 / clip[3];
    const ndcX = clip[0] * inverseW;
    const ndcY = clip[1] * inverseW;
    const depth = clip[2] * inverseW;
    const rect = snapshot.canvas.getBoundingClientRect();
    const visibility = pointIsInsideClipVolume(ndcX, ndcY, depth) ? 'visible' : 'clipped';
    return Object.freeze({
      clientX: rect.left + ((ndcX + 1) / 2) * rect.width,
      clientY: rect.top + ((1 - ndcY) / 2) * rect.height,
      depth,
      visibility
    });
  }

  /** Creates a near-plane world ray through client coordinates without a GPU readback. */
  getRay(clientX: number, clientY: number): SceneRay | null {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
    const snapshot = this.#renderer.getSubmittedProjection();
    if (!snapshot) return null;
    const rect = snapshot.canvas.getBoundingClientRect();
    if (!clientPointIsInside(rect, clientX, clientY)) return null;
    const inverse = invertPreciseMat4(snapshot.projection);
    if (!inverse) return null;
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = 1 - ((clientY - rect.top) / rect.height) * 2;
    const near = unproject(inverse, [ndcX, ndcY, 0]);
    const far = unproject(inverse, [ndcX, ndcY, 1]);
    if (!near || !far) return null;
    const direction = normalizeDirection([far[0] - near[0], far[1] - near[1], far[2] - near[2]]);
    return direction ? Object.freeze({ direction: Object.freeze(direction), origin: Object.freeze(near) }) : null;
  }

  render() {
    return html`
      <div internal-host>
        <canvas aria-hidden="true"></canvas>
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
    this.#content.refresh();
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
    this.#requestRender();
  }

  #syncStructuralMutations(): void {
    this.#content.refresh();
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

function isProjectableClipPoint(point: readonly number[]): boolean {
  return point.every(Number.isFinite) && (point[3] ?? 0) > 0;
}

function pointIsInsideClipVolume(x: number, y: number, depth: number): boolean {
  return x >= -1 && x <= 1 && y >= -1 && y <= 1 && depth >= 0 && depth <= 1;
}

function clientPointIsInside(rect: DOMRect, x: number, y: number): boolean {
  return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
}

function isFiniteVec3(value: unknown): value is Readonly<Vec3> {
  return Array.isArray(value) && value.length === 3 && value.every(component => Number.isFinite(component));
}

function unproject(matrix: Matrix4, point: Vec3): Vec3 | null {
  const value = multiplyMat4Vec4(matrix, [...point, 1]);
  if (!value.every(Number.isFinite) || Math.abs(value[3]) < Number.EPSILON) return null;
  const inverseW = 1 / value[3];
  const result: Vec3 = [value[0] * inverseW, value[1] * inverseW, value[2] * inverseW];
  return result.every(Number.isFinite) ? result : null;
}

function normalizeDirection(value: Vec3): Vec3 | null {
  const length = Math.hypot(...value);
  return Number.isFinite(length) && length > 0 ? [value[0] / length, value[1] / length, value[2] / length] : null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'WebGPU is unavailable.';
}

function toNotSupportedError(error: unknown): DOMException {
  return error instanceof DOMException && error.name === 'NotSupportedError'
    ? error
    : new DOMException(getErrorMessage(error), 'NotSupportedError');
}
