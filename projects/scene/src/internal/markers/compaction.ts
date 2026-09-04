// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
  SceneGPUBindGroup,
  SceneGPUBuffer,
  SceneGPUCommandEncoder,
  SceneGPUComputePipeline,
  SceneGPUDevice
} from '../gpu/platform.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_STORAGE = 0x80;
const BUFFER_INDIRECT = 0x100;
const MARKER_WORDS = 12;
const MARKER_BYTES = MARKER_WORDS * Uint32Array.BYTES_PER_ELEMENT;
const WORKGROUP_SIZE = 64;
export const MARKER_COMPACTION_THRESHOLD = 25_000;

interface CompactionDevice extends SceneGPUDevice {
  readonly queue: SceneGPUDevice['queue'] & {
    writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void;
  };
  createBindGroup(descriptor: unknown): SceneGPUBindGroup;
  createBuffer(descriptor: unknown): SceneGPUBuffer;
  createComputePipeline(descriptor: unknown): SceneGPUComputePipeline;
  createShaderModule(descriptor: unknown): unknown;
}

export interface MarkerCompactionResources {
  readonly arguments: SceneGPUBuffer;
  readonly opaque: SceneGPUBuffer;
  readonly transparent: SceneGPUBuffer;
  readonly bindGroup: SceneGPUBindGroup;
  readonly sceneBindGroup: SceneGPUBindGroup;
}

export class MarkerCompactor {
  readonly #device: CompactionDevice;
  readonly #pipeline: SceneGPUComputePipeline;
  readonly #argumentsScratch = new Uint32Array(10);

  constructor(device: CompactionDevice) {
    this.#device = device;
    this.#pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: device.createShaderModule({ code: MARKER_COMPACTION_SHADER }), entryPoint: 'main' }
    });
  }

  createResources(source: SceneGPUBuffer, uniform: SceneGPUBuffer, byteLength: number): MarkerCompactionResources {
    const indexByteLength = (byteLength / MARKER_BYTES) * Uint32Array.BYTES_PER_ELEMENT;
    let opaque: SceneGPUBuffer | undefined;
    let transparent: SceneGPUBuffer | undefined;
    let argumentsBuffer: SceneGPUBuffer | undefined;
    try {
      opaque = this.#device.createBuffer({ size: indexByteLength, usage: BUFFER_STORAGE });
      transparent = this.#device.createBuffer({ size: indexByteLength, usage: BUFFER_STORAGE });
      argumentsBuffer = this.#device.createBuffer({
        size: this.#argumentsScratch.byteLength,
        usage: BUFFER_COPY_DST | BUFFER_STORAGE | BUFFER_INDIRECT
      });
      const bindGroup = this.#device.createBindGroup({
        layout: this.#pipeline.getBindGroupLayout(1),
        entries: [
          { binding: 0, resource: { buffer: source } },
          { binding: 1, resource: { buffer: opaque } },
          { binding: 2, resource: { buffer: transparent } },
          { binding: 3, resource: { buffer: argumentsBuffer } }
        ]
      });
      const sceneBindGroup = this.#device.createBindGroup({
        layout: this.#pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniform } }]
      });
      return { arguments: argumentsBuffer, bindGroup, opaque, sceneBindGroup, transparent };
    } catch (error) {
      argumentsBuffer?.destroy();
      opaque?.destroy();
      transparent?.destroy();
      throw error;
    }
  }

  encode(options: {
    readonly count: number;
    readonly encoder: SceneGPUCommandEncoder;
    readonly indexCount: number;
    readonly resources: MarkerCompactionResources;
  }): boolean {
    const beginComputePass = options.encoder.beginComputePass;
    if (!beginComputePass) return false;
    this.#argumentsScratch.fill(0);
    this.#argumentsScratch[0] = options.indexCount;
    this.#argumentsScratch[5] = options.indexCount;
    this.#device.queue.writeBuffer(options.resources.arguments, 0, this.#argumentsScratch);
    const pass = beginComputePass.call(options.encoder);
    pass.setPipeline(this.#pipeline);
    pass.setBindGroup(0, options.resources.sceneBindGroup);
    pass.setBindGroup(1, options.resources.bindGroup);
    pass.dispatchWorkgroups(Math.ceil(options.count / WORKGROUP_SIZE));
    pass.end();
    return true;
  }
}

export function supportsMarkerCompaction(device: SceneGPUDevice): device is CompactionDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createBuffer === 'function' &&
    typeof device.createComputePipeline === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.queue.writeBuffer === 'function'
  );
}

export function destroyMarkerCompactionResources(resources: MarkerCompactionResources | undefined): void {
  resources?.arguments.destroy();
  resources?.opaque.destroy();
  resources?.transparent.destroy();
}

export const MARKER_COMPACTION_SHADER = /* wgsl */ `
struct SceneUniforms {
  viewProjection: mat4x4f,
  frame: mat4x4f,
  count: f32,
}
@group(0) @binding(0) var<uniform> scene: SceneUniforms;
@group(1) @binding(0) var<storage, read> source: array<u32>;
@group(1) @binding(1) var<storage, read_write> opaqueIndices: array<u32>;
@group(1) @binding(2) var<storage, read_write> transparentIndices: array<u32>;
@group(1) @binding(3) var<storage, read_write> arguments: array<atomic<u32>>;

fn isVisible(base: u32) -> bool {
  let position = vec3f(bitcast<f32>(source[base]), bitcast<f32>(source[base + 1u]), bitcast<f32>(source[base + 2u]));
  let scale = vec3f(bitcast<f32>(source[base + 7u]), bitcast<f32>(source[base + 8u]), bitcast<f32>(source[base + 9u]));
  let transform = scene.viewProjection * scene.frame;
  let point = vec4f(position, 1.0);
  let radius = 0.8660254 * max(abs(scale.x), max(abs(scale.y), abs(scale.z)));
  let row0 = vec4f(transform[0].x, transform[1].x, transform[2].x, transform[3].x);
  let row1 = vec4f(transform[0].y, transform[1].y, transform[2].y, transform[3].y);
  let row2 = vec4f(transform[0].z, transform[1].z, transform[2].z, transform[3].z);
  let row3 = vec4f(transform[0].w, transform[1].w, transform[2].w, transform[3].w);
  return !(
    outsidePlane(row3 + row0, point, radius) || outsidePlane(row3 - row0, point, radius) ||
    outsidePlane(row3 + row1, point, radius) || outsidePlane(row3 - row1, point, radius) ||
    outsidePlane(row2, point, radius) || outsidePlane(row3 - row2, point, radius)
  );
}

fn outsidePlane(plane: vec4f, point: vec4f, radius: f32) -> bool {
  return dot(plane, point) + radius * length(plane.xyz) < 0.0;
}

@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x;
  if (index >= u32(scene.count)) { return; }
  let base = index * ${MARKER_WORDS}u;
  let alpha = source[base + 10u] >> 24u;
  if (alpha == 0u || !isVisible(base)) { return; }
  if (alpha == 255u) {
    opaqueIndices[atomicAdd(&arguments[1], 1u)] = index;
  } else {
    transparentIndices[atomicAdd(&arguments[6], 1u)] = index;
  }
}
`;
