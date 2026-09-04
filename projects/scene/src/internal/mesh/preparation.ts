// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { HeightfieldGrid } from '../heightfield/types.js';
import { MARKER } from '../layouts/built-ins.js';
import { writeMarker } from '../layouts/helpers.js';
import { PREPARATION_CHUNK_SIZE } from '../preparation.js';
import type { MeshRenderItem } from '../rendering/render-items.js';
import { mergeUploadRanges } from '../upload-ranges.js';
import type { HeightfieldMeshData, MeshGeometryAttribute, MeshRenderData } from './layer-state.js';
import type { ProcessedMeshGeometry } from './processing.js';
import type { MeshGeometryUpload } from './resources.js';

export interface MeshGeometrySource {
  readonly colors: Float32Array | null;
  readonly indices: Uint32Array | null;
  readonly normals: Float32Array | null;
  readonly positions: Float32Array | null;
  readonly topologyVersion: number;
  readonly uvs: Float32Array | null;
  readonly versions: MeshRenderData['geometryVersions'];
}

const GEOMETRY_ATTRIBUTES: readonly MeshGeometryAttribute[] = ['positions', 'normals', 'uvs', 'colors', 'indices'];

export function meshSource(item: MeshRenderItem): MeshGeometrySource {
  return {
    colors: item.data.colors,
    indices: item.data.indices,
    normals: item.data.normals,
    positions: item.data.positions,
    topologyVersion: item.data.topologyVersion,
    uvs: item.data.uvs,
    versions: { ...item.data.geometryVersions }
  };
}

export function meshSourceFromProcessed(item: MeshRenderItem, processed: ProcessedMeshGeometry): MeshGeometrySource {
  return {
    colors: processed.colors,
    indices: processed.indices,
    normals: processed.normals,
    positions: processed.positions,
    topologyVersion: item.data.topologyVersion,
    uvs: processed.uvs,
    versions: { ...item.data.geometryVersions }
  };
}

export function sameMeshGeometrySource(source: MeshGeometrySource, item: MeshRenderItem): boolean {
  return sameMeshSources(source, meshSource(item));
}

export function sameMeshSources(left: MeshGeometrySource, right: MeshGeometrySource): boolean {
  return (
    left.topologyVersion === right.topologyVersion &&
    left.positions === right.positions &&
    left.normals === right.normals &&
    left.uvs === right.uvs &&
    left.colors === right.colors &&
    left.indices === right.indices &&
    GEOMETRY_ATTRIBUTES.every(attribute => left.versions[attribute] === right.versions[attribute])
  );
}

export function requiresMeshPreparation(data: MeshRenderData): boolean {
  return meshPreparationWork(data) > PREPARATION_CHUNK_SIZE;
}

function meshPreparationWork(data: MeshRenderData): number {
  const vertexCount = (data.positions?.length ?? 0) / 3;
  const defaultColorWork = data.colors === null ? vertexCount * 4 : 0;
  if (data.normals !== null) return vertexCount + defaultColorWork;
  const generatedVertexCount = data.indices?.length ?? vertexCount;
  return vertexCount + defaultColorWork + generatedVertexCount * 4 + indexedAttributeWork(data);
}

function indexedAttributeWork(data: MeshRenderData): number {
  const indexCount = data.indices?.length ?? 0;
  if (indexCount === 0) return 0;
  const uvWork = data.uvs === null ? 0 : indexCount * 2;
  const colorWork = data.colors === null ? 0 : indexCount * 4;
  return uvWork + colorWork;
}

export function heightfieldTopologyWorkIsBounded(source: HeightfieldMeshData): boolean {
  return (source.rows - 1) * (source.columns - 1) <= PREPARATION_CHUNK_SIZE;
}

export function heightfieldPreparationWorkIsBounded(source: HeightfieldMeshData): boolean {
  return source.rows * source.columns <= PREPARATION_CHUNK_SIZE && heightfieldTopologyWorkIsBounded(source);
}

export function heightfieldGrid(source: HeightfieldMeshData): HeightfieldGrid {
  return {
    columns: source.columns,
    heights: source.heights,
    origin: source.origin,
    rows: source.rows,
    spacing: source.spacing,
    ...(source.colors ? { colors: source.colors } : {})
  };
}

export function retainGeometryUploadRanges(item: MeshRenderItem, previous?: MeshRenderItem): MeshRenderItem {
  if (!previous || previous.data.topologyVersion !== item.data.topologyVersion) return item;
  const ranges = GEOMETRY_ATTRIBUTES.flatMap(attribute =>
    mergeUploadRanges(
      [...previous.data.geometryUploadRanges, ...item.data.geometryUploadRanges]
        .filter(range => range.attribute === attribute)
        .map(({ offset, size }) => ({ offset, size }))
    ).map(range => ({ ...range, attribute }))
  );
  return { ...item, data: { ...item.data, geometryUploadRanges: ranges } };
}

export function meshUpload(processed: ProcessedMeshGeometry): MeshGeometryUpload {
  return {
    colors: processed.uploadColors,
    indices: processed.indices,
    normals: processed.normals,
    positions: processed.positions,
    uvs: processed.uploadUvs
  };
}

export function createIdentityMarkerBytes(): Uint8Array {
  const bytes = new Uint8Array(MARKER.stride);
  writeMarker(bytes, 0, { position: [0, 0, 0] });
  return bytes;
}
