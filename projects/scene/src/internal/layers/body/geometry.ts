// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneBodyGeometry, SceneBodyMeshNode, SceneBodyNode, SceneBodyPrimitiveNode } from './types.js';
import type { SceneMeshGeometry } from '../mesh/types.js';
import { composePreciseMat4, identityPreciseMat4, multiplyPreciseMat4 } from '../../math/mat4.js';
import { validateMeshGeometry } from '../mesh/geometry.js';
import { processMeshGeometry } from '../mesh/processing.js';
import { resolveSceneColor } from '../../color/color.js';
import type { Matrix4 } from '../../math/types.js';
import { MeshAssembly, type MeshAssemblyPart } from '../../math/mesh-assembly.js';
import type { RGBA } from '../../color/types.js';
import { PreparedRGBAModulation } from '../../color/modulation.js';
import { compileShapes, normalizeBodyShape } from './compile.js';
import { MAX_GEOMETRY_BYTES } from './limits.js';

const DEFAULT_COLOR: Readonly<RGBA> = [1, 1, 1, 1];

export interface CompiledBodyGeometry extends ReturnType<typeof compileShapes> {
  readonly uvs?: Float32Array;
}

interface Piece {
  readonly geometry: SceneMeshGeometry;
  readonly matrix: Matrix4;
  readonly color: RGBA;
}

/** Validates and captures a static graph into the shared mesh renderer representation. */
export function compileBodyGeometry(geometry: SceneBodyGeometry): CompiledBodyGeometry {
  if (!Array.isArray(geometry)) throw new TypeError('body geometry must be an array.');
  if (geometry.length > 65_536) throw new RangeError('body geometry exceeds its node limit.');
  if (geometry.every(isSimplePrimitive)) return compileShapes(geometry);
  const pieces = collectPieces(geometry);
  return concatenatePieces(pieces);
}

function isSimplePrimitive(node: SceneBodyNode): node is SceneBodyPrimitiveNode {
  if (!isNode(node)) return false;
  validateNode(node);
  return node.type !== undefined;
}

function collectPieces(roots: SceneBodyGeometry): Piece[] {
  const pieces: Piece[] = [];
  const ancestors = new Set<SceneBodyNode>();
  let nodeCount = 0;
  let bytes = 0;
  function visit(nodes: SceneBodyGeometry, parent: Matrix4, depth: number): void {
    validateHierarchyLevel(nodes, depth);
    for (const node of nodes) {
      if (!isNode(node)) throw new TypeError('body nodes must be objects.');
      if (++nodeCount > 65_536 || ancestors.has(node))
        throw new RangeError('body hierarchy exceeds its node limit or contains a cycle.');
      validateNode(node);
      const matrix = multiplyPreciseMat4(parent, localMatrix(node));
      if (node.children !== undefined) {
        ancestors.add(node);
        visit(node.children, matrix, depth + 1);
        ancestors.delete(node);
      } else {
        capturePiece(node, matrix);
      }
    }
  }
  function capturePiece(node: SceneBodyPrimitiveNode | SceneBodyMeshNode, matrix: Matrix4): void {
    const source: SceneMeshGeometry = node.geometry ?? compileShapes([{ type: node.type }]);
    bytes += compiledByteLength(source);
    if (bytes > MAX_GEOMETRY_BYTES) throw new RangeError('body geometry exceeds the compiled allocation limit.');
    validateMeshGeometry({
      ...source,
      normals: source.normals ?? null,
      colors: source.colors ?? null,
      indices: source.indices ?? null,
      uvs: source.uvs ?? null
    });
    pieces.push({ geometry: source, matrix, color: resolveSceneColor(node.color ?? DEFAULT_COLOR) });
  }
  visit(roots, identityPreciseMat4(), 0);
  return pieces;
}

function validateHierarchyLevel(nodes: SceneBodyGeometry, depth: number): void {
  if (!Array.isArray(nodes)) throw new TypeError('body children must be an array.');
  if (depth > 128) throw new RangeError('body hierarchy is too deep.');
}

function validateNode(node: SceneBodyNode): void {
  if (node.name !== undefined && typeof node.name !== 'string') throw new TypeError('body node names must be strings.');
  const inputs = [node.type, node.geometry, node.children].filter(value => value !== undefined);
  if (inputs.length !== 1) throw new TypeError('body nodes must define exactly one of type, geometry, or children.');
}

function isNode(value: unknown): value is SceneBodyNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function localMatrix(node: SceneBodyNode): Matrix4 {
  const transform = normalizeBodyShape(
    {
      type: 'cube',
      position: node.position,
      orientation: node.orientation,
      scale: node.scale
    },
    'node'
  );
  return composePreciseMat4(transform.position, transform.orientation, transform.scale);
}

function compiledByteLength(source: SceneMeshGeometry): number {
  if (!(source.positions instanceof Float32Array)) throw new TypeError('body mesh positions must be a Float32Array.');
  const expanded = !source.normals && source.indices;
  const vertices = expanded ? source.indices.length : source.positions.length / 3;
  const indices = expanded ? vertices : (source.indices?.length ?? vertices);
  return vertices * 12 * Float32Array.BYTES_PER_ELEMENT + indices * Uint32Array.BYTES_PER_ELEMENT;
}

function concatenatePieces(pieces: readonly Piece[]): CompiledBodyGeometry {
  const assembly = new MeshAssembly(pieces.map(preparePiece), { includeUvs: true });
  return assembly.assemble({
    onPositionOverflow: () => {
      throw new RangeError('body positions must fit the finite Float32 range.');
    }
  });
}

function preparePiece(piece: Piece): MeshAssemblyPart {
  const processed = processMeshGeometry({
    positions: piece.geometry.positions,
    normals: piece.geometry.normals ?? null,
    colors: piece.geometry.colors ?? null,
    indices: piece.geometry.indices ?? null,
    uvs: piece.geometry.uvs ?? null
  })!;
  return {
    positions: { values: processed.positions, offset: 0, stride: 3 },
    normals: { values: processed.normals, offset: 0, stride: 3 },
    colors: { values: processed.colors ?? DEFAULT_COLOR, offset: 0, stride: processed.colors ? 4 : 0 },
    uvs: processed.uvs ? { values: processed.uvs, offset: 0, stride: 2 } : undefined,
    indices: processed.indices,
    vertexCount: processed.vertexCount,
    matrix: piece.matrix,
    modulation: new PreparedRGBAModulation(piece.color)
  };
}
