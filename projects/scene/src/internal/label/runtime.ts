// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LABEL_TEXTURE_FALLBACK, type SceneErrorDetail } from '../../errors.js';
import { scenePlatform, type SceneGPUDevice, type SceneGPUTexture } from '../gpu/platform.js';
import { verifyLabelBrowserCopy } from './browser-probe.js';
import { copyLabelElementImage, getLabelCaptureCapabilities, type LabelCaptureCapabilities } from './capture.js';
import { registerSceneLabelNotifications } from './notifications.js';
import { LabelOcclusionTracker } from './occlusion.js';
import { waitForLabelMutationPaint } from './overlay.js';
import type { LabelTextureRenderItem } from './renderer.js';
import { LabelSceneController, markLabelProbe } from './scene-controller.js';
import { consumeLabelDirty, setLabelSceneState } from './state.js';
import { LabelTextureController } from './texture.js';
import type { SceneRenderer } from '../rendering/renderer.js';

const LABEL_SELECTOR = 'nve-scene-label';
const LABEL_TESTING = Symbol.for('nve.scene.label-testing');

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

export class SceneLabels {
  #blockedPointers = new Map<number, HTMLElement>();
  #canvas?: HTMLCanvasElement;
  #capabilities: LabelCaptureCapabilities = { available: false };
  #controllers = new Map<HTMLElement, LabelTextureController<SceneGPUTexture>>();
  #device?: SceneGPUDevice;
  #fallbackDiagnostics = new WeakMap<HTMLElement, Set<string>>();
  readonly #getConnectionToken: () => number;
  readonly #host: HTMLElement;
  readonly #isSyntheticEvent: (event: Event) => boolean;
  #labels: HTMLElement[] = [];
  #occlusion = new WeakMap<HTMLElement, LabelOcclusionTracker>();
  #overlay?: LabelSceneController;
  #probedDevice?: SceneGPUDevice;
  readonly #renderer: SceneRenderer;
  readonly #requestRender: () => void;
  readonly #routeBlockedPointer: (event: PointerEvent) => void;
  #slotPool = new Map<HTMLElement, HTMLSlotElement>();
  #unsubscribe?: () => void;

  constructor(options: {
    readonly getConnectionToken: () => number;
    readonly host: HTMLElement;
    readonly isSyntheticEvent: (event: Event) => boolean;
    readonly renderer: SceneRenderer;
    readonly requestRender: () => void;
    readonly routeBlockedPointer: (event: PointerEvent) => void;
  }) {
    this.#getConnectionToken = options.getConnectionToken;
    this.#host = options.host;
    this.#isSyntheticEvent = options.isSyntheticEvent;
    this.#renderer = options.renderer;
    this.#requestRender = options.requestRender;
    this.#routeBlockedPointer = options.routeBlockedPointer;
  }

  get resizeTargets(): readonly HTMLElement[] {
    return this.#labels.map(getLabelChild).filter((child): child is HTMLElement => child !== undefined);
  }

  get hasDirectLabels(): boolean {
    return this.#labels.some(label => label.parentElement === this.#host);
  }

  connect(): void {
    this.#host.addEventListener('input', this.#handleContentChange, true);
    this.#host.addEventListener('change', this.#handleContentChange, true);
    this.#host.addEventListener('focusin', this.#handleFocus, true);
    this.#host.addEventListener('focusout', this.#handleFocus, true);
    this.#host.addEventListener('pointerdown', this.#handlePointer, true);
    this.#host.addEventListener('pointerup', this.#handlePointer, true);
    this.#host.addEventListener('pointermove', this.#handlePointer, true);
    this.#host.addEventListener('click', this.#handlePointer, true);
    this.#host.addEventListener('pointercancel', this.#handlePointer, true);
    globalThis.document.addEventListener('selectionchange', this.#handleSelection);
    void globalThis.document.fonts?.ready?.then(() => this.#markAllDirty());
    globalThis.document.fonts?.addEventListener('loadingdone', this.#handleFontsLoaded);
  }

  disconnect(): void {
    this.#host.removeEventListener('input', this.#handleContentChange, true);
    this.#host.removeEventListener('change', this.#handleContentChange, true);
    this.#host.removeEventListener('focusin', this.#handleFocus, true);
    this.#host.removeEventListener('focusout', this.#handleFocus, true);
    this.#host.removeEventListener('pointerdown', this.#handlePointer, true);
    this.#host.removeEventListener('pointerup', this.#handlePointer, true);
    this.#host.removeEventListener('pointermove', this.#handlePointer, true);
    this.#host.removeEventListener('click', this.#handlePointer, true);
    this.#host.removeEventListener('pointercancel', this.#handlePointer, true);
    globalThis.document.removeEventListener('selectionchange', this.#handleSelection);
    globalThis.document.fonts?.removeEventListener('loadingdone', this.#handleFontsLoaded);
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
    this.unbindCanvas();
    this.disposeDevice();
  }

  bindCanvas(canvas: HTMLCanvasElement): void {
    if (this.#canvas === canvas) return;
    this.unbindCanvas();
    this.#canvas = canvas;
    canvas.addEventListener('paint', this.#handlePaint);
  }

  unbindCanvas(): void {
    this.#canvas?.removeEventListener('paint', this.#handlePaint);
    this.#canvas = undefined;
  }

  isLabelEvent(event: Event): boolean {
    const label = event.composedPath().find(target => target instanceof HTMLElement && target.matches(LABEL_SELECTOR));
    return label instanceof HTMLElement && label.parentElement === this.#host;
  }

  refresh(): void {
    this.#overlay?.refresh();
    this.#labels = this.#overlay
      ? [...this.#overlay.labels]
      : [...this.#host.querySelectorAll<HTMLElement>(LABEL_SELECTOR)].filter(
          label => label.closest('nve-scene') === this.#host
        );
    this.#loadOverlayController();
    this.#syncSlots();
  }

  synchronize(viewProjection: Float32Array): void {
    const overlay = this.#overlay;
    if (!overlay) return;
    overlay.synchronize(viewProjection, this.#host.getBoundingClientRect(), (label, slot) =>
      this.#disposeRemovedLabel(label, slot)
    );
    this.#labels = [...overlay.labels];
  }

  setDevice(device: SceneGPUDevice): void {
    this.#device = device;
  }

  prepareCapture(device?: SceneGPUDevice): void {
    if (device) this.#device = device;
    this.#installNotifications();
    const activeDevice = device ?? this.#device;
    if (!activeDevice) return;
    const testing = this.#getTesting();
    if (testing?.captureCapabilities) {
      this.#capabilities = testing.captureCapabilities;
      this.#requestRender();
    } else if (this.#probedDevice !== activeDevice) {
      this.#probedDevice = activeDevice;
      void this.#probeCapture(activeDevice);
    }
  }

  createTextureItems(viewProjection: Float32Array): LabelTextureRenderItem[] {
    if (!this.#capabilities.available || !this.#device) return [];
    const viewport = this.#host.getBoundingClientRect();
    return this.#labels.flatMap(label => this.#createTextureItem(label, viewport, viewProjection));
  }

  retireTextures(): void {
    const pending = [...this.#controllers.values()].filter(controller => controller.hasPendingRetirement);
    if (pending.length === 0) return;
    const completion = this.#device?.queue.onSubmittedWorkDone?.();
    if (completion) pending.forEach(controller => controller.retireAfterSubmission(completion));
  }

  disposeDevice(): void {
    for (const [label, controller] of this.#controllers) {
      controller.dispose();
      const slot = this.#overlay?.getSlot(label);
      if (slot) this.#moveSlotToOverlay(slot);
      this.#setOverlayState(label);
    }
    this.#controllers.clear();
    this.#slotPool.clear();
    this.#blockedPointers.clear();
    this.#capabilities = { available: false };
    this.#probedDevice = undefined;
    this.#device = undefined;
    this.#fallbackDiagnostics = new WeakMap<HTMLElement, Set<string>>();
  }

  markMutationLabelsDirty(records: readonly MutationRecord[]): boolean {
    let dirty = false;
    for (const record of records) {
      const label = this.#getOwningLabel(record.target);
      if (!label) continue;
      this.#controllers.get(label)?.markDirty();
      dirty = true;
    }
    return dirty;
  }

  handleResize(entries: readonly ResizeObserverEntry[]): boolean {
    let changed = false;
    for (const entry of entries) {
      const label = this.#labels.find(current => getLabelChild(current) === entry.target);
      if (!label) continue;
      this.#controllers.get(label)?.markDirty();
      changed = true;
    }
    return changed;
  }

  #loadOverlayController(): void {
    if (this.#overlay || !this.hasDirectLabels) return;
    this.#overlay = new LabelSceneController(
      this.#host,
      () => this.#host.shadowRoot?.querySelector<HTMLElement>('.overlay') ?? undefined,
      this.#requestRender
    );
    this.#overlay.refresh();
    this.#labels = [...this.#overlay.labels];
    this.#syncSlots();
    this.#requestRender();
  }

  #syncSlots(): void {
    this.#overlay?.syncSlots((label, slot) => this.#disposeRemovedLabel(label, slot));
  }

  #disposeRemovedLabel(label: HTMLElement, slot: HTMLSlotElement): void {
    this.#moveSlotToOverlay(slot);
    this.#controllers.get(label)?.dispose();
    this.#controllers.delete(label);
    this.#slotPool.delete(label);
    this.#occlusion.delete(label);
  }

  #installNotifications(): void {
    if (this.#unsubscribe) return;
    this.#unsubscribe = registerSceneLabelNotifications(this.#host, () => {
      this.refresh();
      if (this.hasDirectLabels) this.prepareCapture();
      this.#requestRender();
    });
  }

  #getTesting(): SceneLabelTestingOptions | undefined {
    return Reflect.get(this.#host, LABEL_TESTING) as SceneLabelTestingOptions | undefined;
  }

  #getOwningLabel(node: Node): HTMLElement | undefined {
    const element = node instanceof Element ? node : node.parentElement;
    const label = element?.closest<HTMLElement>(LABEL_SELECTOR);
    return label?.parentElement === this.#host ? label : undefined;
  }

  #handleContentChange = (event: Event): void => {
    const label = event.composedPath().find(target => target instanceof HTMLElement && target.matches(LABEL_SELECTOR));
    if (label instanceof HTMLElement && label.parentElement === this.#host) {
      this.#controllers.get(label)?.markDirty();
      this.#requestRender();
    }
  };

  #handleFocus = (event: FocusEvent): void => {
    const label = this.#getOwningLabel(event.target as Node);
    if (!label) return;
    this.#controllers.get(label)?.markDirty();
    this.#requestRender();
  };

  #handleSelection = (): void => {
    const label = this.#getOwningLabel(globalThis.document.activeElement ?? this.#host);
    if (!label) return;
    this.#controllers.get(label)?.markDirty();
    this.#requestRender();
  };

  // eslint-disable-next-line max-statements, complexity -- Capture routing retains pointer ownership across target changes.
  #handlePointer = (event: Event): void => {
    if (this.#isSyntheticEvent(event) || !(event instanceof PointerEvent)) return;
    const pathLabel = event
      .composedPath()
      .find(target => target instanceof HTMLElement && target.matches(LABEL_SELECTOR));
    const label =
      pathLabel instanceof HTMLElement && pathLabel.parentElement === this.#host
        ? pathLabel
        : this.#blockedPointers.get(event.pointerId);
    if (!label) return;
    const tracker = this.#occlusion.get(label);
    if (!tracker) return;
    if (event.type === 'pointermove') {
      this.#prefetchGeometry(event);
      return;
    }
    const decision = tracker.handlePointerEvent({
      pointerId: event.pointerId,
      type: event.type as 'pointerdown' | 'pointerup' | 'click' | 'pointercancel',
      visibility: this.#pixelVisibility(label, event)
    });
    if (event.type === 'pointercancel') {
      this.#blockedPointers.delete(event.pointerId);
      return;
    }
    if (decision !== 'block') return;
    if (event.type === 'pointerdown') this.#blockedPointers.set(event.pointerId, label);
    if (event.type === 'click') this.#blockedPointers.delete(event.pointerId);
    event.preventDefault();
    event.stopImmediatePropagation();
    this.#routeBlockedPointer(event);
  };

  #prefetchGeometry(event: PointerEvent): void {
    const canvas = this.#canvas;
    if (!canvas) return;
    const pixel = getCanvasDevicePixel(canvas, event.clientX, event.clientY);
    const testing = this.#getTesting();
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
  #pixelVisibility(
    label: HTMLElement,
    event: PointerEvent
  ): 'geometry-in-front' | 'label-visible' | 'unavailable' | undefined {
    if (event.type !== 'pointerdown') return undefined;
    const canvas = this.#canvas;
    if (!canvas) return 'unavailable';
    const pixel = getCanvasDevicePixel(canvas, event.clientX, event.clientY);
    const geometry =
      this.#getTesting()?.getGeometryPixel?.(pixel.x, pixel.y) ??
      this.#renderer.getCompletedGeometryPixel(pixel.x, pixel.y);
    const depth = this.#overlay?.getDepth(label);
    return geometry && depth !== undefined && geometry.id !== 0 && geometry.depth < depth
      ? 'geometry-in-front'
      : 'label-visible';
  }

  #handlePaint = (): void => this.#markAllDirty();

  #handleFontsLoaded = (): void => this.#markAllDirty();

  #markAllDirty(): void {
    this.#controllers.forEach(controller => controller.markDirty());
    this.#requestRender();
  }

  // eslint-disable-next-line max-statements -- The complete probe owns disposable DOM, GPU, and failure cleanup.
  async #probeCapture(device: SceneGPUDevice): Promise<void> {
    const canvas = this.#canvas;
    if (!canvas) return;
    const token = this.#getConnectionToken();
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
      this.#host.append(source);
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
        verifyLayoutSubtreeSlotCapture: () => this.#verifySlotCapture(canvas, slot, source, child),
        verifyMutationPaint: () => this.#verifyMutationPaint(canvas, child),
        verifyFocus: () => this.#verifyFocusCapture(source, control),
        verifyTransform: () => this.#verifyTransform(slot, device, verifiedSignature)
      });
      if (this.#isCurrentProbe(token, device)) this.#capabilities = capabilities;
    } catch {
      if (this.#isCurrentProbe(token, device)) this.#capabilities = { available: false };
    } finally {
      slot.remove();
      source.remove();
    }
    if (this.#isCurrentProbe(token, device)) this.#requestRender();
  }

  #isCurrentProbe(token: number, device: SceneGPUDevice): boolean {
    return this.#host.isConnected && token === this.#getConnectionToken() && this.#device === device;
  }

  // eslint-disable-next-line max-params -- The probe verifies the exact host, slot, and boxed-child topology.
  #verifySlotCapture(
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

  #verifyMutationPaint(canvas: HTMLCanvasElement, child: HTMLElement): Promise<boolean> {
    const before = child.getBoundingClientRect().width;
    return waitForLabelMutationPaint(canvas, () => {
      child.style.width = '3px';
    }).then(painted => painted && child.getBoundingClientRect().width > before);
  }

  #verifyFocusCapture(source: HTMLElement, control: HTMLInputElement): boolean {
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

  async #verifyTransform(
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

  // eslint-disable-next-line max-statements, complexity -- Capture promotion bridges DOM state and texture lifetime.
  #createTextureItem(label: HTMLElement, viewport: DOMRect, _viewProjection: Float32Array): LabelTextureRenderItem[] {
    const slot = this.#overlay?.getSlot(label);
    const child = getLabelChild(label);
    if (!slot || !child || !this.#overlay?.isProjected(label)) {
      if (slot) this.#setOverlayState(label);
      return [];
    }
    const controller = this.#getTextureController(label, slot);
    controller.setFocused(label.matches(':focus-within'));
    if (consumeLabelDirty(label)) controller.markDirty();
    controller.setSize({
      height: Math.round(child.offsetHeight * scenePlatform.getDevicePixelRatio()),
      width: Math.round(child.offsetWidth * scenePlatform.getDevicePixelRatio())
    });
    if (controller.needsCapture) this.#moveSlotToCanvas(label, slot);
    const update = controller.update();
    if (update.kind === 'fallback') {
      if (update.warning) this.#dispatchTextureFallback(label);
      this.#moveSlotToOverlay(slot);
      return [];
    }
    if (!update.texture) {
      this.#moveSlotToOverlay(slot);
      return [];
    }
    const bounds = slot.getBoundingClientRect();
    const tracker = this.#occlusion.get(label) ?? new LabelOcclusionTracker();
    tracker.setTextureMode(true);
    this.#occlusion.set(label, tracker);
    setLabelSceneState(label, { occluded: tracker.occluded, stale: label.hasAttribute('stale') });
    return [
      {
        key: label,
        texture: update.texture,
        quad: {
          bottom: 1 - ((bounds.bottom - viewport.top) / viewport.height) * 2,
          depth: this.#overlay.getDepth(label) ?? 0.5,
          left: ((bounds.left - viewport.left) / viewport.width) * 2 - 1,
          right: ((bounds.right - viewport.left) / viewport.width) * 2 - 1,
          top: 1 - ((bounds.top - viewport.top) / viewport.height) * 2
        },
        onOcclusionSamples: samples => {
          const occluded = tracker.recordOcclusionSamples(samples);
          slot.style.pointerEvents = tracker.pointerEnabled ? 'auto' : 'none';
          setLabelSceneState(label, { occluded, stale: label.hasAttribute('stale') });
          if (tracker.needsSample) this.#requestRender();
        }
      }
    ];
  }

  #getTextureController(label: HTMLElement, slot: HTMLSlotElement): LabelTextureController<SceneGPUTexture> {
    const current = this.#controllers.get(label);
    if (current) return current;
    const device = this.#device;
    const signature = this.#capabilities.available ? this.#capabilities.copySignature : undefined;
    if (!device || !signature || !device.createTexture) {
      throw new DOMException('Label capture is unavailable.', 'NotSupportedError');
    }
    const controller = new LabelTextureController<SceneGPUTexture>({
      copy: (texture, size) => {
        const testingCopy = this.#getTesting()?.copy;
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
    this.#controllers.set(label, controller);
    return controller;
  }

  #moveSlotToCanvas(label: HTMLElement, slot: HTMLSlotElement): void {
    const canvas = this.#canvas;
    if (!canvas || slot.parentElement === canvas) return;
    canvas.append(slot);
    canvas.removeAttribute('aria-hidden');
    this.#slotPool.set(label, slot);
  }

  #moveSlotToOverlay(slot: HTMLSlotElement): void {
    const overlay = this.#host.shadowRoot?.querySelector<HTMLElement>('.overlay');
    if (overlay && slot.parentElement !== overlay) overlay.append(slot);
    slot.style.pointerEvents = 'auto';
    if (this.#canvas && !this.#canvas.querySelector('slot')) this.#canvas.setAttribute('aria-hidden', 'true');
  }

  #setOverlayState(label: HTMLElement): void {
    this.#occlusion.get(label)?.setTextureMode(false);
    setLabelSceneState(label, { occluded: false, stale: label.hasAttribute('stale') });
  }

  #dispatchTextureFallback(label: HTMLElement): void {
    const message = 'The label texture capture failed repeatedly; the overlay remains active.';
    const activeCodes = this.#fallbackDiagnostics.get(label) ?? new Set<string>();
    if (activeCodes.has(LABEL_TEXTURE_FALLBACK)) return;
    activeCodes.add(LABEL_TEXTURE_FALLBACK);
    this.#fallbackDiagnostics.set(label, activeCodes);
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
