// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
  SceneGPUBindGroup,
  SceneGPUBuffer,
  SceneGPUCommandEncoder,
  SceneGPUDevice,
  SceneGPUQuerySet,
  SceneGPURenderPass,
  SceneGPURenderPipeline,
  SceneGPUSampler,
  SceneGPUTexture
} from '../gpu/platform.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_COPY_SRC = 0x04;
const BUFFER_MAP_READ = 0x01;
const BUFFER_QUERY_RESOLVE = 0x200;

/** A screen-facing label quad in WebGPU clip coordinates. */
export interface LabelTextureQuad {
  /** Inclusive left clip-space X coordinate. */
  readonly left: number;
  /** Inclusive top clip-space Y coordinate. */
  readonly top: number;
  /** Inclusive right clip-space X coordinate. */
  readonly right: number;
  /** Inclusive bottom clip-space Y coordinate. */
  readonly bottom: number;
  /** WebGPU normalized depth (0 near, 1 far). */
  readonly depth: number;
}

/** A captured HTML label ready to draw after scene geometry. */
export interface LabelTextureRenderItem {
  /** Stable identity used to reuse per-label GPU resources across frames. */
  readonly key?: object;
  readonly quad: LabelTextureQuad;
  readonly texture: SceneGPUTexture;
  /** Receives one completed GPU occlusion sample. Scene owns hysteresis and DOM state. */
  readonly onOcclusionSamples?: (samples: number) => void;
}

interface LabelRenderPass extends SceneGPURenderPass {
  beginOcclusionQuery(queryIndex: number): void;
  draw(vertexCount: number, instanceCount?: number): void;
  endOcclusionQuery(): void;
  setBindGroup(index: number, bindGroup: SceneGPUBindGroup): void;
  setPipeline(pipeline: SceneGPURenderPipeline): void;
}

export interface LabelTextureRendererDevice extends SceneGPUDevice {
  readonly queue: SceneGPUDevice['queue'] & {
    writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void;
  };
  createBindGroup(descriptor: unknown): SceneGPUBindGroup;
  createBuffer(descriptor: unknown): SceneGPUBuffer;
  createRenderPipeline(descriptor: unknown): SceneGPURenderPipeline;
  createSampler(descriptor?: unknown): SceneGPUSampler;
  createShaderModule(descriptor: unknown): unknown;
}

interface QueryResources {
  readonly count: number;
  readonly mapped: SceneGPUBuffer;
  readonly querySet: SceneGPUQuerySet;
  readonly resolved: SceneGPUBuffer;
}

interface LabelDrawResources {
  readonly quadGroup: SceneGPUBindGroup;
  readonly quadValues: Float64Array;
  texture: SceneGPUTexture;
  textureGroup: SceneGPUBindGroup;
  readonly uniform: SceneGPUBuffer;
}

export interface LabelTextureRenderFrame {
  readonly items: readonly LabelTextureRenderItem[];
  readonly queries: QueryResources | undefined;
}

/**
 * Draws already-captured label textures. Capture, DOM placement, and pointer
 * policy stay in Scene so the experimental feature never expands the public API.
 */
export class LabelTextureRenderer {
  #drawResources = new Map<object, LabelDrawResources>();
  #disposed = false;
  #pendingOcclusionReads = new Map<SceneGPUBuffer, Promise<void>>();
  #pipeline: SceneGPURenderPipeline;
  #sampler: SceneGPUSampler;
  #queryResources: QueryResources | undefined;
  #uniformScratch = new Float32Array(12);

  constructor(
    private readonly device: LabelTextureRendererDevice,
    format: string
  ) {
    this.#pipeline = createLabelTexturePipeline(device, format);
    this.#sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
  }

  beginFrame(items: readonly LabelTextureRenderItem[]): LabelTextureRenderFrame {
    this.#pruneDrawResources(items);
    const current = this.#queryResources;
    // A mapped readback buffer cannot also receive another resolve/copy. Keep
    // drawing during that short window, but skip one query batch rather than
    // risking an invalid command or mismatching callbacks to samples.
    const queries =
      current && this.#pendingOcclusionReads.has(current.mapped) ? undefined : this.#ensureQueryResources(items.length);
    return { items, queries };
  }

  getQuerySet(frame: LabelTextureRenderFrame): SceneGPUQuerySet | undefined {
    return frame.queries?.querySet;
  }

  draw(pass: SceneGPURenderPass, frame: LabelTextureRenderFrame): void {
    if (this.#disposed || !supportsLabelRenderPass(pass)) return;
    pass.setPipeline(this.#pipeline);
    frame.items.forEach((item, index) => this.#drawItem(pass, item, frame.queries ? index : undefined));
  }

  resolveOcclusion(encoder: SceneGPUCommandEncoder, frame: LabelTextureRenderFrame): void {
    const queries = frame.queries;
    if (!queries || !encoder.resolveQuerySet || !encoder.copyBufferToBuffer || frame.items.length === 0) return;
    const byteLength = frame.items.length * BigUint64Array.BYTES_PER_ELEMENT;
    encoder.resolveQuerySet(queries.querySet, 0, frame.items.length, queries.resolved, 0);
    encoder.copyBufferToBuffer(queries.resolved, 0, queries.mapped, 0, byteLength);
  }

  /** Starts the asynchronous readback after Scene submits the enclosing command buffer. */
  readOcclusion(frame: LabelTextureRenderFrame): void {
    const queries = frame.queries;
    if (!queries?.mapped.mapAsync || !queries.mapped.getMappedRange || !queries.mapped.unmap) return;
    if (this.#pendingOcclusionReads.has(queries.mapped)) return;
    const itemCount = frame.items.length;
    const read = queries.mapped
      .mapAsync(BUFFER_MAP_READ, 0, itemCount * BigUint64Array.BYTES_PER_ELEMENT)
      .then(() => {
        if (this.#disposed || this.#queryResources !== queries) return;
        const range = queries.mapped.getMappedRange?.();
        if (!range) return;
        const samples = new BigUint64Array(range.slice(0, itemCount * BigUint64Array.BYTES_PER_ELEMENT));
        frame.items.forEach((item, index) => item.onOcclusionSamples?.(toSafeNumber(samples[index] ?? 0n)));
      })
      .catch(() => undefined)
      .finally(() => {
        this.#pendingOcclusionReads.delete(queries.mapped);
        queries.mapped.unmap?.();
      });
    this.#pendingOcclusionReads.set(queries.mapped, read);
    void read;
  }

  disconnect(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#drawResources.forEach(resources => resources.uniform.destroy());
    this.#drawResources.clear();
    this.#retireQueryResources(this.#queryResources);
    this.#queryResources = undefined;
  }

  #drawItem(pass: LabelRenderPass, item: LabelTextureRenderItem, queryIndex: number | undefined): void {
    const resources = this.#getDrawResources(item);
    this.#writeUniform(resources, item);
    pass.setBindGroup(0, resources.quadGroup);
    pass.setBindGroup(1, resources.textureGroup);
    if (queryIndex !== undefined && supportsOcclusionPass(pass)) pass.beginOcclusionQuery(queryIndex);
    pass.draw(6);
    if (queryIndex !== undefined && supportsOcclusionPass(pass)) pass.endOcclusionQuery();
  }

  #getDrawResources(item: LabelTextureRenderItem): LabelDrawResources {
    const key = item.key ?? item.texture;
    let resources = this.#drawResources.get(key);
    if (!resources) {
      const uniform = this.device.createBuffer({ size: 48, usage: BUFFER_COPY_DST | 0x40 });
      resources = {
        quadGroup: this.device.createBindGroup({
          layout: this.#pipeline.getBindGroupLayout(0),
          entries: [{ binding: 0, resource: { buffer: uniform } }]
        }),
        quadValues: new Float64Array(5).fill(Number.NaN),
        texture: item.texture,
        textureGroup: this.#createTextureGroup(item.texture),
        uniform
      };
      this.#drawResources.set(key, resources);
    } else if (resources.texture !== item.texture) {
      resources.texture = item.texture;
      resources.textureGroup = this.#createTextureGroup(item.texture);
    }
    return resources;
  }

  #createTextureGroup(texture: SceneGPUTexture): SceneGPUBindGroup {
    return this.device.createBindGroup({
      layout: this.#pipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: texture.createView() },
        { binding: 1, resource: this.#sampler }
      ]
    });
  }

  #writeUniform(resources: LabelDrawResources, item: LabelTextureRenderItem): void {
    const values = resources.quadValues;
    const quad = item.quad;
    if (
      values[0] === quad.left &&
      values[1] === quad.top &&
      values[2] === quad.right &&
      values[3] === quad.bottom &&
      values[4] === quad.depth
    ) {
      return;
    }
    values.set([quad.left, quad.top, quad.right, quad.bottom, quad.depth]);
    this.#uniformScratch[0] = item.quad.left;
    this.#uniformScratch[1] = item.quad.top;
    this.#uniformScratch[2] = item.quad.right;
    this.#uniformScratch[3] = item.quad.bottom;
    this.#uniformScratch[4] = item.quad.depth;
    this.device.queue.writeBuffer(resources.uniform, 0, this.#uniformScratch);
  }

  #pruneDrawResources(items: readonly LabelTextureRenderItem[]): void {
    const live = new Set(items.map(item => item.key ?? item.texture));
    for (const [key, resources] of this.#drawResources) {
      if (live.has(key)) continue;
      resources.uniform.destroy();
      this.#drawResources.delete(key);
    }
  }

  #ensureQueryResources(count: number): QueryResources | undefined {
    if (!supportsOcclusionQueries(this.device) || count === 0) return undefined;
    const existing = this.#queryResources;
    if (existing && existing.count >= count) return existing;
    const byteLength = count * BigUint64Array.BYTES_PER_ELEMENT;
    const replacement: QueryResources = {
      count,
      mapped: this.device.createBuffer({ size: byteLength, usage: BUFFER_COPY_DST | BUFFER_MAP_READ }),
      querySet: this.device.createQuerySet({ count, type: 'occlusion' }),
      resolved: this.device.createBuffer({ size: byteLength, usage: BUFFER_COPY_SRC | BUFFER_QUERY_RESOLVE })
    };
    this.#queryResources = replacement;
    const retire = () => this.#retireQueryResources(existing);
    if (!existing) return replacement;
    const completion = this.device.queue.onSubmittedWorkDone?.();
    if (completion) void completion.then(retire, retire);
    else retire();
    return replacement;
  }

  #retireQueryResources(resources: QueryResources | undefined): void {
    if (!resources) return;
    const pending = this.#pendingOcclusionReads.get(resources.mapped);
    if (pending)
      void pending.then(
        () => destroyQueryResources(resources),
        () => destroyQueryResources(resources)
      );
    else destroyQueryResources(resources);
  }
}

export function supportsLabelTextureRendering(device: SceneGPUDevice): device is LabelTextureRendererDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createBuffer === 'function' &&
    typeof device.createRenderPipeline === 'function' &&
    typeof device.createSampler === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.queue.writeBuffer === 'function'
  );
}

export function createLabelTexturePipeline(device: LabelTextureRendererDevice, format: string): SceneGPURenderPipeline {
  const module = device.createShaderModule({ code: LABEL_TEXTURE_SHADER });
  return device.createRenderPipeline({
    layout: 'auto',
    vertex: { entryPoint: 'vertexMain', module },
    fragment: {
      entryPoint: 'fragmentMain',
      module,
      targets: [
        {
          format,
          blend: {
            color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }
          }
        }
      ]
    },
    primitive: { cullMode: 'none', topology: 'triangle-list' },
    depthStencil: { depthCompare: 'less-equal', depthWriteEnabled: false, format: 'depth24plus' }
  });
}

export const LABEL_TEXTURE_SHADER = /* wgsl */ `
struct Quad { rect: vec4f, depth: f32, _padding: vec3f, }
@group(0) @binding(0) var<uniform> quad: Quad;
@group(1) @binding(0) var image: texture_2d<f32>;
@group(1) @binding(1) var imageSampler: sampler;
struct VertexOutput { @builtin(position) position: vec4f, @location(0) uv: vec2f, }
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
  var positions = array<vec2f, 6>(
    vec2f(quad.rect.x, quad.rect.y), vec2f(quad.rect.z, quad.rect.y), vec2f(quad.rect.x, quad.rect.w),
    vec2f(quad.rect.x, quad.rect.w), vec2f(quad.rect.z, quad.rect.y), vec2f(quad.rect.z, quad.rect.w)
  );
  var uvs = array<vec2f, 6>(
    vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
    vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0)
  );
  var output: VertexOutput;
  output.position = vec4f(positions[index], quad.depth, 1.0);
  output.uv = uvs[index];
  return output;
}
@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let sampled = textureSample(image, imageSampler, input.uv);
  return vec4f(sampled.rgb * sampled.a, sampled.a);
}
`;

function supportsLabelRenderPass(pass: SceneGPURenderPass): pass is LabelRenderPass {
  return (
    typeof pass.draw === 'function' && typeof pass.setBindGroup === 'function' && typeof pass.setPipeline === 'function'
  );
}

function supportsOcclusionPass(pass: SceneGPURenderPass): pass is LabelRenderPass {
  return typeof pass.beginOcclusionQuery === 'function' && typeof pass.endOcclusionQuery === 'function';
}

function supportsOcclusionQueries(device: SceneGPUDevice): device is LabelTextureRendererDevice & {
  createQuerySet(descriptor: unknown): SceneGPUQuerySet;
} {
  return typeof device.createQuerySet === 'function';
}

function destroyQueryResources(resources: QueryResources | undefined): void {
  resources?.mapped.destroy();
  resources?.resolved.destroy();
  resources?.querySet.destroy?.();
}

function toSafeNumber(value: bigint): number {
  return value > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : Number(value);
}
