// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RGBA } from '../types.js';

export type MeshGeometryAttribute = 'positions' | 'normals' | 'uvs' | 'colors' | 'indices';

export interface MeshGeometryUploadRange {
  readonly attribute: MeshGeometryAttribute;
  readonly offset: number;
  readonly size: number;
}

export type MeshGeometryAttributeVersions = Readonly<Record<MeshGeometryAttribute, number>>;

export interface HeightfieldMeshData {
  readonly colors: Uint8Array | null;
  readonly columns: number;
  readonly heights: Float32Array;
  readonly origin: readonly [number, number];
  readonly rows: number;
  readonly spacing: number;
}

export interface MeshRenderData {
  readonly bytes: Uint8Array | null;
  readonly uploadRanges: readonly { readonly offset: number; readonly size: number }[];
  readonly transparent: boolean;
  readonly ready: boolean;
  readonly positions: Float32Array | null;
  readonly normals: Float32Array | null;
  readonly uvs: Float32Array | null;
  readonly colors: Float32Array | null;
  readonly indices: Uint32Array | null;
  readonly texture: ImageBitmap | null;
  readonly color: RGBA;
  readonly version: number;
  readonly topologyVersion: number;
  readonly geometryError: boolean;
  readonly geometryUploadRanges: readonly MeshGeometryUploadRange[];
  readonly geometryVersions: MeshGeometryAttributeVersions;
  readonly identityInstance: boolean;
  readonly heightfield?: HeightfieldMeshData;
  readonly shading?: MeshShading;
}

type MeshShading = 'lit' | 'unlit';

/** Renderer-boundary input shared by authored meshes and geometry constructors. */
interface ConstructedMeshRenderDataOptions {
  readonly color: RGBA;
  readonly colors: Float32Array | null;
  readonly geometryError: boolean;
  readonly geometryUploadRanges?: readonly MeshGeometryUploadRange[];
  readonly geometryVersions?: MeshGeometryAttributeVersions;
  readonly identityInstance: boolean;
  readonly heightfield?: HeightfieldMeshData;
  readonly indices: Uint32Array | null;
  readonly normals: Float32Array | null;
  readonly positions: Float32Array | null;
  readonly texture: ImageBitmap | null;
  readonly topologyVersion: number;
  readonly uvs: Float32Array | null;
  readonly version: number;
  readonly shading?: MeshShading;
}

/** Produces one normalized renderer snapshot for mesh-like geometry. */
export function createConstructedMeshRenderData(options: ConstructedMeshRenderDataOptions): MeshRenderData {
  const texture = options.uvs ? options.texture : null;
  const ready = !options.geometryError && (!!options.positions?.length || options.heightfield !== undefined);
  return {
    bytes: null,
    uploadRanges: [],
    transparent: meshIsTransparent(options, texture),
    ready,
    positions: options.positions,
    normals: options.normals,
    uvs: options.uvs,
    colors: options.colors,
    indices: options.indices,
    texture,
    color: [...options.color] as RGBA,
    version: options.version,
    topologyVersion: options.topologyVersion,
    geometryError: options.geometryError,
    geometryUploadRanges: options.geometryUploadRanges ?? [],
    geometryVersions: options.geometryVersions ?? createMeshGeometryAttributeVersions(),
    identityInstance: ready && options.identityInstance,
    ...(options.heightfield ? { heightfield: options.heightfield } : {}),
    shading: options.shading ?? 'lit'
  };
}

export function createMeshGeometryAttributeVersions(): Record<MeshGeometryAttribute, number> {
  return { colors: 0, indices: 0, normals: 0, positions: 0, uvs: 0 };
}

function meshIsTransparent(options: ConstructedMeshRenderDataOptions, texture: ImageBitmap | null): boolean {
  if (texture !== null || options.color[3] < 1) return true;
  return hasTransparentVertexColor(options.colors) || hasTransparentHeightfieldColor(options.heightfield?.colors);
}

function hasTransparentVertexColor(colors: Float32Array | null): boolean {
  if (colors === null) return false;
  for (let index = 3; index < colors.length; index += 4) {
    if (colors[index]! < 1) return true;
  }
  return false;
}

function hasTransparentHeightfieldColor(colors: Uint8Array | null | undefined): boolean {
  if (!colors) return false;
  for (let index = 3; index < colors.length; index += 4) {
    if (colors[index]! < 255) return true;
  }
  return false;
}
