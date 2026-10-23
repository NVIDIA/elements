// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PREPARATION_CHUNK_SIZE } from '../../rendering/preparation.js';

type GeometryArray = Float32Array | Uint32Array;

/** A detached generation whose untouched pages can copy between browser tasks. */
export interface MeshGeometryCopy {
  readonly source: GeometryArray;
  readonly target: GeometryArray;
  readonly pages: Uint8Array;
}

export function createMeshGeometryCopy(source: GeometryArray): MeshGeometryCopy {
  return {
    source,
    target: source instanceof Uint32Array ? new Uint32Array(source.length) : new Float32Array(source.length),
    pages: new Uint8Array(Math.ceil(source.length / PREPARATION_CHUNK_SIZE))
  };
}

/** Makes only pages touched by a publication available before its synchronous range update. */
export function prepareMeshGeometryCopyRange(copy: MeshGeometryCopy, start: number, count: number): void {
  if (count === 0) return;
  const endPage = Math.ceil((start + count) / PREPARATION_CHUNK_SIZE);
  for (let page = Math.floor(start / PREPARATION_CHUNK_SIZE); page < endPage; page += 1) copyPage(copy, page);
}

/** Copies bounded pages without overwriting pages already updated by a later publication. */
export function* finishMeshGeometryCopy(copy: MeshGeometryCopy): Generator<void, GeometryArray, void> {
  for (let page = 0; page < copy.pages.length; page += 1) {
    copyPage(copy, page);
    yield;
  }
  return copy.target;
}

function copyPage(copy: MeshGeometryCopy, page: number): void {
  if (copy.pages[page] !== 0) return;
  const start = page * PREPARATION_CHUNK_SIZE;
  copy.target.set(copy.source.subarray(start, start + PREPARATION_CHUNK_SIZE), start);
  copy.pages[page] = 1;
}
