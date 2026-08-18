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
} from '../../internal/gpu/platform.js';

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

export interface LabelTextureRenderFrame {
  readonly items: readonly LabelTextureRenderItem[];
  readonly queries: QueryResources | undefined;
}

/**
 * Draws already-captured label textures. Capture, DOM placement, and pointer
 * policy stay in Scene so the experimental feature never expands the public API.
 */
export class LabelTextureRenderer {
  #disposed = false;
  #pendingUniforms = new Set<SceneGPUBuffer>();
  #pendingOcclusionReads = new Map<SceneGPUBuffer, Promise<void>>();
  #pipeline: SceneGPURenderPipeline;
  #sampler: SceneGPUSampler;
  #queryResources: QueryResources | undefined;

  constructor(
    private readonly device: LabelTextureRendererDevice,
    format: string
  ) {
    this.#pipeline = createLabelTexturePipeline(device, format);
    this.#sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
  }

  beginFrame(items: readonly LabelTextureRenderItem[]): LabelTextureRenderFrame {
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

  /** Retires one-frame uniform buffers after the command submission completes. */
  afterSubmission(): void {
    const uniforms = [...this.#pendingUniforms];
    this.#pendingUniforms.clear();
    if (uniforms.length === 0) return;
    const retire = () => uniforms.forEach(uniform => uniform.destroy());
    const completion = this.device.queue.onSubmittedWorkDone?.();
    if (completion) void completion.then(retire, retire);
    else retire();
  }

  disconnect(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#pendingUniforms.forEach(uniform => uniform.destroy());
    this.#pendingUniforms.clear();
    this.#retireQueryResources(this.#queryResources);
    this.#queryResources = undefined;
  }

  #drawItem(pass: LabelRenderPass, item: LabelTextureRenderItem, queryIndex: number | undefined): void {
    const uniform = this.device.createBuffer({ size: 48, usage: BUFFER_COPY_DST | 0x40 });
    this.#pendingUniforms.add(uniform);
    this.device.queue.writeBuffer(
      uniform,
      0,
      new Float32Array([
        item.quad.left,
        item.quad.top,
        item.quad.right,
        item.quad.bottom,
        item.quad.depth,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ])
    );
    const quadGroup = this.device.createBindGroup({
      layout: this.#pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniform } }]
    });
    const textureGroup = this.device.createBindGroup({
      layout: this.#pipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: item.texture.createView() },
        { binding: 1, resource: this.#sampler }
      ]
    });
    pass.setPipeline(this.#pipeline);
    pass.setBindGroup(0, quadGroup);
    pass.setBindGroup(1, textureGroup);
    if (queryIndex !== undefined && supportsOcclusionPass(pass)) pass.beginOcclusionQuery(queryIndex);
    pass.draw(6);
    if (queryIndex !== undefined && supportsOcclusionPass(pass)) pass.endOcclusionQuery();
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
