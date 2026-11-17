// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { sameDashboardLayout, sameDashboardMetrics } from './comparison.utils.js';
import type { DashboardLayout } from '../dashboard.types.js';

const layout = (): DashboardLayout => ({
  version: 1,
  grid: { flow: 'vertical', tracks: 4 },
  items: [
    { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
    { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
    { id: 'c', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }
  ]
});

describe('layout equality', () => {
  it('distinguishes an absent value from an empty layout', () => {
    const empty: DashboardLayout = { ...layout(), items: [] };
    expect(sameDashboardLayout(undefined, undefined)).toBe(true);
    expect(sameDashboardLayout(undefined, empty)).toBe(false);
    expect(sameDashboardLayout(empty, undefined)).toBe(false);
  });

  it('compares copied layouts independently of object property order and application data', () => {
    const value = layout();
    const copy = {
      items: value.items.map(item => ({
        rowSpan: item.rowSpan,
        columnSpan: item.columnSpan,
        row: item.row,
        column: item.column,
        id: item.id,
        extra: 'application data'
      })),
      grid: { tracks: value.grid.tracks, flow: value.grid.flow },
      version: value.version
    };
    expect(sameDashboardLayout(value, value)).toBe(true);
    expect(sameDashboardLayout(value, copy)).toBe(true);
    expect(sameDashboardLayout(value, structuredClone(value))).toBe(true);
  });

  it('distinguishes grid configuration, panel identity, membership, and item order', () => {
    const value = layout();
    const changes: DashboardLayout[] = [
      { ...value, grid: { ...value.grid, flow: 'horizontal' } },
      { ...value, grid: { ...value.grid, tracks: 5 } },
      { ...value, items: value.items.map(item => ({ ...item, id: item.id + '-renamed' })) },
      { ...value, items: value.items.slice(1) },
      { ...value, items: [...value.items].reverse() }
    ];
    for (const changed of changes) expect(sameDashboardLayout(value, changed)).toBe(false);
  });

  it.each(['column', 'row', 'columnSpan', 'rowSpan'] as const)('distinguishes changes to %s', field => {
    const value = layout();
    const changed: DashboardLayout = {
      ...value,
      items: value.items.map((item, index) => (index === 1 ? { ...item, [field]: item[field] + 1 } : item))
    };
    expect(sameDashboardLayout(value, changed)).toBe(false);
  });
});

describe('dashboard metric equality', () => {
  const metrics = { columnSize: 120, rowSize: 90, gap: 12, width: 600, height: 400 };
  it('distinguishes absent measurements and accepts equal copies', () => {
    expect(sameDashboardMetrics(undefined, undefined)).toBe(true);
    expect(sameDashboardMetrics(metrics, undefined)).toBe(false);
    expect(sameDashboardMetrics(undefined, metrics)).toBe(false);
    expect(sameDashboardMetrics(metrics, { ...metrics })).toBe(true);
  });
  it.each(['columnSize', 'rowSize', 'gap', 'width', 'height'] as const)('distinguishes changes to %s', field => {
    expect(sameDashboardMetrics(metrics, { ...metrics, [field]: metrics[field] + 1 })).toBe(false);
  });
});
