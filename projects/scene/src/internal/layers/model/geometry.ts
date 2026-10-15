// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneModelGeometry, SceneModelNode, SceneModelPrimitiveNode } from './types.js';
import type { SceneMeshGeometry } from '../mesh/types.js';
import { composePreciseMat4, identityPreciseMat4, invertPreciseMat4, multiplyPreciseMat4 } from '../../math/mat4.js';
import { validateMeshGeometry } from '../mesh/geometry.js';
import { processMeshGeometry } from '../mesh/processing.js';
import { resolveSceneColor } from '../../color/color.js';
import type { Matrix4 } from '../../math/types.js';
import { PreparedAffineGeometryTransform } from '../../math/affine-transform.js';
import type { RGBA } from '../../color/types.js';
import { PreparedRGBAModulation } from '../../color/modulation.js';
import { compileParts, normalizeModelPart } from './compile.js';
import { MAX_MODEL_BYTES } from './limits.js';

const DEFAULT_COLOR: Readonly<RGBA> = [1, 1, 1, 1];

export interface CompiledModelGeometry extends ReturnType<typeof compileParts> {
  readonly uvs?: Float32Array;
}

interface Piece {
  readonly geometry: SceneMeshGeometry;
  readonly matrix: Matrix4;
  readonly color: RGBA;
}

/** Validates and captures a static graph into the shared mesh renderer representation. */
export function compileModelGeometry(geometry: SceneModelGeometry): CompiledModelGeometry {
  if (!Array.isArray(geometry)) throw new TypeError('Model geometry must be an array.');
  if (geometry.length > 65_536) throw new RangeError('Model geometry exceeds its node limit.');
  if (geometry.every(isSimplePrimitive)) return compileParts(geometry);
  const pieces = collectPieces(geometry);
  return concatenatePieces(pieces);
}

function isSimplePrimitive(node: SceneModelNode): node is SceneModelPrimitiveNode & { matrix?: never } {
  if (!isNode(node)) return false;
  validateNode(node);
  return node.shape !== undefined && node.matrix === undefined;
}

function collectPieces(roots: SceneModelGeometry): Piece[] {
  const pieces: Piece[] = [];
  const ancestors = new Set<SceneModelNode>();
  let nodeCount = 0;
  let bytes = 0;
  // eslint-disable-next-line complexity, max-statements -- Bounded traversal checks cycles, transforms, and allocation before capture.
  function visit(nodes: SceneModelGeometry, parent: Matrix4, depth: number): void {
    if (!Array.isArray(nodes)) throw new TypeError('Model children must be an array.');
    if (depth > 128) throw new RangeError('Model hierarchy is too deep.');
    for (const node of nodes) {
      if (!isNode(node)) throw new TypeError('Model nodes must be objects.');
      if (++nodeCount > 65_536 || ancestors.has(node))
        throw new RangeError('Model hierarchy exceeds its node limit or contains a cycle.');
      validateNode(node);
      const matrix = multiplyPreciseMat4(parent, localMatrix(node));
      if (node.children !== undefined) {
        ancestors.add(node);
        visit(node.children, matrix, depth + 1);
        ancestors.delete(node);
      } else {
        const source: SceneMeshGeometry = node.geometry ?? compileParts([{ shape: node.shape }]);
        bytes += compiledByteLength(source);
        if (bytes > MAX_MODEL_BYTES) throw new RangeError('Model geometry exceeds the compiled allocation limit.');
        validateMeshGeometry({
          ...source,
          normals: source.normals ?? null,
          colors: source.colors ?? null,
          indices: source.indices ?? null,
          uvs: source.uvs ?? null
        });
        pieces.push({ geometry: source, matrix, color: resolveSceneColor(node.color ?? '#ffffff') });
      }
    }
  }
  visit(roots, identityPreciseMat4(), 0);
  return pieces;
}

function validateNode(node: SceneModelNode): void {
  if (node.name !== undefined && typeof node.name !== 'string')
    throw new TypeError('Model node names must be strings.');
  const kinds = [node.shape, node.geometry, node.children].filter(value => value !== undefined);
  if (kinds.length !== 1) throw new TypeError('Model nodes must define exactly one of shape, geometry, or children.');
}

function isNode(value: unknown): value is SceneModelNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function localMatrix(node: SceneModelNode): Matrix4 {
  if (node.matrix !== undefined) {
    if (node.position !== undefined || node.orientation !== undefined || node.scale !== undefined)
      throw new TypeError('Model matrix and position/orientation/scale are mutually exclusive.');
    const matrix = node.matrix;
    validateMatrix(matrix);
    return matrix;
  }
  const transform = normalizeModelPart(
    {
      shape: 'cube',
      position: node.position,
      orientation: node.orientation,
      scale: node.scale
    },
    'node'
  );
  return composePreciseMat4(transform.position, transform.orientation, transform.scale);
}

function validateMatrix(matrix: Matrix4): void {
  if (!(matrix instanceof Float32Array) || matrix.length !== 16 || !matrix.every(Number.isFinite))
    throw new RangeError('Model matrix must contain 16 finite Float32 values.');
  if (
    [matrix[3], matrix[7], matrix[11], matrix[15]].some((value, index) => value !== (index === 3 ? 1 : 0)) ||
    !invertPreciseMat4(matrix)
  )
    throw new RangeError('Model matrix must be nonsingular and affine.');
}

function compiledByteLength(source: SceneMeshGeometry): number {
  if (!(source.positions instanceof Float32Array)) throw new TypeError('Model mesh positions must be a Float32Array.');
  const expanded = !source.normals && source.indices;
  const vertices = expanded ? source.indices.length : source.positions.length / 3;
  const indices = expanded ? vertices : (source.indices?.length ?? vertices);
  return vertices * 12 * Float32Array.BYTES_PER_ELEMENT + indices * Uint32Array.BYTES_PER_ELEMENT;
}

// eslint-disable-next-line max-lines-per-function, max-statements -- One allocation and ordered copies preserve batching across static graph nodes.
function concatenatePieces(pieces: readonly Piece[]): CompiledModelGeometry {
  const prepared = pieces.map(piece => ({
    ...piece,
    processed: processMeshGeometry({
      positions: piece.geometry.positions,
      normals: piece.geometry.normals ?? null,
      colors: piece.geometry.colors ?? null,
      indices: piece.geometry.indices ?? null,
      uvs: piece.geometry.uvs ?? null
    })!
  }));
  const vertexCount = prepared.reduce((count, piece) => count + piece.processed.vertexCount, 0);
  const indexCount = prepared.reduce(
    (count, piece) => count + (piece.processed.indices?.length ?? piece.processed.vertexCount),
    0
  );
  const result = {
    positions: new Float32Array(vertexCount * 3),
    normals: new Float32Array(vertexCount * 3),
    colors: new Float32Array(vertexCount * 4),
    indices: new Uint32Array(indexCount),
    uvs: new Float32Array(vertexCount * 2)
  };
  let vertexOffset = 0;
  let indexOffset = 0;
  for (const piece of prepared) {
    const { processed, matrix, color } = piece;
    const modulation = new PreparedRGBAModulation(color);
    const transform = new PreparedAffineGeometryTransform(matrix);
    for (let vertex = 0; vertex < processed.vertexCount; vertex += 1) {
      writeVertex(result, {
        vertex: vertex + vertexOffset,
        sourceVertex: vertex,
        source: processed,
        transform,
        modulation
      });
    }
    const mirrored = transform.mirrored;
    const count = processed.indices?.length ?? processed.vertexCount;
    for (let index = 0; index < count; index += 3) {
      const triangle = [0, mirrored ? 2 : 1, mirrored ? 1 : 2].map(
        offset => vertexOffset + (processed.indices?.[index + offset] ?? index + offset)
      );
      result.indices.set(triangle, indexOffset + index);
    }
    vertexOffset += processed.vertexCount;
    indexOffset += count;
  }
  return result;
}

function writeVertex(
  result: Required<CompiledModelGeometry>,
  options: {
    vertex: number;
    sourceVertex: number;
    source: SceneMeshGeometry;
    transform: PreparedAffineGeometryTransform;
    modulation: PreparedRGBAModulation;
  }
): void {
  const { vertex, sourceVertex, source, transform, modulation } = options;
  const offset = sourceVertex * 3;
  const targetOffset = vertex * 3;
  transform.writePosition(source.positions, offset, result.positions, targetOffset);
  for (let axis = 0; axis < 3; axis += 1) {
    if (!Number.isFinite(result.positions[targetOffset + axis])) {
      throw new RangeError('Model positions must fit the finite Float32 range.');
    }
  }
  transform.writeNormal(source.normals!, offset, result.normals, targetOffset);
  modulation.writeColor(
    source.colors ?? DEFAULT_COLOR,
    source.colors ? sourceVertex * 4 : 0,
    result.colors,
    vertex * 4
  );
  if (source.uvs) result.uvs.set(source.uvs.subarray(sourceVertex * 2, sourceVertex * 2 + 2), vertex * 2);
}
