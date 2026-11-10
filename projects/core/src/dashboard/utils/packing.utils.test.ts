// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { findNormalizedPlacementPlan, settleDashboardItems } from './packing.utils.js';

import type { DashboardItem } from '../dashboard.types.js';

describe('dashboard normalized placement planner', () => {
  it('reverses an equal-panel exchange without changing the original preview input', () => {
    const items: DashboardItem[] = [
      { id: 'source', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'peer', column: 2, row: 0, columnSpan: 2, rowSpan: 2 }
    ];
    const before = structuredClone(items);

    const exchanged = findNormalizedPlacementPlan(
      items,
      { id: 'source', intent: { kind: 'coordinate', geometry: { column: 2, row: 0, columnSpan: 2, rowSpan: 2 } } },
      { tracks: 4 }
    );

    expect(exchanged).toEqual([
      { id: 'source', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'peer', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }
    ]);
    expect(items).toEqual(before);
    expect(
      findNormalizedPlacementPlan(
        exchanged!,
        { id: 'source', intent: { kind: 'coordinate', geometry: { column: 0, row: 0, columnSpan: 2, rowSpan: 2 } } },
        { tracks: 4 }
      )
    ).toEqual(before);
  });

  it('settles each overlapping predecessor without moving a panel through an overhang', () => {
    const items: DashboardItem[] = [
      { id: 'left', column: 0, row: 4, columnSpan: 2, rowSpan: 2 },
      { id: 'bridge', column: 0, row: 8, columnSpan: 4, rowSpan: 1 },
      { id: 'right', column: 2, row: 12, columnSpan: 2, rowSpan: 2 }
    ];
    const before = structuredClone(items);

    const result = settleDashboardItems(items);

    expect(result).toEqual([
      { id: 'left', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'bridge', column: 0, row: 2, columnSpan: 4, rowSpan: 1 },
      { id: 'right', column: 2, row: 3, columnSpan: 2, rowSpan: 2 }
    ]);
    expect(items).toEqual(before);
  });
});
