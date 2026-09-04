// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneGPUBuffer, SceneGPUDevice, SceneGPUQueue, SceneGPUTexture } from '../gpu/platform.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_INDEX = 0x10;
const BUFFER_VERTEX = 0x20;
const BUFFER_STORAGE = 0x80;
const TEXTURE_COPY_DST = 0x02;
const TEXTURE_SAMPLED = 0x04;
const TEXTURE_RENDER_ATTACHMENT = 0x10;
const WHITE_TEXTURE_PIXEL = new Uint8Array([255, 255, 255, 255]);

interface MeshBufferDevice extends SceneGPUDevice {
  readonly queue: SceneGPUQueue & {
    writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void;
  };
  createBuffer(descriptor: unknown): SceneGPUBuffer;
}

interface MeshDevice extends MeshBufferDevice {
  readonly queue: SceneGPUQueue & {
    copyExternalImageToTexture(
      source: { source: ImageBitmap },
      destination: { texture: SceneGPUTexture },
      copySize: { width: number; height: number }
    ): void;
    writeBuffer(buffer: SceneGPUBuffer, offset: number, data: ArrayBufferView): void;
    writeTexture(
      destination: { texture: SceneGPUTexture },
      data: ArrayBufferView,
      layout: { bytesPerRow: number },
      size: { width: number; height: number }
    ): void;
  };
  createTexture(descriptor: unknown): SceneGPUTexture;
}

/** Planar, already validated geometry. Mesh-core owns validation and normal generation. */
export interface MeshGeometryUpload {
  readonly colors: Float32Array;
  readonly indices: Uint32Array | null;
  readonly normals: Float32Array;
  readonly positions: Float32Array;
  readonly uvs: Float32Array;
}

export interface MeshGeometryResources {
  readonly colors: SceneGPUBuffer;
  readonly index: SceneGPUBuffer | undefined;
  readonly indexCount: number;
  readonly normals: SceneGPUBuffer;
  readonly positions: SceneGPUBuffer;
  readonly uvs: SceneGPUBuffer;
  readonly vertexCount: number;
}

/** Owns GPU buffers only; it deliberately does not validate or transform mesh arrays. */
export function createMeshGeometryResources(
  device: MeshBufferDevice,
  geometry: MeshGeometryUpload
): MeshGeometryResources {
  const buffers: SceneGPUBuffer[] = [];
  const track = <Buffer extends SceneGPUBuffer | undefined>(buffer: Buffer): Buffer => {
    if (buffer) buffers.push(buffer);
    return buffer;
  };
  try {
    const positions = track(createVertexBuffer(device, geometry.positions));
    const normals = track(createVertexBuffer(device, geometry.normals));
    const uvs = track(createVertexBuffer(device, geometry.uvs));
    const colors = track(createVertexBuffer(device, geometry.colors));
    const index = track(geometry.indices ? createIndexBuffer(device, geometry.indices) : undefined);
    return {
      colors,
      index,
      indexCount: geometry.indices?.length ?? 0,
      normals,
      positions,
      uvs,
      vertexCount: geometry.positions.length / 3
    };
  } catch (error) {
    buffers.forEach(buffer => buffer.destroy());
    throw error;
  }
}

/** Allocates mesh attributes that a compute pass will populate before drawing. */
// eslint-disable-next-line max-statements -- Resource creation keeps all generated buffer ownership together for rollback.
export function createGeneratedMeshGeometryResources(
  device: MeshBufferDevice,
  vertexCount: number,
  indices: Uint32Array
): MeshGeometryResources {
  let colors: SceneGPUBuffer | undefined;
  let index: SceneGPUBuffer | undefined;
  let normals: SceneGPUBuffer | undefined;
  let positions: SceneGPUBuffer | undefined;
  let uvs: SceneGPUBuffer | undefined;
  try {
    colors = createGeneratedVertexBuffer(device, vertexCount * 4);
    index = createIndexBuffer(device, indices);
    normals = createGeneratedVertexBuffer(device, vertexCount * 3);
    positions = createGeneratedVertexBuffer(device, vertexCount * 3);
    uvs = device.createBuffer({ size: vertexCount * 2 * Float32Array.BYTES_PER_ELEMENT, usage: BUFFER_VERTEX });
    return { colors, index, indexCount: indices.length, normals, positions, uvs, vertexCount };
  } catch (error) {
    colors?.destroy();
    index?.destroy();
    normals?.destroy();
    positions?.destroy();
    uvs?.destroy();
    throw error;
  }
}

/** Updates only the supplied planar GPU buffer; the renderer replaces topology. */
export function uploadMeshGeometryBuffer(
  device: MeshBufferDevice,
  buffer: SceneGPUBuffer,
  values: Float32Array | Uint32Array
): void {
  device.queue.writeBuffer(buffer, 0, values);
}

export function destroyMeshGeometryResources(resources: MeshGeometryResources): void {
  resources.positions.destroy();
  resources.normals.destroy();
  resources.uvs.destroy();
  resources.colors.destroy();
  resources.index?.destroy();
}

export interface MeshTextureResource {
  readonly source: ImageBitmap;
  readonly texture: SceneGPUTexture;
}

/** Uploads an sRGB base-color image. Callers own replacement/lifetime decisions. */
export function createMeshTextureResource(device: MeshDevice, source: ImageBitmap): MeshTextureResource {
  const texture = device.createTexture({
    format: 'rgba8unorm-srgb',
    size: { width: source.width, height: source.height },
    usage: TEXTURE_COPY_DST | TEXTURE_SAMPLED | TEXTURE_RENDER_ATTACHMENT
  });
  device.queue.copyExternalImageToTexture({ source }, { texture }, { width: source.width, height: source.height });
  return { source, texture };
}

export function destroyMeshTextureResource(resource: MeshTextureResource | undefined): void {
  resource?.texture.destroy?.();
}

/** Creates the fallback for untextured meshes while retaining one shader layout. */
export function createMeshWhiteTexture(device: MeshDevice): SceneGPUTexture {
  const texture = device.createTexture({
    format: 'rgba8unorm-srgb',
    size: { width: 1, height: 1 },
    usage: TEXTURE_COPY_DST | TEXTURE_SAMPLED
  });
  device.queue.writeTexture({ texture }, WHITE_TEXTURE_PIXEL, { bytesPerRow: 4 }, { width: 1, height: 1 });
  return texture;
}

function createVertexBuffer(device: MeshBufferDevice, values: Float32Array): SceneGPUBuffer {
  const buffer = device.createBuffer({ size: values.byteLength, usage: BUFFER_COPY_DST | BUFFER_VERTEX });
  try {
    device.queue.writeBuffer(buffer, 0, values);
  } catch (error) {
    buffer.destroy();
    throw error;
  }
  return buffer;
}

function createGeneratedVertexBuffer(device: MeshBufferDevice, floatCount: number): SceneGPUBuffer {
  return device.createBuffer({
    size: floatCount * Float32Array.BYTES_PER_ELEMENT,
    usage: BUFFER_STORAGE | BUFFER_VERTEX
  });
}

function createIndexBuffer(device: MeshBufferDevice, values: Uint32Array): SceneGPUBuffer {
  let buffer: SceneGPUBuffer | undefined;
  try {
    buffer = device.createBuffer({ size: values.byteLength, usage: BUFFER_COPY_DST | BUFFER_INDEX });
    device.queue.writeBuffer(buffer, 0, values);
    return buffer;
  } catch (error) {
    buffer?.destroy();
    throw error;
  }
}
