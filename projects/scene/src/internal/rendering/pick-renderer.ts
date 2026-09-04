// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PickReadback, type PickPixel, type PickReadbackDevice } from '../pick/readback.js';
import type { PickPipelines } from '../pick/pipelines.js';
import type { PickScope, ScenePickRequest, ScenePickResult } from '../pick/routing.js';
import type { ScenePickTarget } from '../pick/types.js';
import type { SceneGPURenderPass, SceneGPURenderPassDescriptor, SceneGPUTextureView } from '../gpu/platform.js';
import type { Matrix4, Vec3 } from '../types.js';
import { invertPreciseMat4 } from '../math/mat4.js';
import type { GeometryDevice } from './geometry-renderer.js';
import {
  getPickItemCount,
  isMarkerRenderItem,
  isMeshRenderItem,
  isPickableItem,
  type SceneRenderItem
} from './render-items.js';
import { resolveSceneFeatureId, type SceneFeatureIdSnapshot } from '../feature-ids.js';

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
  readonly projection: Matrix4;
  readonly scope: PickScope;
  readonly width: number;
}

interface PickFrameUpdate {
  readonly frameGeneration: number;
  readonly items: readonly SceneRenderItem[];
  readonly projection: Matrix4 | undefined;
  readonly scope?: PickScope;
}

interface PickTarget {
  readonly featureId?: number;
  readonly instanceIndex: number;
  readonly layer: HTMLElement;
  readonly marker?: HTMLElement;
  readonly target: ScenePickTarget;
}

interface PickTargetRange {
  readonly endId: number;
  readonly featureIds?: SceneFeatureIdSnapshot;
  readonly firstId: number;
  readonly layer: HTMLElement;
  readonly markers?: readonly HTMLElement[];
  readonly targetAt: (index: number) => ScenePickTarget;
}

interface CachedGeometryPixel extends CompletedGeometryPixel {
  readonly frameGeneration: number;
}

type PickTextures = {
  readonly depth: ReturnType<GeometryDevice['createTexture']>;
  readonly id: ReturnType<GeometryDevice['createTexture']>;
};

interface PreparedPickFrame {
  readonly inverseViewProjection: Matrix4;
  readonly readback: PickReadback<PickTarget>;
  readonly snapshot: PickFrameSnapshot;
  readonly targetRanges: readonly PickTargetRange[];
  readonly textures: PickTextures;
}

interface EncodedPickFrame {
  readonly encoder: ReturnType<GeometryDevice['createCommandEncoder']>;
  readonly rendered: boolean;
  readonly renderedPixelKey: string | null | undefined;
  readonly result: ReturnType<PickReadback<PickTarget>['copy']>;
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
  #projection?: Matrix4;
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
    drawPickItems(pass: SceneGPURenderPass, items: readonly SceneRenderItem[], pipelines: PickPipelines): void;
  };
  readonly #getDepthView: () => SceneGPUTextureView | null;

  constructor(options: {
    readonly draw: {
      drawPickItems(pass: SceneGPURenderPass, items: readonly SceneRenderItem[], pipelines: PickPipelines): void;
    };
    readonly getDepthView: () => SceneGPUTextureView | null;
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

  async #pickFrame(request: ScenePickRequest): Promise<ScenePickResult | null | typeof PICK_FRAME_CHANGED> {
    const prepared = this.#preparePickFrame(request);
    if (!prepared) return null;
    try {
      await this.#loadPipelines();
      return await this.#submitPickFrame(request, prepared);
    } catch (error) {
      if (!this.#resourcesAreCurrent(prepared.snapshot)) return null;
      throw error;
    }
  }

  #preparePickFrame(request: ScenePickRequest): PreparedPickFrame | undefined {
    const snapshot = this.#createSnapshot(request);
    if (!snapshot) return undefined;
    const targetRanges = this.#getTargetRanges(snapshot);
    const inverseViewProjection = invertPreciseMat4(snapshot.projection);
    const readback = this.#readback;
    if (targetRanges.length === 0 || !inverseViewProjection || !readback) return undefined;
    const textures = this.#getTextures(snapshot);
    return textures ? { inverseViewProjection, readback, snapshot, targetRanges, textures } : undefined;
  }

  async #submitPickFrame(
    request: ScenePickRequest,
    prepared: PreparedPickFrame
  ): Promise<ScenePickResult | null | typeof PICK_FRAME_CHANGED> {
    const pipelines = this.#pipelines;
    if (!pipelines) return null;
    const readyStatus = this.#getSnapshotStatus(prepared.snapshot);
    if (readyStatus !== 'current') return readyStatus === 'frame-changed' ? PICK_FRAME_CHANGED : null;
    const encoded = this.#encodePickFrame(request, prepared, pipelines);
    prepared.snapshot.device.queue.submit([encoded.encoder.finish()]);
    this.#commitRenderedPickFrame(prepared.snapshot, encoded);
    const hit = await encoded.result;
    // The submitted command owns a coherent target table. Only replacement of its resources invalidates the result.
    if (!this.#resourcesAreCurrent(prepared.snapshot)) return null;
    return hit === null
      ? null
      : {
          ...hit.target,
          clientX: request.clientX,
          clientY: request.clientY,
          worldPosition: hit.worldPosition as Vec3
        };
  }

  #encodePickFrame(request: ScenePickRequest, prepared: PreparedPickFrame, pipelines: PickPipelines): EncodedPickFrame {
    const encoder = prepared.snapshot.device.createCommandEncoder();
    const rendered = this.#renderPickPass({ encoder, pipelines, prepared, request });
    const { inverseViewProjection, readback, snapshot, targetRanges, textures } = prepared;
    const result = readback.copy({
      encoder,
      frame: { decodeTarget: id => decodePickTarget(targetRanges, id), inverseViewProjection },
      onPixel: this.#createGeometryPixelConsumer(request, snapshot),
      pixel: { x: request.pixelX, y: request.pixelY },
      size: { height: snapshot.height, width: snapshot.width },
      textures
    });
    return { encoder, rendered: rendered.required, renderedPixelKey: rendered.pixelKey, result };
  }

  #renderPickPass(options: {
    readonly encoder: ReturnType<GeometryDevice['createCommandEncoder']>;
    readonly pipelines: PickPipelines;
    readonly prepared: PreparedPickFrame;
    readonly request: ScenePickRequest;
  }): { readonly pixelKey: string | null | undefined; readonly required: boolean } {
    const { encoder, pipelines, prepared, request } = options;
    const { snapshot, textures } = prepared;
    const pixelKey = geometryPixelKey(request.pixelX, request.pixelY);
    const frameChanged =
      this.#renderedFrameGeneration !== snapshot.frameGeneration || this.#renderedScope !== snapshot.scope;
    const required = frameChanged || (this.#renderedPixelKey !== null && this.#renderedPixelKey !== pixelKey);
    if (!required) return { pixelKey: undefined, required };
    const pass = encoder.beginRenderPass(this.#createPassDescriptor(textures));
    const renderedPixelKey = setPickScissor({ frameChanged, pass, pixelKey, request });
    this.#draw.drawPickItems(pass, snapshot.items, pipelines);
    pass.end();
    return { pixelKey: renderedPixelKey, required };
  }

  #createGeometryPixelConsumer(request: ScenePickRequest, snapshot: PickFrameSnapshot) {
    return snapshot.scope === 'all'
      ? (sample: PickPixel) =>
          this.#storeCompletedGeometryPixel({ pixelX: request.pixelX, pixelY: request.pixelY, sample, snapshot })
      : undefined;
  }

  #commitRenderedPickFrame(snapshot: PickFrameSnapshot, encoded: EncodedPickFrame): void {
    if (!encoded.rendered) return;
    this.#renderedFrameGeneration = snapshot.frameGeneration;
    this.#renderedPixelKey = encoded.renderedPixelKey;
    this.#renderedScope = snapshot.scope;
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

  #getTextures(snapshot: PickFrameSnapshot): PickTextures | undefined {
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

  #createPassDescriptor(textures: PickTextures): SceneGPURenderPassDescriptor {
    const depthView = this.#getDepthView();
    if (!depthView) {
      return {
        colorAttachments: [
          {
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: 'clear',
            storeOp: 'store',
            view: textures.id.createView()
          },
          {
            clearValue: { r: 1, g: 0, b: 0, a: 0 },
            loadOp: 'clear',
            storeOp: 'store',
            view: textures.depth.createView()
          }
        ]
      };
    }
    return {
      colorAttachments: [
        {
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store',
          view: textures.id.createView()
        },
        {
          clearValue: { r: 1, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store',
          view: textures.depth.createView()
        }
      ],
      depthStencilAttachment: {
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'discard',
        view: depthView
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
      featureIds: item.featureIds,
      firstId,
      layer: item.layer,
      markers: isMarkerRenderItem(item)
        ? item.data.markers
        : isMeshRenderItem(item)
          ? item.instances?.markers
          : undefined,
      targetAt: createPickTargetDecoder(item)
    });
    firstId += count;
  }
  return ranges;
}

function decodePickTarget(ranges: readonly PickTargetRange[], id: number): PickTarget | undefined {
  const range = ranges.find(candidate => id >= candidate.firstId && id < candidate.endId);
  if (!range) return undefined;
  const instanceIndex = id - range.firstId;
  const featureId = resolveSceneFeatureId(range.featureIds, instanceIndex);
  return {
    ...(featureId === undefined ? {} : { featureId }),
    instanceIndex,
    layer: range.layer,
    marker: range.markers?.[instanceIndex],
    target: range.targetAt(instanceIndex)
  };
}

export function createPickTargetDecoder(item: SceneRenderItem): (index: number) => ScenePickTarget {
  if (isMeshRenderItem(item)) {
    return item.data.heightfield
      ? () => Object.freeze({ kind: 'surface' })
      : index => Object.freeze({ index, kind: 'instance' });
  }
  if (isMarkerRenderItem(item)) {
    return index => Object.freeze({ index, kind: 'instance' });
  }
  if (item.type === 'label') return index => Object.freeze({ index, kind: 'label' });
  if (item.type === 'point') return index => Object.freeze({ index, kind: 'point' });
  if (item.type === 'triangle') {
    return index =>
      Object.freeze({
        index,
        kind: 'triangle',
        vertexIndices: Object.freeze([index * 3, index * 3 + 1, index * 3 + 2] as [number, number, number])
      });
  }
  return index => {
    const first = item.topology === 'segments' ? index * 2 : index;
    const second = item.topology === 'loop' ? (first + 1) % item.data.count : first + 1;
    return Object.freeze({
      index,
      kind: 'segment',
      vertexIndices: Object.freeze([first, second] as [number, number])
    });
  };
}

function geometryPixelKey(pixelX: number, pixelY: number): string {
  return `${pixelX}:${pixelY}`;
}

function setPickScissor(options: {
  readonly frameChanged: boolean;
  readonly pass: SceneGPURenderPass;
  readonly pixelKey: string;
  readonly request: ScenePickRequest;
}): string | null {
  const { frameChanged, pass, pixelKey, request } = options;
  if (pass.setScissorRect && frameChanged) {
    pass.setScissorRect(request.pixelX, request.pixelY, 1, 1);
    return pixelKey;
  }
  return null;
}
