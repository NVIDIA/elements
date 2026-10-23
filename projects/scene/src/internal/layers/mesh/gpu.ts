// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
  SceneGPUBindGroup,
  SceneGPUBuffer,
  SceneGPUCommandEncoder,
  SceneGPUComputeDevice,
  SceneGPUComputePipeline
} from '../../gpu/platform.js';
import { maximumStoragePartitionByteLength } from '../../gpu/partition.js';
import { planBufferUploads } from '../../gpu/buffer-upload-plan.js';
import { hasVersionedRangeCoverage } from '../../structures/versioned-range-journal.js';
import type { MeshRenderData } from './render-data.js';
import { uploadMeshGeometryBuffer, type MeshGeometryResources } from './resources.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_VERTEX = 0x20;
const BUFFER_UNIFORM = 0x40;
const BUFFER_STORAGE = 0x80;
const WORKGROUP_SIZE = 64;
const POSITIONS = 1;
const UVS = 2;
const COLORS = 4;
const ALL_ATTRIBUTES = POSITIONS | UVS | COLORS;
const ATTRIBUTES = ['positions', 'uvs', 'colors'] as const;
const INPUT_ATTRIBUTES = [...ATTRIBUTES, 'indices'] as const;
const ATTRIBUTE_MASKS = { positions: POSITIONS, uvs: UVS, colors: COLORS };
const coordinateSafety = new WeakMap<Float32Array, { readonly version: number; readonly safe: boolean }>();

export interface MeshGPUState {
  readonly bindGroup: SceneGPUBindGroup;
  readonly geometry: MeshGeometryResources;
  readonly inputs: Readonly<Record<'positions' | 'indices' | 'uvs' | 'colors', SceneGPUBuffer>>;
  readonly parameters: SceneGPUBuffer;
  source: MeshRenderData;
  pending: number;
}

/** Keeps small meshes and buffers that exceed storage binding limits on the CPU path. */
export function meshGPUIsEligible(source: MeshRenderData, device: SceneGPUComputeDevice): boolean {
  if (source.normals !== null || !source.positions || source.heightfield) return false;
  const count = source.indices?.length ?? source.positions.length / 3;
  if (count < 16_384) return false;
  const maximum = maximumStoragePartitionByteLength(device);
  return (
    count * 16 <= maximum &&
    INPUT_ATTRIBUTES.every(attribute => inputByteLength(source, attribute) <= maximum) &&
    hasSupportedCoordinates(source.positions, source.geometryVersions.positions)
  );
}

/** Extreme coordinates keep the CPU normal generator's number precision. Immutable snapshots carry version numbers. */
function hasSupportedCoordinates(positions: Float32Array, version: number): boolean {
  const cached = coordinateSafety.get(positions);
  if (cached?.version === version) return cached.safe;
  const safe = positions.every(value => value === 0 || (Math.abs(value) >= 1e-18 && Math.abs(value) <= 1e18));
  coordinateSafety.set(positions, { version, safe });
  return safe;
}

export function sameMeshGPUTopology(state: MeshGPUState, source: MeshRenderData): boolean {
  const previous = state.source;
  return (
    previous.topologyVersion === source.topologyVersion &&
    INPUT_ATTRIBUTES.every(attribute => inputByteLength(previous, attribute) === inputByteLength(source, attribute))
  );
}

function inputByteLength(source: MeshRenderData, attribute: (typeof INPUT_ATTRIBUTES)[number]): number {
  return source[attribute]?.byteLength ?? 4;
}

function createGeometry(
  allocate: (size: number, usage: number) => SceneGPUBuffer,
  count: number
): MeshGeometryResources {
  return {
    positions: allocate(count * 12, BUFFER_STORAGE | BUFFER_VERTEX),
    normals: allocate(count * 12, BUFFER_STORAGE | BUFFER_VERTEX),
    uvs: allocate(count * 8, BUFFER_STORAGE | BUFFER_VERTEX),
    colors: allocate(count * 16, BUFFER_STORAGE | BUFFER_VERTEX),
    vertexCount: count,
    index: undefined,
    indexCount: 0
  };
}

/** Expands flat triangle attributes into retained vertex buffers without CPU readback. */
export class MeshGPUCompiler {
  readonly #device: SceneGPUComputeDevice;
  readonly #pipeline: SceneGPUComputePipeline;
  readonly #parameters = new Uint32Array(8);

  constructor(device: SceneGPUComputeDevice) {
    this.#device = device;
    this.#pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: device.createShaderModule({ code: MESH_COMPUTE_SHADER }), entryPoint: 'main' }
    });
  }

  create(source: MeshRenderData): MeshGPUState {
    const buffers: SceneGPUBuffer[] = [];
    const allocate = (size: number, usage: number): SceneGPUBuffer => {
      const buffer = this.#device.createBuffer({ size: Math.max(4, size), usage });
      buffers.push(buffer);
      return buffer;
    };
    const count = source.indices?.length ?? source.positions!.length / 3;
    try {
      const inputs = {
        positions: allocate(inputByteLength(source, 'positions'), BUFFER_STORAGE | BUFFER_COPY_DST),
        indices: allocate(inputByteLength(source, 'indices'), BUFFER_STORAGE | BUFFER_COPY_DST),
        uvs: allocate(inputByteLength(source, 'uvs'), BUFFER_STORAGE | BUFFER_COPY_DST),
        colors: allocate(inputByteLength(source, 'colors'), BUFFER_STORAGE | BUFFER_COPY_DST)
      };
      const geometry = createGeometry(allocate, count);
      const parameters = allocate(32, BUFFER_UNIFORM | BUFFER_COPY_DST);
      const bindings = [
        inputs.positions,
        inputs.indices,
        inputs.uvs,
        inputs.colors,
        geometry.positions,
        geometry.normals,
        geometry.uvs,
        geometry.colors,
        parameters
      ];
      const bindGroup = this.#device.createBindGroup({
        layout: this.#pipeline.getBindGroupLayout(0),
        entries: bindings.map((buffer, binding) => ({ binding, resource: { buffer } }))
      });
      for (const attribute of [...ATTRIBUTES, 'indices'] as const) {
        const values = source[attribute];
        // eslint-disable-next-line local-performance/no-gpu-upload-in-loop -- Each source attribute has one retained buffer and one initial upload.
        if (values) this.#device.queue.writeBuffer(inputs[attribute], 0, values);
      }
      return { bindGroup, geometry, inputs, parameters, source, pending: ALL_ATTRIBUTES };
    } catch (error) {
      buffers.forEach(buffer => buffer.destroy());
      throw error;
    }
  }

  update(state: MeshGPUState, source: MeshRenderData): void {
    for (const attribute of ATTRIBUTES) {
      if (
        state.source[attribute] === source[attribute] &&
        state.source.geometryVersions[attribute] === source.geometryVersions[attribute]
      )
        continue;
      const values = source[attribute];
      if (!values) continue;
      const ranges = hasVersionedRangeCoverage(
        source.geometryUploadBaseVersions?.[attribute],
        source.geometryVersions[attribute],
        state.source.geometryVersions[attribute]
      )
        ? source.geometryUploadRanges.filter(range => range.attribute === attribute)
        : undefined;
      const uploads = planBufferUploads({
        byteLength: values.byteLength,
        ranges: ranges ?? [{ offset: 0, size: values.byteLength }],
        maxWrites: 64
      });
      for (const range of uploads) {
        uploadMeshGeometryBuffer({ buffer: state.inputs[attribute], device: this.#device, values, range });
      }
      if (uploads.length > 0) state.pending |= ATTRIBUTE_MASKS[attribute];
    }
    state.source = source;
  }

  encode(encoder: SceneGPUCommandEncoder, states: Iterable<MeshGPUState>): void {
    if (!encoder.beginComputePass) return;
    let pass;
    for (const state of states) {
      if (state.pending === 0) continue;
      const triangles = state.geometry.vertexCount / 3;
      this.#parameters.set([
        triangles,
        Number(state.source.indices !== null),
        Number(state.source.uvs !== null),
        Number(state.source.colors !== null),
        state.pending
      ]);
      // eslint-disable-next-line local-performance/no-gpu-upload-in-loop -- One uniform write describes all changed attributes for this mesh dispatch.
      this.#device.queue.writeBuffer(state.parameters, 0, this.#parameters);
      pass ??= encoder.beginComputePass();
      pass.setPipeline(this.#pipeline);
      pass.setBindGroup(0, state.bindGroup);
      const groups = Math.ceil(triangles / WORKGROUP_SIZE);
      const width = Math.min(
        Math.ceil(Math.sqrt(groups)),
        this.#device.limits?.maxComputeWorkgroupsPerDimension ?? 65_535
      );
      pass.dispatchWorkgroups(width, Math.ceil(groups / width));
      state.pending = 0;
    }
    pass?.end();
  }

  destroy(state: MeshGPUState): void {
    for (const buffer of Object.values(state.inputs)) buffer.destroy();
    state.parameters.destroy();
  }
}

const MESH_COMPUTE_SHADER = /* wgsl */ `
struct Parameters { triangles: u32, indexed: u32, hasUvs: u32, hasColors: u32, changed: u32 }
@group(0) @binding(0) var<storage, read> sourcePositions: array<f32>;
@group(0) @binding(1) var<storage, read> indices: array<u32>;
@group(0) @binding(2) var<storage, read> sourceUvs: array<f32>;
@group(0) @binding(3) var<storage, read> sourceColors: array<f32>;
@group(0) @binding(4) var<storage, read_write> positions: array<f32>;
@group(0) @binding(5) var<storage, read_write> normals: array<f32>;
@group(0) @binding(6) var<storage, read_write> uvs: array<f32>;
@group(0) @binding(7) var<storage, read_write> colors: array<f32>;
@group(0) @binding(8) var<uniform> parameters: Parameters;
fn position(index: u32) -> vec3f {
  let base = index * 3u;
  return vec3f(sourcePositions[base], sourcePositions[base + 1u], sourcePositions[base + 2u]);
}
fn maxComponent(value: vec3f) -> f32 { return max(max(abs(value.x), abs(value.y)), abs(value.z)); }
fn flatNormal(a: vec3f, b: vec3f, c: vec3f) -> vec3f {
  let ab = b - a;
  let ac = c - a;
  let abScale = maxComponent(ab);
  let acScale = maxComponent(ac);
  if (abScale == 0.0 || acScale == 0.0) { return vec3f(0.0, 0.0, 1.0); }
  let value = cross(ab / abScale, ac / acScale);
  let scale = maxComponent(value);
  if (scale == 0.0) { return vec3f(0.0, 0.0, 1.0); }
  return normalize(value / scale);
}
@compute @workgroup_size(${WORKGROUP_SIZE})
fn main(
  @builtin(workgroup_id) group: vec3u,
  @builtin(num_workgroups) groupCount: vec3u,
  @builtin(local_invocation_index) local: u32
) {
  let triangle = (group.y * groupCount.x + group.x) * ${WORKGROUP_SIZE}u + local;
  if (triangle >= parameters.triangles) { return; }
  let start = triangle * 3u;
  var vertices = vec3u(start, start + 1u, start + 2u);
  if (parameters.indexed != 0u) { vertices = vec3u(indices[start], indices[start + 1u], indices[start + 2u]); }
  if ((parameters.changed & ${POSITIONS}u) != 0u) {
    let a = position(vertices.x);
    let b = position(vertices.y);
    let c = position(vertices.z);
    let normal = flatNormal(a, b, c);
    let points = array<vec3f, 3>(a, b, c);
    for (var corner = 0u; corner < 3u; corner++) {
      let destination = (start + corner) * 3u;
      for (var axis = 0u; axis < 3u; axis++) {
        positions[destination + axis] = points[corner][axis];
        normals[destination + axis] = normal[axis];
      }
    }
  }
  for (var corner = 0u; corner < 3u; corner++) {
    let vertex = vertices[corner];
    if ((parameters.changed & ${UVS}u) != 0u) {
      for (var axis = 0u; axis < 2u; axis++) {
        var value = 0.0;
        if (parameters.hasUvs != 0u) { value = sourceUvs[vertex * 2u + axis]; }
        uvs[(start + corner) * 2u + axis] = value;
      }
    }
    if ((parameters.changed & ${COLORS}u) != 0u) {
      for (var axis = 0u; axis < 4u; axis++) {
        var value = 1.0;
        if (parameters.hasColors != 0u) { value = sourceColors[vertex * 4u + axis]; }
        colors[(start + corner) * 4u + axis] = value;
      }
    }
  }
}
`;
