// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expectTypeOf, it } from 'vitest';
import type { RGBA, SceneColor } from './types.js';

describe('color types', () => {
  it('requires four mutable numeric channels for RGBA', () => {
    expectTypeOf<RGBA>().toEqualTypeOf<[number, number, number, number]>();
    expectTypeOf<[number, number]>().not.toExtend<RGBA>();
    expectTypeOf<readonly [number, number, number, number]>().not.toExtend<RGBA>();
  });

  it('accepts CSS colors and readonly RGBA tuples as scene colors', () => {
    expectTypeOf<SceneColor>().toEqualTypeOf<string | Readonly<RGBA>>();
    expectTypeOf<RGBA>().toExtend<SceneColor>();
    expectTypeOf<number[]>().not.toExtend<SceneColor>();
  });
});
