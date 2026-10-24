// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneBodyGeometry, SceneBodyMeshNode, SceneBodyNode, SceneBodyPrimitiveNode } from './types.js';
import type { SceneMeshGeometry } from '../mesh/types.js';
import { composePreciseMat4, identityPreciseMat4, multiplyPreciseMat4 } from '../../math/mat4.js';
import { validateMeshGeometrySteps } from '../mesh/geometry.js';
import { continueMeshGeometryPreparation, processMeshGeometry } from '../mesh/processing.js';
import { resolveSceneColor } from '../../color/color.js';
import type { Matrix4 } from '../../math/types.js';
import { MeshAssembly, type MeshAssemblyPart } from '../../math/mesh-assembly.js';
import type { RGBA } from '../../color/types.js';
import { PreparedRGBAModulation } from '../../color/modulation.js';
import { compileShapes, getBodyPrimitiveGeometry, normalizeBodyShape, prepareBodyShapes } from './compile.js';
import { EMPTY_ALPHA_SUMMARY, mergeAlphaSummaries, summarizeRGBAAlpha, type AlphaSummary } from '../../color/alpha.js';
import { MAX_GEOMETRY_BYTES } from './limits.js';

import {
  beginPreparation,
  continuePreparation,
  resumePreparation,
  runPreparationSync,
  PREPARATION_CHUNK_SIZE,
  type PreparationContext
} from '../../rendering/preparation.js';

const DEFAULT_COLOR: Readonly<RGBA> = [1, 1, 1, 1];

export interface CompiledBodyGeometry extends ReturnType<typeof compileShapes> {
  readonly alphaSummary?: AlphaSummary;
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
  const pieces = runPreparationSync(collectPieces(geometry, Number.MAX_SAFE_INTEGER));
  return concatenatePieces(pieces);
}

/** Bounds synchronous property assignments before traversing or reading their complete payload. */
export function bodyGeometryWorkIsBounded(geometry: SceneBodyGeometry): boolean {
  if (!Array.isArray(geometry)) throw new TypeError('body geometry must be an array.');
  let work = 0;
  let nodes = 0;
  function visit(items: SceneBodyGeometry, depth: number): boolean {
    validateHierarchyLevel(items, depth);
    for (const node of items) {
      if (++nodes > 64) return false;
      if (!isNode(node)) throw new TypeError('body nodes must be objects.');
      validateNode(node);
      if (node.children !== undefined) {
        if (!visit(node.children, depth + 1)) return false;
      } else if (node.geometry !== undefined) {
        work += meshWork(node.geometry);
      } else if (node.type !== undefined) {
        const primitive = getBodyPrimitiveGeometry(node.type);
        work += primitive.vertices.length * 2 + primitive.indices.length;
      }
      if (work > PREPARATION_CHUNK_SIZE) return false;
    }
    return true;
  }
  return visit(geometry, 0);
}

function meshWork(geometry: SceneMeshGeometry): number {
  let work = compiledByteLength(geometry) / 4;
  for (const name of ['positions', 'normals', 'uvs', 'colors', 'indices'] as const) {
    const values = geometry[name];
    if (ArrayBuffer.isView(values)) work += values.byteLength / 4;
  }
  return work;
}

/** Validates and assembles borrowed geometry without blocking a browser task on the full payload. */
export async function prepareBodyGeometry(
  geometry: SceneBodyGeometry,
  context: PreparationContext
): Promise<CompiledBodyGeometry | undefined> {
  if (!(await beginPreparation(context))) return undefined;
  if (!Array.isArray(geometry)) throw new TypeError('body geometry must be an array.');
  if (geometry.length > 65_536) throw new RangeError('body geometry exceeds its node limit.');
  const primitives = await resumePreparation(simplePrimitives(geometry), context);
  if (primitives === undefined) return undefined;
  if (primitives) return prepareBodyShapes(geometry as readonly SceneBodyPrimitiveNode[], context);
  const compiled = await prepareBodyPieces(geometry, context);
  return compiled ? resumePreparation(summarizeBodyAlpha(compiled), context) : undefined;
}

async function prepareBodyPieces(
  geometry: SceneBodyGeometry,
  context: PreparationContext
): Promise<CompiledBodyGeometry | undefined> {
  const pieces = await resumePreparation(collectPieces(geometry), context);
  if (!pieces) return undefined;
  const parts: MeshAssemblyPart[] = [];
  for (const piece of pieces) {
    const processed = await continueMeshGeometryPreparation(meshInput(piece), context);
    if (!processed) return undefined;
    parts.push(piecePart(piece, processed));
    if (parts.length % 64 === 0 && !(await continuePreparation(context))) return undefined;
  }
  return resumePreparation(new MeshAssembly(parts, { includeUvs: true }).assembleSteps(BODY_ASSEMBLY_OPTIONS), context);
}

function* summarizeBodyAlpha(compiled: CompiledBodyGeometry): Generator<void, CompiledBodyGeometry> {
  let alphaSummary = EMPTY_ALPHA_SUMMARY;
  for (let start = 0; start < compiled.colors.length; start += PREPARATION_CHUNK_SIZE) {
    alphaSummary = mergeAlphaSummaries(
      alphaSummary,
      summarizeRGBAAlpha(compiled.colors.subarray(start, start + PREPARATION_CHUNK_SIZE))
    );
    if (start + PREPARATION_CHUNK_SIZE <= compiled.colors.length) yield;
  }
  return { ...compiled, alphaSummary };
}

const BODY_ASSEMBLY_OPTIONS = {
  onPositionOverflow: () => {
    throw new RangeError('body positions must fit the finite Float32 range.');
  }
};

function* simplePrimitives(geometry: SceneBodyGeometry): Generator<void, boolean> {
  for (let index = 0; index < geometry.length; index += 1) {
    if (!isSimplePrimitive(geometry[index]!)) return false;
    if ((index + 1) % 64 === 0) yield;
  }
  return true;
}

function isSimplePrimitive(node: SceneBodyNode): node is SceneBodyPrimitiveNode {
  if (!isNode(node)) return false;
  validateNode(node);
  return node.type !== undefined;
}

function* collectPieces(roots: SceneBodyGeometry, chunkSize = PREPARATION_CHUNK_SIZE): Generator<void, Piece[]> {
  const pieces: Piece[] = [];
  const ancestors = new Set<SceneBodyNode>();
  let nodeCount = 0;
  let bytes = 0;
  function* visit(nodes: SceneBodyGeometry, parent: Matrix4, depth: number): Generator<void> {
    validateHierarchyLevel(nodes, depth);
    for (const node of nodes) {
      if (!isNode(node)) throw new TypeError('body nodes must be objects.');
      if (++nodeCount > 65_536 || ancestors.has(node))
        throw new RangeError('body hierarchy exceeds its node limit or contains a cycle.');
      validateNode(node);
      const matrix = multiplyPreciseMat4(parent, localMatrix(node));
      if (node.children !== undefined) {
        ancestors.add(node);
        yield* visit(node.children, matrix, depth + 1);
        ancestors.delete(node);
      } else {
        yield* capturePiece(node, matrix);
      }
      if (nodeCount % 64 === 0 && chunkSize !== Number.MAX_SAFE_INTEGER) yield;
    }
  }
  function* capturePiece(node: SceneBodyPrimitiveNode | SceneBodyMeshNode, matrix: Matrix4): Generator<void> {
    const source: SceneMeshGeometry = node.geometry ?? compileShapes([{ type: node.type }]);
    bytes += compiledByteLength(source);
    if (bytes > MAX_GEOMETRY_BYTES) throw new RangeError('body geometry exceeds the compiled allocation limit.');
    yield* validateMeshGeometrySteps(
      {
        ...source,
        normals: source.normals ?? null,
        colors: source.colors ?? null,
        indices: source.indices ?? null,
        uvs: source.uvs ?? null
      },
      chunkSize
    );
    pieces.push({ geometry: source, matrix, color: resolveSceneColor(node.color ?? DEFAULT_COLOR) });
  }
  yield* visit(roots, identityPreciseMat4(), 0);
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
  return assembly.assemble(BODY_ASSEMBLY_OPTIONS);
}

function meshInput(piece: Piece) {
  return {
    positions: piece.geometry.positions,
    normals: piece.geometry.normals ?? null,
    colors: piece.geometry.colors ?? null,
    indices: piece.geometry.indices ?? null,
    uvs: piece.geometry.uvs ?? null
  };
}

function preparePiece(piece: Piece): MeshAssemblyPart {
  return piecePart(piece, processMeshGeometry(meshInput(piece))!);
}

function piecePart(piece: Piece, processed: NonNullable<ReturnType<typeof processMeshGeometry>>): MeshAssemblyPart {
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
