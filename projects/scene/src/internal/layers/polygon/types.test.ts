// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expectTypeOf, it } from 'vitest';
import type { PolygonGeometry, PolygonPoint, PolygonRing } from './types.js';

describe('polygon types', () => {
  it('accepts readonly two-dimensional rings with optional holes', () => {
    expectTypeOf<PolygonPoint>().toEqualTypeOf<readonly [number, number]>();
    expectTypeOf<PolygonRing>().toEqualTypeOf<readonly PolygonPoint[]>();
    expectTypeOf<PolygonGeometry['outer']>().toEqualTypeOf<PolygonRing>();
    expectTypeOf<PolygonGeometry['holes']>().toEqualTypeOf<readonly PolygonRing[] | undefined>();
    expectTypeOf<{ outer: PolygonRing }>().toExtend<PolygonGeometry>();
    expectTypeOf<{ holes: readonly PolygonRing[] }>().not.toExtend<PolygonGeometry>();
    expectTypeOf<readonly [number, number, number]>().not.toExtend<PolygonPoint>();
  });
});
