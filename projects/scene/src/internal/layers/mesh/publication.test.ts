// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { PREPARATION_CHUNK_SIZE, runPreparationSync } from '../../rendering/preparation.js';
import { createMeshGeometryCopy, finishMeshGeometryCopy, prepareMeshGeometryCopyRange } from './publication.js';

describe('mesh geometry publication', () => {
  it('preserves edits across a page boundary when the remaining pages copy', () => {
    const boundary = PREPARATION_CHUNK_SIZE;
    const lastIndex = 2 * boundary;
    const copy = createMeshGeometryCopy(new Uint32Array(lastIndex + 1).fill(3));

    prepareMeshGeometryCopyRange(copy, boundary - 1, 2);
    expect(copy.target.slice(boundary - 1, boundary + 1)).toEqual(new Uint32Array([3, 3]));
    expect(copy.target[lastIndex]).toBe(0);
    copy.target.set([7, 8], boundary - 1);

    const result = runPreparationSync(finishMeshGeometryCopy(copy));

    expect(result.slice(boundary - 1, boundary + 1)).toEqual(new Uint32Array([7, 8]));
    expect(result[lastIndex]).toBe(3);
  });
});
