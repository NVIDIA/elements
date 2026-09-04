// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getMarkerLayerMarker, isMarkerLayerRegistered } from '../markers/layer-state.js';
import { PickReadback, type PickPixel, type PickReadbackDevice } from '../pick/readback.js';
import type { PickPipelines } from '../pick/pipelines.js';
import type { PickScope, ScenePickRequest, ScenePickResult } from '../pick/routing.js';
import type { Mat4, Vec3 } from '../types.js';
import type { GeometryDevice } from './geometry-renderer.js';
import {
  getPickItemCount,
  isMarkerRenderItem,
  isMeshRenderItem,
  isPickableItem,
  type SceneRenderItem
} from './render-items.js';

const PICK_ATTEMPTS = 2;
const PICK_FRAME_CHANGED = Symbol('pick-frame-changed');
const TEXTURE_COPY_SRC = 0x01;
const TEXTURE_RENDER_ATTACHMENT = 0x10;

export interface CompletedGeometryPixel extends PickPixel {
  readonly pixelX: number;
  readonly pixelY: number;
}

interface PickFrameSnapshot {
  readonly canvas: HTMLCanvasElement;
  readonly device: GeometryDevice;
  readonly frameGeneration: number;
  readonly generation: number;
  readonly height: number;
  readonly items: readonly SceneRenderItem[];
  readonly projection: Mat4;
  readonly scope: PickScope;
  readonly width: number;
}

interface PickFrameUpdate {
  readonly frameGeneration: number;
  readonly items: readonly SceneRenderItem[];
  readonly projection: Mat4 | undefined;
  readonly scope?: PickScope;
}

interface PickTarget {
  readonly instanceIndex: number;
  readonly layer: HTMLElement;
  readonly marker?: HTMLElement;
}

interface PickTargetRange {
  readonly endId: number;
  readonly firstId: number;
  readonly layer: HTMLElement;
  readonly markerLayer: boolean;
}

interface CachedGeometryPixel extends CompletedGeometryPixel {
  readonly frameGeneration: number;
}

type PickSnapshotStatus = 'current' | 'frame-changed' | 'unavailable';

export class PickRenderer {
  #canvas?: HTMLCanvasElement;
  #depthTexture?: ReturnType<GeometryDevice['createTexture']>;
  #device?: GeometryDevice;
  #frameGeneration = 0;
  #idTexture?: ReturnType<GeometryDevice['createTexture']>;
  #items: readonly SceneRenderItem[] = [];
  #latestGeometryPixels = new Map<string, CachedGeometryPixel>();
  #load?: Promise<void>;
  #pipelines?: PickPipelines;
  #projection?: Mat4;
  #readback?: PickReadback<PickTarget>;
  #renderedFrameGeneration = -1;
  #renderedPixelKey?: string | null;
  #renderedScope?: PickScope;
  #resourceGeneration = 0;
  #scope: PickScope = 'all';
  #targetRanges?: readonly PickTargetRange[];
  #targetRangesFrameGeneration = -1;
  #targetRangesScope?: PickScope;
  #token = 0;
  readonly #draw: {
    drawPickItems(pass: object, items: readonly SceneRenderItem[], pipelines: PickPipelines): void;
  };
  readonly #getDepthView: () => unknown | null;

  constructor(options: {
    readonly draw: { drawPickItems(pass: object, items: readonly SceneRenderItem[], pipelines: PickPipelines): void };
    readonly getDepthView: () => unknown | null;
  }) {
    this.#draw = options.draw;
    this.#getDepthView = options.getDepthView;
  }

  initialize(canvas: HTMLCanvasElement, device: GeometryDevice | undefined): void {
    this.disconnect();
    this.#canvas = canvas;
    this.#device = device;
    if (device?.createBuffer) this.#readback = new PickReadback(device as PickReadbackDevice);
  }

  disconnect(): void {
    this.invalidateSize();
    this.#readback?.dispose();
    this.#readback = undefined;
    this.#canvas = undefined;
    this.#device = undefined;
    this.#items = [];
    this.#load = undefined;
    this.#pipelines = undefined;
    this.#token += 1;
  }

  invalidateSize(): void {
    this.#depthTexture?.destroy?.();
    this.#idTexture?.destroy?.();
    this.#depthTexture = undefined;
    this.#idTexture = undefined;
    this.#projection = undefined;
    this.#latestGeometryPixels.clear();
    this.#renderedFrameGeneration = -1;
    this.#renderedPixelKey = undefined;
    this.#renderedScope = undefined;
    this.#resourceGeneration += 1;
  }

  updateFrame(update: PickFrameUpdate): void {
    const { frameGeneration, items, projection, scope = 'all' } = update;
    if (
      frameGeneration === this.#frameGeneration &&
      items === this.#items &&
      projection === this.#projection &&
      scope === this.#scope
    )
      return;
    this.#frameGeneration = frameGeneration;
    this.#items = items;
    this.#projection = projection;
    this.#scope = scope;
    this.#renderedFrameGeneration = -1;
    this.#renderedPixelKey = undefined;
    this.#renderedScope = undefined;
    this.#targetRanges = undefined;
    this.#targetRangesFrameGeneration = -1;
    this.#targetRangesScope = undefined;
  }

  getCompletedGeometryPixel(pixelX: number, pixelY: number): CompletedGeometryPixel | undefined {
    const key = geometryPixelKey(pixelX, pixelY);
    const cached = this.#latestGeometryPixels.get(key);
    if (!cached) return undefined;
    if (this.#frameGeneration - cached.frameGeneration > 1) {
      this.#latestGeometryPixels.delete(key);
      return undefined;
    }
    const { frameGeneration: _frameGeneration, ...pixel } = cached;
    return pixel;
  }

  async pick(request: ScenePickRequest): Promise<ScenePickResult | null> {
    for (let attempt = 0; attempt < PICK_ATTEMPTS; attempt += 1) {
      const result = await this.#pickFrame(request);
      if (result !== PICK_FRAME_CHANGED) return result;
    }
    throw new DOMException('The scene changed while picking.', 'AbortError');
  }

  // eslint-disable-next-line complexity, max-lines-per-function, max-statements -- Readback needs explicit lifecycle, scoped-frame, and canvas-bounds guards.
  async #pickFrame(request: ScenePickRequest): Promise<ScenePickResult | null | typeof PICK_FRAME_CHANGED> {
    const snapshot = this.#createSnapshot(request);
    if (!snapshot) return null;
    const targetRanges = this.#getTargetRanges(snapshot);
    const inverseViewProjection = invertFiniteMat4(snapshot.projection);
    const readback = this.#readback;
    if (targetRanges.length === 0 || !inverseViewProjection || !readback) return null;
    const textures = this.#getTextures(snapshot);
    if (!textures) return null;
    try {
      await this.#loadPipelines();
      const pipelines = this.#pipelines;
      if (!pipelines) return null;
      const readyStatus = this.#getSnapshotStatus(snapshot);
      if (readyStatus !== 'current') return readyStatus === 'frame-changed' ? PICK_FRAME_CHANGED : null;
      const encoder = snapshot.device.createCommandEncoder();
      const pixelKey = geometryPixelKey(request.pixelX, request.pixelY);
      const pickFrameChanged =
        this.#renderedFrameGeneration !== snapshot.frameGeneration || this.#renderedScope !== snapshot.scope;
      const renderPickFrame =
        pickFrameChanged || (this.#renderedPixelKey !== null && this.#renderedPixelKey !== pixelKey);
      let renderedPixelKey: string | null | undefined;
      if (renderPickFrame) {
        const pass = encoder.beginRenderPass(this.#createPassDescriptor(textures));
        if (pass.setScissorRect && pickFrameChanged) {
          pass.setScissorRect(request.pixelX, request.pixelY, 1, 1);
          renderedPixelKey = pixelKey;
        } else {
          renderedPixelKey = null;
        }
        this.#draw.drawPickItems(pass, snapshot.items, pipelines);
        pass.end();
      }
      const result = readback.copy({
        encoder,
        frame: { decodeTarget: id => decodePickTarget(targetRanges, id), inverseViewProjection },
        onPixel:
          snapshot.scope === 'all'
            ? sample =>
                this.#storeCompletedGeometryPixel({ pixelX: request.pixelX, pixelY: request.pixelY, sample, snapshot })
            : undefined,
        pixel: { x: request.pixelX, y: request.pixelY },
        size: { height: snapshot.height, width: snapshot.width },
        textures
      });
      snapshot.device.queue.submit([encoder.finish()]);
      if (renderPickFrame) {
        this.#renderedFrameGeneration = snapshot.frameGeneration;
        this.#renderedPixelKey = renderedPixelKey;
        this.#renderedScope = snapshot.scope;
      }
      const hit = await result;
      // The command buffer captured a coherent frame and its target table before submission. A newer color frame does
      // not invalidate those private readback bytes; retrying here redraws the complete pick scene and can starve picks
      // while a camera animates continuously. Only resource replacement can invalidate a submitted result.
      if (!this.#resourcesAreCurrent(snapshot)) return null;
      return hit === null ? null : { ...hit.target, worldPosition: hit.worldPosition as Vec3 };
    } catch (error) {
      if (!this.#resourcesAreCurrent(snapshot)) return null;
      throw error;
    }
  }

  #createSnapshot(request: ScenePickRequest): PickFrameSnapshot | undefined {
    const device = this.#device;
    const canvas = this.#canvas;
    const projection = this.#projection;
    if (!device || !canvas || request.canvas !== canvas || !projection || !device.createBuffer) return undefined;
    const { width, height } = canvas;
    if (request.pixelX < 0 || request.pixelY < 0 || request.pixelX >= width || request.pixelY >= height)
      return undefined;
    return {
      canvas,
      device,
      frameGeneration: this.#frameGeneration,
      generation: this.#resourceGeneration,
      height,
      items: this.#items,
      projection,
      scope: this.#scope,
      width
    };
  }

  #getSnapshotStatus(snapshot: PickFrameSnapshot): PickSnapshotStatus {
    if (!this.#resourcesAreCurrent(snapshot)) {
      return 'unavailable';
    }
    return snapshot.frameGeneration === this.#frameGeneration ? 'current' : 'frame-changed';
  }

  #resourcesAreCurrent(snapshot: PickFrameSnapshot): boolean {
    return !(
      snapshot.generation !== this.#resourceGeneration ||
      snapshot.canvas !== this.#canvas ||
      snapshot.device !== this.#device ||
      snapshot.width !== snapshot.canvas.width ||
      snapshot.height !== snapshot.canvas.height
    );
  }

  #getTextures(snapshot: PickFrameSnapshot):
    | {
        readonly depth: ReturnType<GeometryDevice['createTexture']>;
        readonly id: ReturnType<GeometryDevice['createTexture']>;
      }
    | undefined {
    if (this.#getSnapshotStatus(snapshot) !== 'current') return undefined;
    if (!this.#idTexture || !this.#depthTexture) {
      this.#idTexture = snapshot.device.createTexture({
        size: [snapshot.width, snapshot.height],
        format: 'rgba8uint',
        usage: TEXTURE_COPY_SRC | TEXTURE_RENDER_ATTACHMENT
      });
      this.#depthTexture = snapshot.device.createTexture({
        size: [snapshot.width, snapshot.height],
        format: 'r32float',
        usage: TEXTURE_COPY_SRC | TEXTURE_RENDER_ATTACHMENT
      });
    }
    return { depth: this.#depthTexture, id: this.#idTexture };
  }

  #getTargetRanges(snapshot: PickFrameSnapshot): readonly PickTargetRange[] {
    if (
      this.#targetRanges &&
      this.#targetRangesFrameGeneration === snapshot.frameGeneration &&
      this.#targetRangesScope === snapshot.scope
    )
      return this.#targetRanges;
    const ranges = createPickTargetRanges(snapshot.items);
    this.#targetRanges = ranges;
    this.#targetRangesFrameGeneration = snapshot.frameGeneration;
    this.#targetRangesScope = snapshot.scope;
    return ranges;
  }

  #createPassDescriptor(textures: {
    readonly depth: ReturnType<GeometryDevice['createTexture']>;
    readonly id: ReturnType<GeometryDevice['createTexture']>;
  }): unknown {
    return {
      colorAttachments: [
        { clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store', view: textures.id.createView() },
        { clearValue: { r: 1, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store', view: textures.depth.createView() }
      ],
      depthStencilAttachment: {
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'discard',
        view: this.#getDepthView()
      }
    };
  }

  async #loadPipelines(): Promise<void> {
    if (this.#pipelines) return;
    if (!this.#load) {
      const device = this.#device;
      const token = this.#token;
      if (!device) return;
      this.#load = import('../pick/pipelines.js')
        .then(({ createPickPipelines }) => {
          if (token === this.#token && device === this.#device) this.#pipelines = createPickPipelines(device);
        })
        .finally(() => {
          if (token === this.#token) this.#load = undefined;
        });
    }
    await this.#load;
  }

  #storeCompletedGeometryPixel(options: {
    readonly pixelX: number;
    readonly pixelY: number;
    readonly sample: PickPixel;
    readonly snapshot: PickFrameSnapshot;
  }): void {
    const { pixelX, pixelY, sample, snapshot } = options;
    if (!this.#resourcesAreCurrent(snapshot)) return;
    const key = geometryPixelKey(pixelX, pixelY);
    this.#latestGeometryPixels.set(key, { ...sample, frameGeneration: snapshot.frameGeneration, pixelX, pixelY });
    if (this.#latestGeometryPixels.size > 128) {
      this.#latestGeometryPixels.delete(this.#latestGeometryPixels.keys().next().value ?? key);
    }
  }
}

function createPickTargetRanges(items: readonly SceneRenderItem[]): PickTargetRange[] {
  const ranges: PickTargetRange[] = [];
  let firstId = 1;
  for (const item of items) {
    if (!isPickableItem(item)) continue;
    const count = getPickItemCount(item);
    if (count === 0) continue;
    ranges.push({
      endId: firstId + count,
      firstId,
      layer: item.layer,
      markerLayer: (isMarkerRenderItem(item) || isMeshRenderItem(item)) && isMarkerLayerRegistered(item.layer)
    });
    firstId += count;
  }
  return ranges;
}

function decodePickTarget(ranges: readonly PickTargetRange[], id: number): PickTarget | undefined {
  const range = ranges.find(candidate => id >= candidate.firstId && id < candidate.endId);
  if (!range) return undefined;
  const instanceIndex = id - range.firstId;
  return {
    instanceIndex,
    layer: range.layer,
    marker: range.markerLayer ? getMarkerLayerMarker(range.layer, instanceIndex) : undefined
  };
}

// eslint-disable-next-line complexity -- Gaussian elimination has one pivot and one row-reduction loop.
function invertFiniteMat4(matrix: Mat4): Mat4 | null {
  const values = [...matrix];
  if (values.length !== 16 || values.some(value => !Number.isFinite(value))) return null;
  const augmented = Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 8 }, (_, column) =>
      column < 4 ? (values[column * 4 + row] ?? 0) : column - 4 === row ? 1 : 0
    )
  );
  for (let pivot = 0; pivot < 4; pivot += 1) {
    const row = augmented.slice(pivot).findIndex(candidate => Math.abs(candidate[pivot] ?? 0) > Number.EPSILON) + pivot;
    if (row < pivot) return null;
    [augmented[pivot], augmented[row]] = [augmented[row] ?? [], augmented[pivot] ?? []];
    const divisor = augmented[pivot]?.[pivot] ?? 0;
    if (divisor === 0) return null;
    augmented[pivot] = (augmented[pivot] ?? []).map(value => value / divisor);
    for (let other = 0; other < 4; other += 1) {
      if (other === pivot) continue;
      const factor = augmented[other]?.[pivot] ?? 0;
      augmented[other] = (augmented[other] ?? []).map(
        (value, column) => value - factor * (augmented[pivot]?.[column] ?? 0)
      );
    }
  }
  return new Float32Array(
    Array.from({ length: 16 }, (_, index) => augmented[index % 4]?.[4 + Math.floor(index / 4)] ?? 0)
  );
}

function geometryPixelKey(pixelX: number, pixelY: number): string {
  return `${pixelX}:${pixelY}`;
}
