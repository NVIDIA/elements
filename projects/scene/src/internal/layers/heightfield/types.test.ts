// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expectTypeOf, it } from 'vitest';
import type { HeightfieldGrid } from './types.js';

describe('heightfield grid types', () => {
  it('requires dimensions, spacing, and float32 elevation samples', () => {
    expectTypeOf<HeightfieldGrid['heights']>().toEqualTypeOf<Float32Array>();
    expectTypeOf<{
      spacing: number;
      columns: number;
      rows: number;
      heights: Float32Array;
    }>().toExtend<HeightfieldGrid>();
    expectTypeOf<Omit<HeightfieldGrid, 'heights'>>().not.toExtend<HeightfieldGrid>();
    expectTypeOf<Omit<HeightfieldGrid, 'columns'>>().not.toExtend<HeightfieldGrid>();
    expectTypeOf<Omit<HeightfieldGrid, 'rows'>>().not.toExtend<HeightfieldGrid>();
    expectTypeOf<Omit<HeightfieldGrid, 'spacing'>>().not.toExtend<HeightfieldGrid>();
  });

  it('allows an omitted origin and optional packed RGBA8 colors', () => {
    expectTypeOf<HeightfieldGrid['origin']>().toEqualTypeOf<readonly [number, number] | undefined>();
    expectTypeOf<HeightfieldGrid['colors']>().toEqualTypeOf<Uint8Array | undefined>();
  });
});
