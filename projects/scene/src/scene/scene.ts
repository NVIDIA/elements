// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { attachInternals, useStyles, type UnhandledPointerInput } from '@nvidia-elements/core/internal';
import { html, LitElement } from 'lit';
import { DEVICE_LOST, WEBGPU_UNAVAILABLE, type SceneErrorDetail } from '../errors.js';
import {
  sharedDeviceManager,
  type SharedDeviceLease,
  type SharedDeviceListener
} from '../internal/gpu/device-manager.js';
import { scenePlatform, type SceneGPUDeviceLostInfo } from '../internal/gpu/platform.js';
import { registerSceneRenderNotifications } from '../internal/label/notifications.js';
import type { CameraState } from '../internal/math/camera.js';
import type { PickHit } from '../internal/pick/routing.js';
import { CameraRuntime } from '../internal/camera/runtime.js';
import { SceneLabels } from '../internal/label/runtime.js';
import { ScenePicking } from '../internal/pick/scene-controller.js';
import { SceneRenderer } from '../internal/rendering/renderer.js';
import { SceneContent } from '../internal/scene/content.js';
import { createReadyCycle, type ReadyCycle } from '../internal/scene/ready-cycle.js';
import styles from './scene.css?inline';

export type { PickHit } from '../internal/pick/routing.js';
export type { SceneErrorDetail } from '../errors.js';
export type { CameraPose, CameraProjection, CameraState, SceneCameraChangeDetail } from '../internal/math/camera.js';

type SceneState = 'disconnected' | 'initializing' | 'ready' | 'failed';

/**
 * @element nve-scene
 * @description A visual scene component.
 * @documentation https://nvidia.github.io/elements/docs/scene/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/scene
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 * @property ready - Resolves after the scene submits the first frame of the current initialization or recovery cycle.
 * @event {SceneCameraChangeDetail} nve-scene-camerachange - Dispatched after the resolved camera state changes.
 * @event {void} nve-scene-ready - Dispatched after the scene submits the first frame of the current initialization or recovery cycle.
 * @event {SceneErrorDetail} nve-scene-error - Dispatched when the scene reports a rendering or configuration error.
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
  #canvas?: HTMLCanvasElement;
  readonly #camera: CameraRuntime;
  #connectionToken = 0;
  readonly #content: SceneContent;
  #hasConnected = false;
  readonly #labels: SceneLabels;
  #mutationObserver?: MutationObserver;
  #needsRender = true;
  readonly #picking: ScenePicking;
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
    this.#picking = new ScenePicking({
      getCanvas: () => this.#canvas,
      getReady: () => this.ready,
      hasInteractiveTargets: () => this.#content.hasInteractiveTargets(),
      host: this,
      renderer: this.#renderer
    });
    this.#labels = new SceneLabels({
      getConnectionToken: () => this.#connectionToken,
      host: this,
      isSyntheticEvent: event => this.#picking.isSyntheticEvent(event),
      renderer: this.#renderer,
      requestRender: () => this.#requestRender(),
      routeBlockedPointer: event => this.#picking.routeBlockedPointer(event)
    });
    this.#camera = new CameraRuntime({
      host: this,
      requestRender: () => this.#requestRender(),
      shouldIgnoreInput: event => this.#labels.isLabelEvent(event)
    });
    registerSceneRenderNotifications(this, () => this.#requestRender());
  }

  /** Gets an independent snapshot of the resolved camera state. */
  get cameraState(): CameraState {
    return this.#camera.state;
  }

  /** Resolves after the scene submits the first frame of the current initialization or recovery cycle. */
  get ready(): Promise<void> {
    return this.#readyCycle.promise;
  }

  /** Resolves the rendered element beneath finite viewport coordinates without dispatching interaction events. */
  pick(clientX: number, clientY: number): Promise<PickHit | null> {
    return this.#picking.pick(clientX, clientY);
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
    this.#scheduleTick();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('nve-pointer-input', this.#handlePointerInput as EventListener);
    attachInternals(this);
    this._internals.role = 'region';
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
    this.#labels.connect();
    this.#picking.connect();
    const resumedLease = this.#prepareConnection();
    void resumedLease?.catch(() => undefined);
    void this.#initialize(resumedLease);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('nve-pointer-input', this.#handlePointerInput as EventListener);
    this.#connectionToken += 1;
    this.#picking.disconnect(new DOMException('The scene disconnected while picking.', 'AbortError'));
    this.#stopObservers();
    this.#labels.disconnect();
    this.#camera.unbindCanvas();
    this.#canvas = undefined;
    this.#unsubscribeDevice?.();
    this.#unsubscribeDevice = undefined;
    this.#renderer.disconnect();
    this.#readyCycle.reject(new DOMException('The scene disconnected before it became ready.', 'AbortError'));
    this.#state = 'disconnected';
  }

  #handlePointerInput = (event: CustomEvent<UnhandledPointerInput>): void => {
    this.#picking.handleUnhandledPointer(event.detail);
  };

  #prepareConnection(): Promise<SharedDeviceLease> | undefined {
    const resumedLease = this.#hasConnected ? sharedDeviceManager.resumeRecoveryAfterReconnect() : undefined;
    if (this.#hasConnected) this.#readyCycle = createReadyCycle();
    this.#hasConnected = true;
    this.#state = 'initializing';
    this.#requestRender();
    this.#unsubscribeDevice = sharedDeviceManager.subscribe(this.#deviceListener);
    this.requestUpdate();
    return resumedLease;
  }

  async #initialize(resumedLease?: Promise<SharedDeviceLease>): Promise<void> {
    const token = ++this.#connectionToken;
    try {
      await this.updateComplete;
      if (!this.#isCurrentConnection(token)) return;
      this.#bindShadowDOM();
      const lease = await (resumedLease ?? sharedDeviceManager.acquire());
      if (this.#isCurrentConnection(token)) this.#initializeRenderer(lease);
    } catch (error) {
      if (this.#isCurrentConnection(token)) this.#failWebGPU(error);
    }
  }

  #bindShadowDOM(): void {
    const canvas = this.renderRoot.querySelector('canvas');
    if (canvas instanceof HTMLCanvasElement) this.#bindCanvas(canvas);
    this.#syncFallbackSlot();
    this.#content.refresh();
    this.#picking.reconcileInteractionAvailability();
    this.#labels.refresh();
    this.#startObservers();
    if (this.#labels.hasDirectLabels) this.#labels.prepareCapture();
    this.#sampleBackground();
    this.#scheduleTick();
  }

  #bindCanvas(canvas: HTMLCanvasElement): void {
    if (this.#canvas === canvas) return;
    this.#camera.unbindCanvas();
    this.#labels.unbindCanvas();
    this.#canvas = canvas;
    this.#camera.bindCanvas(canvas);
    this.#labels.bindCanvas(canvas);
  }

  #initializeRenderer(lease: SharedDeviceLease): void {
    const canvas = this.#canvas ?? this.renderRoot.querySelector('canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new DOMException('The scene canvas is unavailable.', 'NotSupportedError');
    }
    this.#renderer.initialize(canvas, lease);
    this.#labels.setDevice(lease.device);
    this.#labels.refresh();
    if (this.#labels.hasDirectLabels) this.#labels.prepareCapture(lease.device);
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
    for (const target of this.#labels.resizeTargets) this.#resizeObserver?.observe(target);
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
    const dirtyLabels = this.#labels.markMutationLabelsDirty(owned);
    if (owned.some(record => record.type === 'childList')) {
      this.#syncStructuralMutations();
      return;
    }
    if (owned.some(record => this.#isDirectNamedSlotMutation(record))) this.#syncFallbackSlot();
    if (dirtyLabels && this.#labels.hasDirectLabels) this.#labels.prepareCapture();
    this.#requestRender();
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
    this.#content.refresh();
    this.#picking.reconcileInteractionAvailability();
    this.#labels.refresh();
    this.#observeResize();
    if (this.#labels.hasDirectLabels) this.#labels.prepareCapture();
    this.#requestRender();
  }

  #syncFallbackSlot(): void {
    const fallback = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="fallback"]');
    fallback?.assign(...[...this.children].filter(child => child.getAttribute('slot') === 'fallback'));
  }

  #handleResize(entries: ResizeObserverEntry[]): void {
    const entry = entries.find(candidate => candidate.target === this);
    if (entry) {
      const size = getDevicePixelSize(entry, scenePlatform.getDevicePixelRatio());
      this.#renderer.resize(size.width, size.height);
      this.#requestRender();
    }
    if (this.#labels.handleResize(entries)) this.#requestRender();
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
    if (!this.#renderer.active) this.#synchronizeOverlayWithoutRenderer();
    this.#renderIfNeeded();
  }

  #trackRuntimeChanges(): void {
    const cameraChanged = this.#camera.trackChanges();
    this.#needsRender = this.#needsRender || cameraChanged;
    const contentChanged = this.#content.trackChanges();
    this.#needsRender = this.#needsRender || contentChanged;
  }

  #synchronizeOverlayWithoutRenderer(): void {
    this.#content.resolveFrames();
    this.#camera.resolve();
    this.#labels.synchronize(this.#camera.viewProjection());
  }

  #renderIfNeeded(): void {
    if (!this.#needsRender || !this.#renderer.active) return;
    try {
      this.#content.resolveFrames();
      this.#camera.resolve();
      const viewProjection = this.#camera.viewProjection();
      this.#labels.synchronize(viewProjection);
      const labels = this.#labels.createTextureItems(viewProjection);
      const items = this.#content.compileRenderItems();
      this.#picking.reconcileInteractionAvailability();
      if (this.#renderer.render(items, viewProjection, labels)) {
        this.#needsRender = false;
        this.#labels.retireTextures();
        this.#completeReadyCycle();
        this.#camera.dispatchPendingChange();
      }
    } catch (error) {
      this.#failWebGPU(error);
    }
  }

  #completeReadyCycle(): void {
    if (this.#readyCycle.settled) return;
    this.#state = 'ready';
    this.#activeErrors.delete(WEBGPU_UNAVAILABLE);
    this.#activeErrors.delete(DEVICE_LOST);
    this.#readyCycle.resolve();
    this.dispatchEvent(new CustomEvent('nve-scene-ready', { bubbles: true, composed: true, cancelable: false }));
    this.requestUpdate();
  }

  #handleDeviceLost(info: SceneGPUDeviceLostInfo): void {
    this.#picking.invalidate(new DOMException('The WebGPU device was lost while picking.', 'AbortError'));
    this.#renderer.disconnect();
    this.#labels.disposeDevice();
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
    this.#labels.disposeDevice();
    this.#state = 'failed';
    this.#dispatchError(WEBGPU_UNAVAILABLE, getErrorMessage(error));
    this.#readyCycle.reject(toNotSupportedError(error));
    this.requestUpdate();
  }

  #dispatchError(code: string, message: string): void {
    if (this.#activeErrors.has(code)) return;
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

  #isCurrentConnection(token: number): boolean {
    return this.isConnected && token === this.#connectionToken;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'WebGPU is unavailable.';
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
