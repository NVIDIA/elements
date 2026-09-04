// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
  SceneGPUBindGroup,
  SceneGPUBuffer,
  SceneGPUCommandEncoder,
  SceneGPUComputePass,
  SceneGPUComputePipeline,
  SceneGPUDevice
} from '../gpu/platform.js';
import type { HeightfieldMeshData } from '../mesh/layer-state.js';
import { createHeightfieldIndices } from './topology.js';
import {
  createGeneratedMeshGeometryResources,
  destroyMeshGeometryResources,
  type MeshGeometryResources
} from '../mesh/resources.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_UNIFORM = 0x40;
const BUFFER_STORAGE = 0x80;
const MAX_WORKGROUPS_PER_DIMENSION = 65_535;
const WORKGROUP_SIZE = 64;

interface HeightfieldGPUDevice extends SceneGPUDevice {
  readonly queue: SceneGPUDevice['queue'] & {
    writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void;
  };
  createBindGroup(descriptor: unknown): SceneGPUBindGroup;
  createBuffer(descriptor: unknown): SceneGPUBuffer;
  createComputePipeline(descriptor: unknown): SceneGPUComputePipeline;
  createShaderModule(descriptor: unknown): unknown;
}

export interface HeightfieldGPUState {
  readonly bindGroup: SceneGPUBindGroup;
  readonly colors: SceneGPUBuffer;
  readonly geometry: MeshGeometryResources;
  readonly heights: SceneGPUBuffer;
  readonly parameters: SceneGPUBuffer;
  source: HeightfieldMeshData;
  pending: boolean;
}

export class HeightfieldGPUCompiler {
  readonly #device: HeightfieldGPUDevice;
  readonly #pipeline: SceneGPUComputePipeline;

  constructor(device: HeightfieldGPUDevice) {
    this.#device = device;
    this.#pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: device.createShaderModule({ code: HEIGHTFIELD_COMPUTE_SHADER }), entryPoint: 'main' }
    });
  }

  create(source: HeightfieldMeshData): HeightfieldGPUState {
    const vertexCount = source.rows * source.columns;
    let geometry: MeshGeometryResources | undefined;
    let heights: SceneGPUBuffer | undefined;
    let colors: SceneGPUBuffer | undefined;
    let parameters: SceneGPUBuffer | undefined;
    try {
      ({ colors, geometry, heights, parameters } = this.#createResources(source, vertexCount));
      const state = {
        bindGroup: this.#createBindGroup({ colors, geometry, heights, parameters }),
        colors,
        geometry,
        heights,
        parameters,
        pending: true,
        source
      };
      this.#upload(state, source);
      return state;
    } catch (error) {
      geometry && destroyMeshGeometryResources(geometry);
      heights?.destroy();
      colors?.destroy();
      parameters?.destroy();
      throw error;
    }
  }

  #createResources(
    source: HeightfieldMeshData,
    vertexCount: number
  ): {
    readonly colors: SceneGPUBuffer;
    readonly geometry: MeshGeometryResources;
    readonly heights: SceneGPUBuffer;
    readonly parameters: SceneGPUBuffer;
  } {
    let geometry: MeshGeometryResources | undefined;
    let heights: SceneGPUBuffer | undefined;
    let colors: SceneGPUBuffer | undefined;
    let parameters: SceneGPUBuffer | undefined;
    try {
      geometry = createGeneratedMeshGeometryResources(
        this.#device,
        vertexCount,
        createHeightfieldIndices(source.rows, source.columns)
      );
      heights = this.#device.createBuffer({ size: source.heights.byteLength, usage: BUFFER_COPY_DST | BUFFER_STORAGE });
      colors = this.#device.createBuffer({
        size: source.colors?.byteLength ?? Uint32Array.BYTES_PER_ELEMENT,
        usage: BUFFER_COPY_DST | BUFFER_STORAGE
      });
      parameters = this.#device.createBuffer({ size: 32, usage: BUFFER_COPY_DST | BUFFER_UNIFORM });
      return { colors, geometry, heights, parameters };
    } catch (error) {
      geometry && destroyMeshGeometryResources(geometry);
      heights?.destroy();
      colors?.destroy();
      parameters?.destroy();
      throw error;
    }
  }

  #createBindGroup(
    resources: Readonly<{
      readonly colors: SceneGPUBuffer;
      readonly geometry: MeshGeometryResources;
      readonly heights: SceneGPUBuffer;
      readonly parameters: SceneGPUBuffer;
    }>
  ): SceneGPUBindGroup {
    const { colors, geometry, heights, parameters } = resources;
    return this.#device.createBindGroup({
      layout: this.#pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: parameters } },
        { binding: 1, resource: { buffer: heights } },
        { binding: 2, resource: { buffer: colors } },
        { binding: 3, resource: { buffer: geometry.positions } },
        { binding: 4, resource: { buffer: geometry.normals } },
        { binding: 5, resource: { buffer: geometry.colors } }
      ]
    });
  }

  update(state: HeightfieldGPUState, source: HeightfieldMeshData): void {
    if (state.source === source) return;
    this.#upload(state, source);
    state.source = source;
    state.pending = true;
  }

  encode(encoder: SceneGPUCommandEncoder, states: Iterable<HeightfieldGPUState>): void {
    const beginComputePass = encoder.beginComputePass;
    if (!beginComputePass) return;
    let pass: SceneGPUComputePass | undefined;
    for (const state of states) {
      if (!state.pending) continue;
      pass ??= beginComputePass.call(encoder);
      pass.setPipeline(this.#pipeline);
      pass.setBindGroup(0, state.bindGroup);
      const workgroups = Math.ceil((state.source.rows * state.source.columns) / WORKGROUP_SIZE);
      const dispatchWidth = Math.min(Math.ceil(Math.sqrt(workgroups)), MAX_WORKGROUPS_PER_DIMENSION);
      pass.dispatchWorkgroups(dispatchWidth, Math.ceil(workgroups / dispatchWidth));
      state.pending = false;
    }
    pass?.end();
  }

  destroy(state: HeightfieldGPUState): void {
    state.colors.destroy();
    state.heights.destroy();
    state.parameters.destroy();
  }

  #upload(state: HeightfieldGPUState, source: HeightfieldMeshData): void {
    this.#device.queue.writeBuffer(state.heights, 0, source.heights);
    if (source.colors) this.#device.queue.writeBuffer(state.colors, 0, source.colors);
    this.#device.queue.writeBuffer(state.parameters, 0, createParameters(source));
  }
}

export function supportsHeightfieldGPU(device: SceneGPUDevice): device is HeightfieldGPUDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createBuffer === 'function' &&
    typeof device.createComputePipeline === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.queue.writeBuffer === 'function'
  );
}

export function sameHeightfieldTopology(left: HeightfieldMeshData, right: HeightfieldMeshData): boolean {
  return (
    left.rows === right.rows && left.columns === right.columns && (left.colors === null) === (right.colors === null)
  );
}

export function sameHeightfieldSource(left: HeightfieldMeshData, right: HeightfieldMeshData): boolean {
  return (
    sameHeightfieldTopology(left, right) &&
    left.heights === right.heights &&
    left.colors === right.colors &&
    left.spacing === right.spacing &&
    left.origin[0] === right.origin[0] &&
    left.origin[1] === right.origin[1]
  );
}

function createParameters(source: HeightfieldMeshData): Uint8Array {
  const bytes = new Uint8Array(32);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, source.columns, true);
  view.setUint32(4, source.rows, true);
  view.setFloat32(8, source.spacing, true);
  view.setUint32(12, source.colors ? 1 : 0, true);
  view.setFloat32(16, source.origin[0], true);
  view.setFloat32(20, source.origin[1], true);
  return bytes;
}

export const HEIGHTFIELD_COMPUTE_SHADER = /* wgsl */ `
struct Parameters {
  columns: u32,
  rows: u32,
  spacing: f32,
  hasColors: u32,
  origin: vec2f,
}
@group(0) @binding(0) var<uniform> parameters: Parameters;
@group(0) @binding(1) var<storage, read> heights: array<f32>;
@group(0) @binding(2) var<storage, read> packedColors: array<u32>;
@group(0) @binding(3) var<storage, read_write> positions: array<u32>;
@group(0) @binding(4) var<storage, read_write> normals: array<u32>;
@group(0) @binding(5) var<storage, read_write> colors: array<u32>;

fn height(row: u32, column: u32) -> f32 { return heights[row * parameters.columns + column]; }
fn differenceX(row: u32, column: u32) -> f32 {
  if (column == 0u) { return (height(row, 1u) - height(row, 0u)) / parameters.spacing; }
  if (column + 1u == parameters.columns) { return (height(row, column) - height(row, column - 1u)) / parameters.spacing; }
  return (height(row, column + 1u) - height(row, column - 1u)) / (2.0 * parameters.spacing);
}
fn differenceY(row: u32, column: u32) -> f32 {
  if (row == 0u) { return (height(1u, column) - height(0u, column)) / parameters.spacing; }
  if (row + 1u == parameters.rows) { return (height(row, column) - height(row - 1u, column)) / parameters.spacing; }
  return (height(row + 1u, column) - height(row - 1u, column)) / (2.0 * parameters.spacing);
}
fn writeVec3(outputWords: ptr<storage, array<u32>, read_write>, index: u32, value: vec3f) {
  let base = index * 3u;
  (*outputWords)[base] = bitcast<u32>(value.x);
  (*outputWords)[base + 1u] = bitcast<u32>(value.y);
  (*outputWords)[base + 2u] = bitcast<u32>(value.z);
}
@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(
  @builtin(workgroup_id) workgroup: vec3u,
  @builtin(num_workgroups) workgroupCount: vec3u,
  @builtin(local_invocation_index) localIndex: u32,
) {
  let index = (workgroup.y * workgroupCount.x + workgroup.x) * ${WORKGROUP_SIZE}u + localIndex;
  if (index >= parameters.rows * parameters.columns) { return; }
  let row = index / parameters.columns;
  let column = index - row * parameters.columns;
  writeVec3(&positions, index, vec3f(parameters.origin.x + f32(column) * parameters.spacing, parameters.origin.y + f32(row) * parameters.spacing, heights[index]));
  writeVec3(&normals, index, normalize(vec3f(-differenceX(row, column), -differenceY(row, column), 1.0)));
  var packed = 0xffffffffu;
  if (parameters.hasColors != 0u) { packed = packedColors[index]; }
  let color = vec4f(vec4u(packed & 255u, (packed >> 8u) & 255u, (packed >> 16u) & 255u, packed >> 24u)) / 255.0;
  let base = index * 4u;
  colors[base] = bitcast<u32>(color.x);
  colors[base + 1u] = bitcast<u32>(color.y);
  colors[base + 2u] = bitcast<u32>(color.z);
  colors[base + 3u] = bitcast<u32>(color.w);
}
`;
