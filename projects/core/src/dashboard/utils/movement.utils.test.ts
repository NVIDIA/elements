// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { transposeDashboardGridGeometry } from './geometry.utils.js';
import { resolveDashboardTarget } from './movement.utils.js';

import type { DashboardGridPlacement, DashboardLayout } from '../dashboard.types.js';

const initial: DashboardLayout = {
  version: 1,
  grid: { flow: 'vertical', tracks: 6 },
  items: [
    { id: 'source', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
    { id: 'peer', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
    { id: 'result', column: 0, row: 2, columnSpan: 6, rowSpan: 2 }
  ]
};

describe('dashboard movement target geometry', () => {
  for (const flow of ['vertical', 'horizontal'] as const) {
    const orient = (geometry: DashboardGridPlacement) =>
      flow === 'horizontal' ? transposeDashboardGridGeometry(geometry) : geometry;

    const base: DashboardLayout = {
      ...initial,
      grid: { ...initial.grid, flow },
      items: initial.items.map(item => ({ id: item.id, ...orient(item) }))
    };

    it(`rounds raw positions without deciding collision placement in ${flow} flow`, () => {
      const before = structuredClone(base);

      expect(
        [0.49, 0.5, 0.99, 1, 1.49, 1.5, 1.51].map(column => {
          const result = resolveDashboardTarget(base, {
            id: 'source',
            geometry: orient({ column, row: 0, columnSpan: 3, rowSpan: 2 })
          });
          return flow === 'vertical' ? result?.column : result?.row;
        })
      ).toEqual([0, 1, 1, 1, 1, 2, 2]);
      expect(base).toEqual(before);
    });

    it(`clamps bounded-axis drift and keeps the original panel spans in ${flow} flow`, () => {
      for (const [column, expected] of [
        [-10, 0],
        [-0.6, 0],
        [0.6, 1],
        [3.6, 3],
        [1000000, 3]
      ] as const) {
        expect(
          resolveDashboardTarget(base, {
            id: 'source',
            geometry: orient({ column, row: 2, columnSpan: 1, rowSpan: 1 })
          })
        ).toEqual(orient({ column: expected, row: 2, columnSpan: 3, rowSpan: 2 }));
        expect(
          resolveDashboardTarget(base, {
            id: 'result',
            geometry: orient({ column, row: 3, columnSpan: 1, rowSpan: 1 })
          })
        ).toEqual(orient({ column: 0, row: 3, columnSpan: 6, rowSpan: 2 }));
      }
    });

    it(`clamps the growth origin and rounds sparse coordinates in ${flow} flow`, () => {
      expect(
        resolveDashboardTarget(base, {
          id: 'source',
          geometry: orient({ column: 0, row: -0.6, columnSpan: 3, rowSpan: 2 })
        })
      ).toEqual(orient({ column: 0, row: 0, columnSpan: 3, rowSpan: 2 }));
      expect(
        resolveDashboardTarget(base, {
          id: 'source',
          geometry: orient({ column: 0, row: 999990.6, columnSpan: 3, rowSpan: 2 })
        })
      ).toEqual(orient({ column: 0, row: 999991, columnSpan: 3, rowSpan: 2 }));
    });
  }

  it('rejects missing membership without changing the snapshot or inventing an ID', () => {
    const before = structuredClone(initial);

    expect(
      resolveDashboardTarget(initial, { id: 'absent', geometry: { column: 0, row: 0, columnSpan: 1, rowSpan: 1 } })
    ).toBeUndefined();
    expect(initial).toEqual(before);
  });
});
