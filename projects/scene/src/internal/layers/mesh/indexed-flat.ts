// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { writeTriangleNormal } from '../../math/triangle-normal.js';
import { PREPARATION_CHUNK_SIZE } from '../../rendering/preparation.js';
import { CompressedAdjacencyIndex } from '../../structures/compressed-adjacency-index.js';
import { RangeSet, type RangeInterval } from '../../structures/range-set.js';
import type { MeshGeometryInput } from './geometry.js';
import type { ProcessedMeshGeometry } from './processing.js';
import type { MeshGeometryUploadRange, MeshRenderData } from './render-data.js';

export interface IndexedFlatInput extends MeshGeometryInput {
  readonly geometryVersions?: MeshRenderData['geometryVersions'];
  readonly geometryUploadRanges?: readonly MeshGeometryUploadRange[];
  readonly geometryUploadBaseVersions?: Partial<MeshRenderData['geometryVersions']>;
}

export interface IndexedFlatState {
  readonly adjacency: CompressedAdjacencyIndex;
  readonly source: IndexedFlatInput;
}

type Attribute = 'positions' | 'uvs' | 'colors';
type Core = Omit<ProcessedMeshGeometry, 'uploadColors' | 'uploadUvs'>;

interface AttributeUpdate {
  readonly state: IndexedFlatState;
  readonly previous: ProcessedMeshGeometry | undefined;
  readonly attribute: Attribute;
  readonly width: number;
  readonly uploads: MeshGeometryUploadRange[];
  readonly triangles: RangeSet;
}

/** One bounded traversal serves synchronous updates and cancellable preparation. */
export function* indexedFlatGeometry(options: {
  readonly source: IndexedFlatInput;
  readonly previous?: ProcessedMeshGeometry;
  readonly topologyKey: string;
}): Generator<void, Core> {
  const { source, previous, topologyKey } = options;
  const indices = source.indices!;
  const vertexCount = source.positions!.length / 3;
  const reusable =
    previous?.indexedFlat &&
    previous.vertexCount === indices.length &&
    previous.indexedFlat.source.positions!.length === source.positions!.length;
  const adjacency = reusable
    ? previous.indexedFlat.adjacency
    : yield* CompressedAdjacencyIndex.build(vertexCount, indices, PREPARATION_CHUNK_SIZE);
  const state = { adjacency, source };
  const baseline = reusable ? previous : undefined;
  const uploads: MeshGeometryUploadRange[] = [];
  const triangles = new RangeSet();
  const update = { state, previous: baseline, uploads, triangles };
  const positions = (yield* updateAttribute({ ...update, attribute: 'positions', width: 3 }))!;
  const normals = yield* updateNormals({ positions, previous: baseline, triangles, uploads });
  const uvs = yield* updateAttribute({ ...update, attribute: 'uvs', width: 2 });
  const colors = yield* updateAttribute({ ...update, attribute: 'colors', width: 4 });
  return {
    positions,
    normals,
    uvs,
    colors,
    indices: null,
    vertexCount: indices.length,
    triangleCount: indices.length / 3,
    topologyKey,
    flatNormals: true,
    indexedFlat: state,
    geometryUploadRanges: uploads
  };
}

function* copyValues(values: Float32Array): Generator<void, Float32Array> {
  const result = new Float32Array(values.length);
  for (let start = 0; start < values.length; start += PREPARATION_CHUNK_SIZE) {
    result.set(values.subarray(start, start + PREPARATION_CHUNK_SIZE), start);
    if (start + PREPARATION_CHUNK_SIZE <= values.length) yield;
  }
  return result;
}

function attributeChanged(update: AttributeUpdate): boolean {
  const { source } = update.state;
  const before = update.previous?.indexedFlat?.source;
  return (
    !source.geometryVersions ||
    !before?.geometryVersions ||
    source.geometryVersions[update.attribute] !== before.geometryVersions[update.attribute]
  );
}

// eslint-disable-next-line complexity -- Both snapshots and retained range history must be available.
function sourceRanges(update: AttributeUpdate): readonly MeshGeometryUploadRange[] | undefined {
  const { source } = update.state;
  const before = update.previous?.indexedFlat?.source;
  const base = source.geometryUploadBaseVersions?.[update.attribute];
  const version = before?.geometryVersions?.[update.attribute];
  if (base === undefined || version === undefined || base > version) return undefined;
  const ranges = source.geometryUploadRanges?.filter(range => range.attribute === update.attribute);
  return ranges?.length ? ranges : undefined;
}

function* updateAttribute(update: AttributeUpdate): Generator<void, Float32Array | null> {
  const { source } = update.state;
  const { attribute, previous, width } = update;
  if (!attributeChanged(update)) return previous![attribute];
  const values = source[attribute];
  if (values === null) {
    if (previous?.[attribute]) update.uploads.push({ attribute, offset: 0, size: source.indices!.length * width * 4 });
    return null;
  }
  const ranges = sourceRanges(update);
  const before = previous?.[attribute];
  if (ranges && before && !coversAll(values, ranges)) return yield* patchAttribute(update, ranges, before);
  return yield* expandAttribute(update, values);
}

function* expandAttribute(update: AttributeUpdate, values: Float32Array): Generator<void, Float32Array> {
  const { source } = update.state;
  const { attribute, width } = update;
  const result = new Float32Array(source.indices!.length * width);
  for (let corner = 0; corner < source.indices!.length; corner += 1) {
    copyRecord(values, source.indices![corner]!, result, corner, width);
    if ((corner + 1) % PREPARATION_CHUNK_SIZE === 0) yield;
  }
  update.uploads.push({ attribute, offset: 0, size: result.byteLength });
  if (attribute === 'positions') update.triangles.add(0, result.byteLength);
  return result;
}

function coversAll(values: Float32Array, ranges: readonly RangeInterval[]): boolean {
  return ranges.length === 1 && ranges[0]!.offset === 0 && ranges[0]!.size === values.byteLength;
}

// eslint-disable-next-line max-params -- Scalar parameters avoid an allocation for each expanded corner.
function copyRecord(source: Float32Array, vertex: number, target: Float32Array, corner: number, width: number): void {
  for (let component = 0; component < width; component += 1) {
    target[corner * width + component] = source[vertex * width + component]!;
  }
}

function* patchAttribute(
  update: AttributeUpdate,
  ranges: readonly MeshGeometryUploadRange[],
  before: Float32Array
): Generator<void, Float32Array> {
  const result = yield* copyValues(before);
  const uploads = new RangeSet();
  const patch = { update, result, uploads, work: 0 };
  for (const range of ranges) yield* patchRange(patch, range);
  for (const range of uploads.drain()) update.uploads.push({ ...range, attribute: update.attribute });
  return result;
}

function* patchRange(
  patch: {
    readonly update: AttributeUpdate;
    readonly result: Float32Array;
    readonly uploads: RangeSet;
    work: number;
  },
  range: MeshGeometryUploadRange
): Generator<void> {
  const { update, result, uploads } = patch;
  const { adjacency, source } = update.state;
  const { attribute, width, triangles } = update;
  const end = (range.offset + range.size) / (width * 4);
  for (let vertex = range.offset / (width * 4); vertex < end; vertex += 1) {
    for (let offset = adjacency.start(vertex); offset < adjacency.end(vertex); offset += 1) {
      const corner = adjacency.target(offset);
      copyRecord(source[attribute]!, vertex, result, corner, width);
      uploads.add(corner * width * 4, width * 4);
      if (attribute === 'positions') triangles.add(Math.floor(corner / 3) * 36, 36);
      if (++patch.work % PREPARATION_CHUNK_SIZE === 0) yield;
    }
    if (++patch.work % PREPARATION_CHUNK_SIZE === 0) yield;
  }
}

function* updateNormals(options: {
  readonly positions: Float32Array;
  readonly previous: ProcessedMeshGeometry | undefined;
  readonly triangles: RangeSet;
  readonly uploads: MeshGeometryUploadRange[];
}): Generator<void, Float32Array> {
  const { positions, previous, uploads } = options;
  const ranges = options.triangles.drain();
  if (ranges.length === 0 && previous) return previous.normals;
  const normals =
    previous && !coversAll(positions, ranges)
      ? yield* copyValues(previous.normals)
      : new Float32Array(positions.length);
  let work = 0;
  for (const range of ranges) {
    for (let offset = range.offset / 4; offset < (range.offset + range.size) / 4; offset += 9) {
      writeTriangleNormal({ positions, normals }, offset);
      work += 3;
      if (work >= PREPARATION_CHUNK_SIZE) {
        work = 0;
        yield;
      }
    }
    uploads.push({ ...range, attribute: 'normals' });
  }
  return normals;
}
