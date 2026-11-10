// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { planDashboardAction } from './action.utils.js';
import { transposeDashboardGridGeometry } from './geometry.utils.js';

import type { DashboardItem, DashboardLayout } from '../dashboard.types.js';

function createInput(): Parameters<typeof planDashboardAction>[0] {
  return {
    layout: {
      version: 1,
      grid: { flow: 'vertical', tracks: 6 },
      items: [{ id: 'source', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }]
    },
    panels: [{ id: 'source', minColumnSpan: 1, maxColumnSpan: 6, minRowSpan: 1, maxRowSpan: 6 }],
    id: 'source',
    request: { kind: 'command', command: '--move-left' },
    movable: true,
    resizable: true,
    autoSettle: false,
    readingDirection: 'ltr',
    resizeEdge: 'bottom-right'
  };
}

describe('dashboard arrangement actions', () => {
  it.each([
    { readingDirection: 'ltr', column: 1 },
    { readingDirection: 'rtl', column: 3 }
  ] as const)('maps physical left to logical columns in $readingDirection', ({ readingDirection, column }) => {
    const input = createInput();

    const result = planDashboardAction({ ...input, readingDirection });

    expect(result?.items).toEqual([{ id: 'source', column, row: 2, columnSpan: 2, rowSpan: 2 }]);
    expect(input.layout.items).toEqual([{ id: 'source', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }]);
  });

  it('applies move and resize permissions independently before planning', () => {
    const input = createInput();
    const resize = { kind: 'command', command: '--increase-width' } as const;

    expect(planDashboardAction({ ...input, movable: false })).toBeUndefined();
    expect(planDashboardAction({ ...input, movable: false, request: resize })?.items).toEqual([
      { id: 'source', column: 2, row: 2, columnSpan: 3, rowSpan: 2 }
    ]);
    expect(planDashboardAction({ ...input, resizable: false, request: resize })).toBeUndefined();
  });

  for (const flow of ['vertical', 'horizontal'] as const) {
    for (const readingDirection of ['ltr', 'rtl'] as const) {
      it.each([
        {
          name: 'exchanges offset equal panels without changing their perpendicular positions',
          tracks: 2,
          autoSettle: false,
          command: flow === 'vertical' ? '--move-left' : '--move-up',
          items: [
            { id: 'peer', column: 0, row: 0, columnSpan: 1, rowSpan: 2 },
            { id: 'source', column: 1, row: 1, columnSpan: 1, rowSpan: 2 }
          ],
          expected: [
            { id: 'peer', column: 1, row: 0, columnSpan: 1, rowSpan: 2 },
            { id: 'source', column: 0, row: 1, columnSpan: 1, rowSpan: 2 }
          ]
        },
        {
          name: 'selects the nearest predecessor without displacing the smaller panel before it',
          tracks: 4,
          autoSettle: true,
          command: flow === 'vertical' ? '--move-up' : '--move-left',
          items: [
            { id: 'small', column: 2, row: 0, columnSpan: 2, rowSpan: 1 },
            { id: 'peer', column: 0, row: 1, columnSpan: 3, rowSpan: 2 },
            { id: 'source', column: 1, row: 3, columnSpan: 3, rowSpan: 2 }
          ],
          expected: [
            { id: 'small', column: 2, row: 0, columnSpan: 2, rowSpan: 1 },
            { id: 'peer', column: 0, row: 3, columnSpan: 3, rowSpan: 2 },
            { id: 'source', column: 1, row: 1, columnSpan: 3, rowSpan: 2 }
          ]
        }
      ])(`$name in ${flow} ${readingDirection}`, ({ tracks, autoSettle, command, items, expected }) => {
        const input = createInput();
        const orientItem = (item: DashboardItem): DashboardItem => {
          if (flow === 'horizontal') {
            return { id: item.id, ...transposeDashboardGridGeometry(item) };
          }

          return { ...item };
        };
        const physicalCommand = command === '--move-left' && readingDirection === 'rtl' ? '--move-right' : command;
        const layout: DashboardLayout = { version: 1, grid: { flow, tracks }, items: items.map(orientItem) };
        const before = structuredClone(layout);
        const result = planDashboardAction({
          ...input,
          layout,
          panels: items.map(item => ({
            id: item.id,
            minColumnSpan: 1,
            minRowSpan: 1,
            maxColumnSpan: tracks,
            maxRowSpan: 6
          })),
          request: { kind: 'command', command: physicalCommand },
          autoSettle,
          readingDirection
        });

        expect(result?.items).toEqual(expected.map(orientItem));
        expect(layout).toEqual(before);
      });
    }
  }
});
