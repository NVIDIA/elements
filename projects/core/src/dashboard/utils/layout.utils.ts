// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { doDashboardGridGeometriesOverlap, transposeDashboardGridGeometry } from './geometry.utils.js';
import { findNormalizedPlacementPlan, orientDashboardItem, settleDashboardItems } from './packing.utils.js';

import type { DashboardGridPoint, DashboardIntent } from './intent.types.js';

import type {
  DashboardGridPlacement,
  DashboardItem,
  DashboardLayout,
  DashboardSpanConstraints
} from '../dashboard.types.js';

/** Largest supported coordinate or extent, in cells. */
const dashboardExtent = 1_000_000;

export function isDashboardGridPlacement(value: unknown): value is DashboardGridPlacement {
  if (!isNonNullObject(value)) return false;

  return (
    isSupportedGridInteger(value.column, 0) &&
    isSupportedGridInteger(value.row, 0) &&
    isSupportedGridInteger(value.columnSpan, 1) &&
    isSupportedGridInteger(value.rowSpan, 1) &&
    value.column + value.columnSpan <= dashboardExtent &&
    value.row + value.rowSpan <= dashboardExtent
  );
}

export function parseDashboardValue(value: string): DashboardLayout | undefined {
  if (!value) return undefined;

  const data: unknown = JSON.parse(value);

  if (!isNonNullObject(data) || data.version !== 1 || !Array.isArray(data.items)) {
    throwInvalidArrangement();
  }

  const grid = parseGrid(data.grid);
  const ids = new Set<string>();
  const items = data.items.map(item => parseItem(item, grid, ids));

  return { version: 1, grid, items };
}

function parseGrid(value: unknown): DashboardLayout['grid'] {
  if (
    !isNonNullObject(value) ||
    (value.flow !== 'vertical' && value.flow !== 'horizontal') ||
    !isSupportedGridInteger(value.tracks, 1)
  ) {
    throwInvalidArrangement();
  }

  return { flow: value.flow, tracks: value.tracks };
}

function parseItem(value: unknown, grid: DashboardLayout['grid'], ids: Set<string>): DashboardItem {
  if (
    !isNonNullObject(value) ||
    !isDashboardGridPlacement(value) ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    ids.has(value.id)
  ) {
    throwInvalidArrangement();
  }

  if ((grid.flow === 'vertical' ? value.column + value.columnSpan : value.row + value.rowSpan) > grid.tracks) {
    throwInvalidArrangement();
  }

  ids.add(value.id);

  return { id: value.id, column: value.column, row: value.row, columnSpan: value.columnSpan, rowSpan: value.rowSpan };
}

function throwInvalidArrangement(): never {
  throw new TypeError('Invalid dashboard arrangement');
}

export function serializeDashboardValue(layout: DashboardLayout | undefined): string {
  return layout ? JSON.stringify(layout) : '';
}

export function createDefaultDashboardLayout(): DashboardLayout {
  return { version: 1, grid: { flow: 'vertical', tracks: 12 }, items: [] };
}

/** Reconciles current members; hidden members keep placement without occupying cells. */
export function reconcileDashboard(
  layout: DashboardLayout,
  panels: readonly DashboardSpanConstraints[],
  options: { priority?: ReadonlySet<string>; autoSettle?: boolean; hidden?: ReadonlySet<string> } = {}
): DashboardLayout | undefined {
  const available = new Map(panels.map(panel => [panel.id, panel]));
  if (available.size !== panels.length || panels.some(panel => !panel.id)) return undefined;

  const saved = reconcileSaved({
    layout,
    available,
    priority: options.priority,
    hidden: options.hidden
  });
  const result = saved && reconcileNewPanels({ ...saved, available, grid: layout.grid, hidden: options.hidden });
  if (!result) return undefined;

  const { active, items } = result;
  const oriented = active.map(item => orientDashboardItem(item, layout.grid.flow));
  const packed = options.autoSettle ? settleDashboardItems(oriented) : oriented;
  if (!packed) return undefined;

  const positions = new Map(packed.map(item => [item.id, orientDashboardItem(item, layout.grid.flow)]));

  return {
    version: 1,
    grid: layout.grid,
    items: items.map(item => positions.get(item.id) ?? item)
  };
}

function reconcileNewPanels(input: {
  available: ReadonlyMap<string, DashboardSpanConstraints>;
  grid: DashboardLayout['grid'];
  active: DashboardItem[];
  items: DashboardItem[];
  hidden?: ReadonlySet<string>;
}) {
  const { available, grid, active, items, hidden } = input;

  for (const panel of available.values()) {
    const initial = { id: panel.id, column: 0, row: 0, columnSpan: 1, rowSpan: 1 };
    const next = hidden?.has(panel.id) ? initial : reconcileItem({ item: initial, limits: panel, grid, active });
    if (!next) return undefined;

    if (!hidden?.has(panel.id)) active.push(next);
    items.push(next);
  }

  return { active, items };
}

function reconcileSaved(input: {
  layout: DashboardLayout;
  available: Map<string, DashboardSpanConstraints>;
  priority?: ReadonlySet<string>;
  hidden?: ReadonlySet<string>;
}) {
  const { layout, available, priority, hidden } = input;
  const active: DashboardItem[] = [];
  const resolved = new Map<string, DashboardItem>();
  const savedItems = priority
    ? [...layout.items.filter(item => priority.has(item.id)), ...layout.items.filter(item => !priority.has(item.id))]
    : layout.items;

  for (const saved of savedItems) {
    const constraints = available.get(saved.id);

    if (!constraints) continue;

    available.delete(saved.id);

    const next = hidden?.has(saved.id)
      ? saved
      : reconcileItem({ item: saved, limits: constraints, grid: layout.grid, active });
    if (!next) return undefined;

    if (!hidden?.has(saved.id)) active.push(next);
    resolved.set(next.id, next);
  }

  const items = layout.items.flatMap(item => resolved.get(item.id) ?? []);

  return { active, items };
}

function reconcileItem(input: {
  item: DashboardItem;
  limits: DashboardSpanConstraints;
  grid: DashboardLayout['grid'];
  active: DashboardItem[];
}): DashboardItem | undefined {
  const { item, limits, grid, active } = input;
  if (!areSpanConstraintsValid(limits)) return undefined;

  const columnSpan = Math.max(limits.minColumnSpan, Math.min(limits.maxColumnSpan, item.columnSpan));
  const rowSpan = Math.max(limits.minRowSpan, Math.min(limits.maxRowSpan, item.rowSpan));
  const candidate = { ...item, columnSpan, rowSpan };
  if ((grid.flow === 'vertical' ? columnSpan : rowSpan) > grid.tracks) return undefined;
  if (
    isDashboardGridPlacement(candidate) &&
    (grid.flow === 'vertical' ? candidate.column + columnSpan : candidate.row + rowSpan) <= grid.tracks &&
    active.every(other => !doDashboardGridGeometriesOverlap(other, candidate))
  ) {
    return candidate;
  }

  return findFirstDashboardFit(candidate, active, grid);
}

/** Searches occupied boundaries, so sparse coordinate distances do not increase work. */
export function findFirstDashboardFit(
  item: DashboardItem,
  occupied: readonly DashboardItem[],
  grid: DashboardLayout['grid']
): DashboardItem | undefined {
  const geometry = orient(item, grid.flow);
  if (geometry.columnSpan > grid.tracks) return undefined;

  const placed = occupied.map(other => orient(other, grid.flow));
  const rows = [...new Set([0, ...placed.map(other => other.row + other.rowSpan)])].sort((a, b) => a - b);
  const columns = [...new Set([0, ...placed.map(other => other.column + other.columnSpan)])].sort((a, b) => a - b);

  for (const row of rows) {
    for (const column of columns) {
      const candidate = { ...geometry, column, row };
      if (
        column + geometry.columnSpan <= grid.tracks &&
        isDashboardGridPlacement(candidate) &&
        placed.every(other => !doDashboardGridGeometriesOverlap(candidate, other))
      ) {
        return { id: item.id, ...orient(candidate, grid.flow) };
      }
    }
  }

  return undefined;
}

/** Resolves directional placement collisions and optionally settles supplied panels toward the growth-axis origin. */
export function placeDashboard(
  layout: DashboardLayout,
  panels: readonly DashboardSpanConstraints[],
  request: {
    readonly id: string;
    readonly intent: DashboardIntent;
    readonly autoSettle?: boolean;
  }
): DashboardLayout | undefined {
  const { id, intent } = request;
  const requested = intent.geometry;
  const source = layout.items.find(item => item.id === id);
  const constraint = panels.find(panel => panel.id === id);
  const desired = orient(requested, layout.grid.flow);
  if (!source || !constraint || !isPlacementValid(requested, constraint)) {
    return undefined;
  }
  if (desired.column + desired.columnSpan > layout.grid.tracks) return undefined;

  const ids = new Set(panels.map(panel => panel.id));
  const active = layout.items.filter(item => ids.has(item.id)).map(item => orientDashboardItem(item, layout.grid.flow));
  const oriented = normalizePlacementIntent(intent, source, layout.grid.flow);
  const packed = findNormalizedPlacementPlan(
    active,
    { id, intent: oriented },
    { tracks: layout.grid.tracks, autoSettle: request.autoSettle }
  );
  if (!packed) return undefined;

  const positions = new Map(packed.map(item => [item.id, orientDashboardItem(item, layout.grid.flow)]));

  return {
    ...layout,
    items: layout.items.map(item => positions.get(item.id) ?? item)
  };
}

function normalizePlacementIntent(
  intent: DashboardIntent,
  source: DashboardItem,
  flow: DashboardLayout['grid']['flow']
): DashboardIntent {
  if (intent.kind === 'start') return orientIntent(intent, flow);

  const geometry = orient(intent.geometry, flow);
  if (source.columnSpan !== intent.geometry.columnSpan || source.rowSpan !== intent.geometry.rowSpan) {
    return { kind: 'resize', geometry };
  }

  return intent.kind === 'resize' ? { kind: 'coordinate', geometry } : orientIntent(intent, flow);
}

/** Normalizes placement intents to vertical growth coordinates. */
function orientIntent(
  intent: Exclude<DashboardIntent, { kind: 'resize' }>,
  flow: DashboardLayout['grid']['flow']
): DashboardIntent {
  const geometry = orient(intent.geometry, flow);

  const point = (value: DashboardGridPoint): DashboardGridPoint =>
    flow === 'vertical' ? value : { column: value.row, row: value.column };

  switch (intent.kind) {
    case 'coordinate':
      return { kind: 'coordinate', geometry };
    case 'start':
      return { kind: 'start', geometry };
    case 'pointer':
      return {
        kind: 'pointer',
        geometry,
        position: {
          aimGeometry: orient(intent.position.aimGeometry, flow),
          pointerPosition: point(intent.position.pointerPosition),
          spacingFraction: point(intent.position.spacingFraction)
        }
      };
    case 'advance':
      return { kind: 'advance', geometry, step: point(intent.step) };
    default: {
      const exhaustive: never = intent;
      return exhaustive;
    }
  }
}

function isPlacementValid(geometry: DashboardGridPlacement, limits: DashboardSpanConstraints): boolean {
  return (
    isDashboardGridPlacement(geometry) &&
    areSpanConstraintsValid(limits) &&
    geometry.columnSpan >= limits.minColumnSpan &&
    geometry.rowSpan >= limits.minRowSpan &&
    geometry.columnSpan <= limits.maxColumnSpan &&
    geometry.rowSpan <= limits.maxRowSpan
  );
}

function orient(geometry: DashboardGridPlacement, flow: DashboardLayout['grid']['flow']): DashboardGridPlacement {
  return flow === 'vertical'
    ? { column: geometry.column, row: geometry.row, columnSpan: geometry.columnSpan, rowSpan: geometry.rowSpan }
    : transposeDashboardGridGeometry(geometry);
}

function areSpanConstraintsValid(value: DashboardSpanConstraints): boolean {
  return (
    isSupportedGridInteger(value.minColumnSpan, 1) &&
    isSupportedGridInteger(value.minRowSpan, 1) &&
    isSupportedGridInteger(value.maxColumnSpan, 1) &&
    isSupportedGridInteger(value.maxRowSpan, 1) &&
    value.minColumnSpan <= value.maxColumnSpan &&
    value.minRowSpan <= value.maxRowSpan
  );
}

function isSupportedGridInteger(value: unknown, minimum: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= dashboardExtent;
}

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
