// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expectTypeOf, it } from 'vitest';
import type { Mat4, Matrix4, PreciseMat4, Quaternion, ScenePose, Vec3 } from './types.js';

describe('math types', () => {
  it('requires fixed-length vectors and quaternions and readonly pose components', () => {
    expectTypeOf<Vec3>().toEqualTypeOf<[number, number, number]>();
    expectTypeOf<Quaternion>().toEqualTypeOf<[number, number, number, number]>();
    expectTypeOf<ScenePose>().toEqualTypeOf<{
      readonly orientation: readonly [number, number, number, number];
      readonly position: readonly [number, number, number];
    }>();
  });

  it('preserves the CPU and GPU matrix precision boundaries', () => {
    expectTypeOf<Mat4>().toEqualTypeOf<Float32Array>();
    expectTypeOf<PreciseMat4>().toEqualTypeOf<Float64Array>();
    expectTypeOf<Matrix4>().toEqualTypeOf<Float32Array | Float64Array>();
    expectTypeOf<number[]>().not.toExtend<Matrix4>();
  });
});
