// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { doDashboardGridGeometriesOverlap, transposeDashboardGridGeometry } from './geometry.utils.js';
import { findFirstDashboardFit, parseDashboardValue, placeDashboard, reconcileDashboard } from './layout.utils.js';

import type { DashboardIntent } from './intent.types.js';

import type {
  DashboardGridPlacement,
  DashboardItem,
  DashboardLayout,
  DashboardSpanConstraints
} from '../dashboard.types.js';

const limits = (id: string): DashboardSpanConstraints => ({
  id,
  minColumnSpan: 1,
  minRowSpan: 1,
  maxColumnSpan: 1000000,
  maxRowSpan: 1000000
});

const layout = (): DashboardLayout => ({
  version: 1,
  grid: { flow: 'vertical', tracks: 4 },
  items: [
    { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
    { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
    { id: 'c', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }
  ]
});

describe('dashboard layout utilities', () => {
  it.each(['vertical', 'horizontal'] as const)('preserves gaps unless settling is enabled in %s flow', flow => {
    const initial: DashboardLayout = {
      version: 1,
      grid: { flow, tracks: 4 },
      items: [
        { id: 'a', column: flow === 'vertical' ? 1 : 6, row: flow === 'vertical' ? 6 : 1, columnSpan: 2, rowSpan: 2 },
        { id: 'removed', column: 0, row: 8, columnSpan: 1, rowSpan: 1 }
      ]
    };

    expect(reconcileDashboard(initial, [limits('a')])).toEqual({ ...initial, items: [initial.items[0]] });

    const settled = reconcileDashboard(initial, [limits('a')], { autoSettle: true })!;

    expect(settled.items[0]).toEqual({
      id: 'a',
      column: flow === 'vertical' ? 1 : 0,
      row: flow === 'vertical' ? 0 : 1,
      columnSpan: 2,
      rowSpan: 2
    });
    expect(settled.items).toHaveLength(1);
    expect(reconcileDashboard(settled, [limits('a')])).toEqual(settled);

    const geometry = {
      column: flow === 'vertical' ? 1 : 4,
      row: flow === 'vertical' ? 4 : 1,
      columnSpan: 2,
      rowSpan: 2
    };

    expect(
      placeDashboard(initial, [limits('a')], { id: 'a', intent: { kind: 'coordinate', geometry }, autoSettle: false })
        ?.items[0]
    ).toEqual({ id: 'a', ...geometry });
    expect(
      placeDashboard(initial, [limits('a')], { id: 'a', intent: { kind: 'coordinate', geometry }, autoSettle: true })
        ?.items[0]
    ).toEqual(settled.items[0]);
  });

  it('parses canonical fields without preserving unknown data', () => {
    const input = { ...layout(), extra: 'application data' };

    expect(parseDashboardValue(JSON.stringify(input))).toEqual(layout());
    expect(parseDashboardValue('')).toBeUndefined();
  });

  it.each([
    { name: 'array-coerced', flow: ['horizontal'] },
    { name: 'object', flow: {} },
    { name: 'null', flow: null },
    { name: 'unrecognized', flow: 'sideways' }
  ])('rejects $name flow values before checking bounds', ({ flow }) => {
    expect(() =>
      parseDashboardValue(
        JSON.stringify({
          version: 1,
          grid: { flow, tracks: 1 },
          items: [{ id: 'a', column: 10, row: 0, columnSpan: 1, rowSpan: 1 }]
        })
      )
    ).toThrow(TypeError);
  });

  it.each([
    {
      name: 'duplicate IDs',
      items: [
        { id: 'a', column: 0, row: 0, columnSpan: 1, rowSpan: 1 },
        { id: 'a', column: 1, row: 0, columnSpan: 1, rowSpan: 1 }
      ]
    },
    { name: 'zero column spans', items: [{ id: 'a', column: 0, row: 0, columnSpan: 0, rowSpan: 1 }] },
    { name: 'row extent overflow', items: [{ id: 'a', column: 0, row: 999999, columnSpan: 1, rowSpan: 2 }] }
  ])('rejects $name', ({ items }) => {
    expect(() => parseDashboardValue(JSON.stringify({ ...layout(), items }))).toThrow(TypeError);
  });

  it('circulates the contacted peer without moving an unrelated panel or mutating the snapshot', () => {
    const before = layout();
    const unchanged = JSON.stringify(before);
    const next = placeDashboard(before, ['a', 'b', 'c'].map(limits), {
      id: 'a',
      intent: { kind: 'coordinate', geometry: { column: 1, row: 0, columnSpan: 2, rowSpan: 2 } },
      autoSettle: true
    });

    expect(next?.items).toEqual([
      { id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'b', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'c', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }
    ]);
    expect(JSON.stringify(before)).toBe(unchanged);
  });

  it('transposes the same collision policy for horizontal growth', () => {
    const transpose = (value: DashboardLayout): DashboardLayout => ({
      ...value,
      grid: { ...value.grid, flow: 'horizontal' },
      items: value.items.map(({ id, column, row, columnSpan, rowSpan }) => ({
        id,
        column: row,
        row: column,
        columnSpan: rowSpan,
        rowSpan: columnSpan
      }))
    });

    const expected = placeDashboard(layout(), ['a', 'b', 'c'].map(limits), {
      id: 'a',
      intent: { kind: 'coordinate', geometry: { column: 2, row: 0, columnSpan: 2, rowSpan: 2 } },
      autoSettle: true
    });
    const next = placeDashboard(transpose(layout()), ['a', 'b', 'c'].map(limits), {
      id: 'a',
      intent: { kind: 'coordinate', geometry: { column: 0, row: 2, columnSpan: 2, rowSpan: 2 } },
      autoSettle: true
    });

    expect(next).toEqual(expected && transpose(expected));
  });

  it('rejects bounded-axis and span violations atomically', () => {
    expect(
      placeDashboard(layout(), [limits('a')], {
        id: 'a',
        intent: { kind: 'coordinate', geometry: { column: 3, row: 0, columnSpan: 2, rowSpan: 2 } },
        autoSettle: true
      })
    ).toBeUndefined();
    expect(
      placeDashboard(layout(), [{ ...limits('a'), minColumnSpan: 3 }], {
        id: 'a',
        intent: { kind: 'coordinate', geometry: { column: 0, row: 0, columnSpan: 2, rowSpan: 2 } },
        autoSettle: true
      })
    ).toBeUndefined();
  });

  it('preserves hidden owned placements without treating them as obstacles', () => {
    const result = placeDashboard(layout(), [limits('a')], {
      id: 'a',
      intent: { kind: 'coordinate', geometry: { column: 2, row: 0, columnSpan: 2, rowSpan: 2 } },
      autoSettle: true
    });

    expect(result?.items[1]).toEqual(layout().items[1]);
    expect(result?.items[0]?.column).toBe(2);
  });

  it('gives visible peers priority when an earlier hidden item returns', () => {
    const saved: DashboardLayout = {
      ...layout(),
      items: [
        { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }
      ]
    };
    const result = reconcileDashboard(saved, [limits('a'), limits('b')], {
      priority: new Set(['b']),
      autoSettle: true
    });

    expect(result?.items[1]).toEqual(saved.items[1]);
    expect(result?.items[0]).toEqual({ id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 });
    expect(reconcileDashboard(saved, [limits('a'), limits('b')], { autoSettle: true })?.items[0]).toEqual(
      saved.items[0]
    );
  });

  it('uses free saved positions and appends new IDs deterministically', () => {
    const result = reconcileDashboard(layout(), ['a', 'b', 'c', 'd'].map(limits), { autoSettle: true });

    expect(result?.items.at(-1)).toEqual({ id: 'd', column: 0, row: 2, columnSpan: 1, rowSpan: 1 });
  });

  it('relocates a saved preference when increased spans exceed the supported extent', () => {
    const saved: DashboardLayout = {
      version: 1,
      grid: { flow: 'vertical', tracks: 2 },
      items: [{ id: 'a', column: 0, row: 999999, columnSpan: 1, rowSpan: 1 }]
    };

    expect(reconcileDashboard(saved, [{ ...limits('a'), minRowSpan: 2 }], { autoSettle: true })?.items[0]).toEqual({
      id: 'a',
      column: 0,
      row: 0,
      columnSpan: 1,
      rowSpan: 2
    });

    const horizontal: DashboardLayout = {
      ...saved,
      grid: { flow: 'horizontal', tracks: 2 },
      items: [{ id: 'a', column: 999999, row: 0, columnSpan: 1, rowSpan: 1 }]
    };

    expect(
      reconcileDashboard(horizontal, [{ ...limits('a'), minColumnSpan: 2 }], { autoSettle: true })?.items[0]
    ).toEqual({
      id: 'a',
      column: 0,
      row: 0,
      columnSpan: 2,
      rowSpan: 1
    });
  });

  it('finds sparse free space without scanning empty coordinate distances', () => {
    const item = { id: 'b', column: 0, row: 0, columnSpan: 4, rowSpan: 1 };

    expect(findFirstDashboardFit(item, [{ ...item, id: 'a', rowSpan: 999999 }], layout().grid)?.row).toBe(999999);
  });

  it('leaves active reconciled rectangles nonoverlapping', () => {
    const result = reconcileDashboard(
      {
        ...layout(),
        items: Array.from({ length: 24 }, (_, index) => ({
          id: `${index}`,
          column: 0,
          row: 0,
          columnSpan: 2,
          rowSpan: 2
        }))
      },
      Array.from({ length: 24 }, (_, index) => limits(`${index}`)),
      { autoSettle: true }
    );

    expect(result?.items).toHaveLength(24);

    result?.items.forEach((item, index) =>
      result.items.slice(index + 1).forEach(other => expect(doDashboardGridGeometriesOverlap(item, other)).toBe(false))
    );
  });

  it('moves a full-width result above and back below narrower panels without accumulating gaps', () => {
    const initial: DashboardLayout = {
      version: 1,
      grid: { flow: 'vertical', tracks: 6 },
      items: [
        { id: 'analysis', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
        { id: 'notes', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
        { id: 'results', column: 0, row: 2, columnSpan: 6, rowSpan: 2 }
      ]
    };
    const panels = initial.items.map(item => limits(item.id));
    const above = placeDashboard(initial, panels, {
      id: 'results',
      intent: { kind: 'coordinate', geometry: { column: 0, row: 0, columnSpan: 6, rowSpan: 2 } },
      autoSettle: true
    })!;

    expect(above.items.map(item => item.row)).toEqual([2, 2, 0]);
    expect(
      placeDashboard(above, panels, {
        id: 'results',
        intent: { kind: 'coordinate', geometry: { column: 0, row: 2, columnSpan: 6, rowSpan: 2 } },
        autoSettle: true
      })
    ).toEqual(initial);
  });

  it('retains peer order across successive mixed-height requests that settle at the same position', () => {
    const initial: DashboardLayout = {
      version: 1,
      grid: { flow: 'vertical', tracks: 6 },
      items: [
        { id: 'a', column: 0, row: 0, columnSpan: 6, rowSpan: 2 },
        { id: 'b', column: 0, row: 2, columnSpan: 6, rowSpan: 3 },
        { id: 'c', column: 0, row: 5, columnSpan: 6, rowSpan: 1 }
      ]
    };
    const panels = initial.items.map(item => limits(item.id));
    const four = placeDashboard(initial, panels, {
      id: 'a',
      intent: { kind: 'coordinate', geometry: { column: 0, row: 4, columnSpan: 6, rowSpan: 2 } },
      autoSettle: true
    });
    const five = placeDashboard(initial, panels, {
      id: 'a',
      intent: { kind: 'coordinate', geometry: { column: 0, row: 5, columnSpan: 6, rowSpan: 2 } },
      autoSettle: true
    });

    expect(four?.items.map(item => item.row)).toEqual([4, 0, 3]);
    expect(five).toEqual(four);
  });

  it('normalizes current members without crossing an overhang', () => {
    const initial: DashboardLayout = {
      version: 1,
      grid: { flow: 'vertical', tracks: 2 },
      items: [
        { id: 'c', column: 0, row: 0, columnSpan: 1, rowSpan: 2 },
        { id: 'b', column: 0, row: 2, columnSpan: 2, rowSpan: 2 },
        { id: 'a', column: 1, row: 999998, columnSpan: 1, rowSpan: 1 },
        { id: 'absent', column: 0, row: 999999, columnSpan: 1, rowSpan: 1 }
      ]
    };
    const panels = ['a', 'b', 'c'].map(limits);
    const next = reconcileDashboard(initial, panels, { autoSettle: true })!;

    expect(next.items.map(item => item.row)).toEqual([0, 2, 4]);
    expect(reconcileDashboard(next, panels, { autoSettle: true })).toEqual(next);
    expect(initial.items[2]?.row).toBe(999998);
  });
});

const hero: DashboardItem[] = [
  { id: 'baseline', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
  { id: 'candidate', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
  { id: 'changes', column: 0, row: 2, columnSpan: 3, rowSpan: 2 },
  { id: 'evidence', column: 3, row: 2, columnSpan: 3, rowSpan: 2 },
  { id: 'notes', column: 0, row: 4, columnSpan: 6, rowSpan: 2 }
];
const stack: DashboardItem[] = [
  { id: 'source', column: 0, row: 0, columnSpan: 4, rowSpan: 3 },
  { id: 'upper', column: 0, row: 3, columnSpan: 3, rowSpan: 2 },
  { id: 'lower', column: 1, row: 5, columnSpan: 2, rowSpan: 1 }
];

function spatialLayout(
  items: DashboardItem[],
  tracks = 6,
  flow: DashboardLayout['grid']['flow'] = 'vertical'
): DashboardLayout {
  return {
    version: 1,
    grid: { flow, tracks },
    items: items.map(item => ({ ...item, ...(flow === 'horizontal' ? transposeDashboardGridGeometry(item) : item) }))
  };
}

function plan(base: DashboardLayout, request: { id: string; intent: DashboardIntent; autoSettle?: boolean }) {
  return placeDashboard(
    base,
    base.items.map(item => limits(item.id)),
    request
  );
}

function positions(base: DashboardLayout) {
  return Object.fromEntries(base.items.map(item => [item.id, [item.column, item.row, item.columnSpan, item.rowSpan]]));
}

describe('dashboard spatial placement', () => {
  for (const flow of ['vertical', 'horizontal'] as const) {
    const orient = (geometry: DashboardGridPlacement) =>
      flow === 'horizontal' ? transposeDashboardGridGeometry(geometry) : geometry;

    for (const autoSettle of [false, true]) {
      it(`exchanges complete offset equal-panel frames and reverses without moving Filler in ${flow} flow with autoSettle=${autoSettle}`, () => {
        const base = spatialLayout(
          [
            { id: 'source', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
            { id: 'peer', column: 1, row: 2, columnSpan: 3, rowSpan: 2 },
            { id: 'filler', column: 0, row: 2, columnSpan: 1, rowSpan: 2 }
          ],
          4,
          flow
        );
        const geometry = orient({ column: 1, row: 2, columnSpan: 3, rowSpan: 2 });
        const exchanged = plan(base, {
          id: 'source',
          intent: {
            kind: 'pointer',
            geometry,
            position: {
              aimGeometry: geometry,
              pointerPosition: flow === 'vertical' ? { column: 1.2, row: 2.2 } : { column: 2.2, row: 1.2 },
              spacingFraction: { column: 0.1, row: 0.1 }
            }
          },
          autoSettle
        })!;

        expect(exchanged).toEqual(
          spatialLayout(
            [
              { id: 'source', column: 1, row: 2, columnSpan: 3, rowSpan: 2 },
              { id: 'peer', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
              { id: 'filler', column: 0, row: 2, columnSpan: 1, rowSpan: 2 }
            ],
            4,
            flow
          )
        );

        const restoredGeometry = orient({ column: 0, row: 0, columnSpan: 3, rowSpan: 2 });
        const restored = plan(exchanged, {
          id: 'source',
          intent: {
            kind: 'pointer',
            geometry: restoredGeometry,
            position: {
              aimGeometry: restoredGeometry,
              pointerPosition: { column: 0.2, row: 0.2 },
              spacingFraction: { column: 0.1, row: 0.1 }
            }
          },
          autoSettle
        });

        expect(restored).toEqual(base);
      });

      it(`distinguishes equal-panel pointer exchanges from coordinate placement across a barrier in ${flow} flow with autoSettle=${autoSettle}`, () => {
        const base = spatialLayout(
          [
            { id: 'baseline', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
            { id: 'candidate', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
            { id: 'changes', column: 0, row: 4, columnSpan: 3, rowSpan: 2 },
            { id: 'evidence', column: 3, row: 4, columnSpan: 3, rowSpan: 2 },
            { id: 'notes', column: 0, row: 2, columnSpan: 6, rowSpan: 2 }
          ],
          6,
          flow
        );
        const geometry = orient({ column: 0, row: 0, columnSpan: 3, rowSpan: 2 });
        const exchanged = plan(base, {
          id: 'changes',
          intent: {
            kind: 'pointer',
            geometry,
            position: {
              aimGeometry: geometry,
              pointerPosition: { column: 0.2, row: 0.2 },
              spacingFraction: { column: 0.1, row: 0.1 }
            }
          },
          autoSettle
        });

        expect(exchanged).toEqual(
          spatialLayout(
            [
              { id: 'baseline', column: 0, row: 4, columnSpan: 3, rowSpan: 2 },
              { id: 'candidate', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
              { id: 'changes', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
              { id: 'evidence', column: 3, row: 4, columnSpan: 3, rowSpan: 2 },
              { id: 'notes', column: 0, row: 2, columnSpan: 6, rowSpan: 2 }
            ],
            6,
            flow
          )
        );

        const coordinate = plan(base, {
          id: 'changes',
          intent: { kind: 'coordinate', geometry },
          autoSettle
        });

        expect(coordinate).toEqual(
          spatialLayout(
            [
              { id: 'baseline', column: 0, row: 2, columnSpan: 3, rowSpan: 2 },
              { id: 'candidate', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
              { id: 'changes', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
              { id: 'evidence', column: 3, row: 6, columnSpan: 3, rowSpan: 2 },
              { id: 'notes', column: 0, row: 4, columnSpan: 6, rowSpan: 2 }
            ],
            6,
            flow
          )
        );
      });

      it(`keeps both lower-half equal-panel body targets local in ${flow} flow with autoSettle=${autoSettle}`, () => {
        const base = spatialLayout(hero, 6, flow);

        for (const column of [0, 3]) {
          const aimGeometry = orient({ column, row: 3.5, columnSpan: 3, rowSpan: 2 });
          const point = flow === 'vertical' ? { column: column + 0.2, row: 3.8 } : { column: 3.8, row: column + 0.2 };
          const result = plan(base, {
            id: 'baseline',
            intent: {
              kind: 'pointer',
              geometry: orient({ column, row: 4, columnSpan: 3, rowSpan: 2 }),
              position: { aimGeometry, pointerPosition: point, spacingFraction: { column: 0.1, row: 0.1 } }
            },
            autoSettle: autoSettle
          })!;

          expect(result.items.find(item => item.id === 'baseline')).toEqual({
            id: 'baseline',
            ...orient({ column, row: 2, columnSpan: 3, rowSpan: 2 })
          });
          expect(result.items.map(item => item.id)).toEqual(base.items.map(item => item.id));
          expect(result.items.map(item => [item.columnSpan, item.rowSpan])).toEqual(
            base.items.map(item => [item.columnSpan, item.rowSpan])
          );
          expect(base).toEqual(spatialLayout(hero, 6, flow));
        }
      });
    }

    it(`fills the vacant top slot without moving Candidate for coordinate and start intents in ${flow} flow`, () => {
      const base = spatialLayout(hero, 6, flow);
      const first = plan(base, {
        id: 'changes',
        intent: { kind: 'start', geometry: orient({ column: 0, row: 0, columnSpan: 3, rowSpan: 2 }) }
      })!;

      for (const kind of ['coordinate', 'start'] as const) {
        const result = plan(first, {
          id: 'evidence',
          intent: { kind, geometry: orient({ column: 3, row: 0, columnSpan: 3, rowSpan: 2 }) }
        })!;

        expect(result.items).toEqual(
          first.items.map(item =>
            item.id === 'evidence' ? { id: item.id, ...orient({ column: 3, row: 0, columnSpan: 3, rowSpan: 2 }) } : item
          )
        );
      }
    });

    it(`applies ordinary settling when the top slot is occupied in ${flow} flow`, () => {
      const first = plan(spatialLayout(hero, 6, flow), {
        id: 'changes',
        intent: { kind: 'start', geometry: orient({ column: 0, row: 0, columnSpan: 3, rowSpan: 2 }) },
        autoSettle: true
      })!;

      expect(first.items.find(item => item.id === 'candidate')).toEqual({
        id: 'candidate',
        ...orient({ column: 3, row: 0, columnSpan: 3, rowSpan: 2 })
      });

      const result = plan(first, {
        id: 'evidence',
        intent: { kind: 'coordinate', geometry: orient({ column: 3, row: 0, columnSpan: 3, rowSpan: 2 }) },
        autoSettle: true
      })!;

      expect(result.items.find(item => item.id === 'candidate')).toEqual({
        id: 'candidate',
        ...orient({ column: 3, row: 2, columnSpan: 3, rowSpan: 2 })
      });
    });
  }

  it('preserves the coordinate versus actual body-owner distinction at the same integer request', () => {
    const base = spatialLayout(
      [
        { id: 'source', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'equal', column: 0, row: 2, columnSpan: 2, rowSpan: 2 },
        { id: 'small', column: 0, row: 4, columnSpan: 1, rowSpan: 1 }
      ],
      2
    );
    const geometry = { column: 0, row: 3, columnSpan: 2, rowSpan: 2 };
    const coordinate = plan(base, { id: 'source', intent: { kind: 'coordinate', geometry } })!;
    const pointer = plan(base, {
      id: 'source',
      intent: {
        kind: 'pointer',
        geometry,
        position: {
          aimGeometry: geometry,
          pointerPosition: { column: 0.1, row: 3.2 },
          spacingFraction: { column: 0.1, row: 0.1 }
        }
      }
    })!;

    expect(positions(coordinate)).toEqual({ source: [0, 3, 2, 2], equal: [0, 0, 2, 2], small: [0, 2, 1, 1] });
    expect(positions(pointer)).toEqual({ source: [0, 2, 2, 2], equal: [0, 0, 2, 2], small: [0, 4, 1, 1] });
  });

  it('restores baseline peers only after the pointer leaves an unequal body owner when settling is off', () => {
    const base = spatialLayout(stack, 4);
    const owned = plan(base, {
      id: 'source',
      intent: {
        kind: 'pointer',
        geometry: { column: 0, row: 6, columnSpan: 4, rowSpan: 3 },
        position: {
          aimGeometry: { column: 0, row: 5.6, columnSpan: 4, rowSpan: 3 },
          pointerPosition: { column: 1.2, row: 5.8 },
          spacingFraction: { column: 0.1, row: 0.1 }
        }
      }
    })!;
    const clear = plan(base, {
      id: 'source',
      intent: {
        kind: 'pointer',
        geometry: { column: 0, row: 6, columnSpan: 4, rowSpan: 3 },
        position: {
          aimGeometry: { column: 0, row: 6, columnSpan: 4, rowSpan: 3 },
          pointerPosition: { column: 1.2, row: 6.2 },
          spacingFraction: { column: 0.1, row: 0.1 }
        }
      }
    })!;

    expect(owned.items.map(item => item.row)).toEqual([6, 0, 2]);
    expect(clear.items.map(item => item.row)).toEqual([6, 3, 5]);
    expect(base).toEqual(spatialLayout(stack, 4));
  });

  it('keeps the accepted local placement before a wider barrier and restores peers at a literal free destination', () => {
    const base = spatialLayout(
      [
        { id: 'source', column: 0, row: 0, columnSpan: 3, rowSpan: 3 },
        { id: 'upper', column: 0, row: 3, columnSpan: 3, rowSpan: 2 },
        { id: 'wide', column: 0, row: 5, columnSpan: 4, rowSpan: 1 }
      ],
      4
    );

    expect(
      plan(base, {
        id: 'source',
        intent: { kind: 'coordinate', geometry: { column: 0, row: 4, columnSpan: 3, rowSpan: 3 } }
      })?.items.map(item => item.row)
    ).toEqual([2, 0, 5]);
    expect(
      plan(base, {
        id: 'source',
        intent: { kind: 'coordinate', geometry: { column: 0, row: 6, columnSpan: 3, rowSpan: 3 } }
      })?.items.map(item => item.row)
    ).toEqual([6, 3, 5]);
  });

  const pressureCases = [
    {
      edge: 'right',
      source: { column: 0, row: 0, columnSpan: 2, rowSpan: 4 },
      peers: [
        { id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }
      ],
      geometry: { column: 0, row: 0, columnSpan: 4, rowSpan: 4 },
      expected: [
        { id: 'a', column: 4, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 4, row: 2, columnSpan: 2, rowSpan: 2 }
      ]
    },
    {
      edge: 'left',
      source: { column: 4, row: 0, columnSpan: 2, rowSpan: 4 },
      peers: [
        { id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }
      ],
      geometry: { column: 2, row: 0, columnSpan: 4, rowSpan: 4 },
      expected: [
        { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 0, row: 2, columnSpan: 2, rowSpan: 2 }
      ]
    },
    {
      edge: 'top',
      source: { column: 0, row: 4, columnSpan: 4, rowSpan: 2 },
      peers: [
        { id: 'a', column: 0, row: 2, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }
      ],
      geometry: { column: 0, row: 2, columnSpan: 4, rowSpan: 4 },
      expected: [
        { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 }
      ]
    },
    {
      edge: 'bottom',
      source: { column: 0, row: 0, columnSpan: 4, rowSpan: 2 },
      peers: [
        { id: 'a', column: 0, row: 2, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }
      ],
      geometry: { column: 0, row: 0, columnSpan: 4, rowSpan: 4 },
      expected: [
        { id: 'a', column: 0, row: 4, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 2, row: 4, columnSpan: 2, rowSpan: 2 }
      ]
    }
  ];

  for (const flow of ['vertical', 'horizontal'] as const) {
    for (const test of pressureCases) {
      it(`propagates ${test.edge} outward resize pressure without borrowing spans in ${flow} flow`, () => {
        const base = spatialLayout([{ id: 'source', ...test.source }, ...test.peers], 6, flow);
        const geometry = flow === 'horizontal' ? transposeDashboardGridGeometry(test.geometry) : test.geometry;
        const expectedPeers = test.expected.map(item =>
          flow === 'horizontal' ? { id: item.id, ...transposeDashboardGridGeometry(item) } : item
        );
        const result = plan(base, { id: 'source', intent: { kind: 'resize', geometry } })!;

        expect(result.items[0]).toEqual({ id: 'source', ...geometry });
        expect(result.items.slice(1)).toEqual(expectedPeers);
      });
    }
  }

  it('uses positive-growth fallback only when primary negative pressure cannot fit', () => {
    const base = spatialLayout([
      { id: 'source', column: 0, row: 3, columnSpan: 2, rowSpan: 2 },
      { id: 'peer', column: 0, row: 0, columnSpan: 2, rowSpan: 3 }
    ]);

    expect(
      positions(
        plan(base, {
          id: 'source',
          intent: { kind: 'resize', geometry: { column: 0, row: 2, columnSpan: 2, rowSpan: 3 } }
        })!
      )
    ).toEqual({
      source: [0, 2, 2, 3],
      peer: [0, 5, 2, 3]
    });
  });

  it('uses growth-axis pressure for equal corner expansion and leaves peers unchanged on contraction', () => {
    const base = spatialLayout([
      { id: 'source', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'peer', column: 2, row: 0, columnSpan: 2, rowSpan: 2 }
    ]);
    const expanded = plan(base, {
      id: 'source',
      intent: { kind: 'resize', geometry: { column: 0, row: 0, columnSpan: 3, rowSpan: 3 } }
    })!;

    expect(expanded.items[1]).toEqual({ id: 'peer', column: 2, row: 3, columnSpan: 2, rowSpan: 2 });
    expect(
      plan(expanded, {
        id: 'source',
        intent: { kind: 'resize', geometry: { column: 0, row: 0, columnSpan: 2, rowSpan: 2 } }
      })?.items[1]
    ).toEqual(expanded.items[1]);
  });

  it('does not settle an unchanged resize intent on a supplied gapped baseline', () => {
    const base = spatialLayout([
      { id: 'source', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'peer', column: 0, row: 10, columnSpan: 2, rowSpan: 2 }
    ]);

    expect(
      plan(base, {
        id: 'source',
        intent: { kind: 'resize', geometry: { column: 0, row: 0, columnSpan: 2, rowSpan: 2 } },
        autoSettle: true
      })
    ).toEqual(base);
  });
});

describe('full-track placement symmetry', () => {
  for (const autoSettle of [false, true]) {
    for (const flow of ['vertical', 'horizontal'] as const) {
      it(`returns a full-track panel through vacated space with autoSettle=${autoSettle} in ${flow}`, () => {
        const initial = spatialLayout(
          [
            { id: 'notes', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
            { id: 'cases', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
            { id: 'baseline', column: 0, row: 2, columnSpan: 6, rowSpan: 2 }
          ],
          6,
          flow
        );
        const source = initial.items.find(item => item.id === 'baseline')!;
        const upper = plan(initial, {
          id: 'baseline',
          intent: { kind: 'coordinate', geometry: { ...source, column: 0, row: 0 } },
          autoSettle
        })!;
        const restored = plan(upper, { id: 'baseline', intent: { kind: 'coordinate', geometry: source }, autoSettle });

        expect(restored).toEqual(initial);
      });
    }
  }
});
