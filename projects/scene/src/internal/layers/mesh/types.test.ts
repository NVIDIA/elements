// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expectTypeOf, it } from 'vitest';
import type { SceneMeshGeometry } from './types.js';

describe('mesh geometry types', () => {
  it('requires float32 positions while allowing omitted or cleared attributes', () => {
    expectTypeOf<SceneMeshGeometry['positions']>().toEqualTypeOf<Float32Array>();
    expectTypeOf<{ positions: Float32Array }>().toExtend<SceneMeshGeometry>();
    expectTypeOf<Omit<SceneMeshGeometry, 'positions'>>().not.toExtend<SceneMeshGeometry>();
    expectTypeOf<{ positions: number[] }>().not.toExtend<SceneMeshGeometry>();
    expectTypeOf<SceneMeshGeometry['indices']>().toEqualTypeOf<Uint32Array | null | undefined>();
    expectTypeOf<SceneMeshGeometry['normals']>().toEqualTypeOf<Float32Array | null | undefined>();
    expectTypeOf<SceneMeshGeometry['colors']>().toEqualTypeOf<Float32Array | null | undefined>();
    expectTypeOf<SceneMeshGeometry['uvs']>().toEqualTypeOf<Float32Array | null | undefined>();
  });
});
