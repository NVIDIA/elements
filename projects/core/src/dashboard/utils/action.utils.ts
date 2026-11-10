// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDashboardResizeBoundaries, preservesDashboardResizeAnchors } from './geometry.utils.js';
import { isDashboardGridPlacement, placeDashboard } from './layout.utils.js';

import type { DashboardReadingDirection, DashboardResizeEdge } from './geometry.utils.js';
import type { DashboardArrangementRequest, DashboardIntent } from './intent.types.js';

import type {
  DashboardGridPlacement,
  DashboardItem,
  DashboardLayout,
  DashboardSpanConstraints
} from '../dashboard.types.js';

const actions: Readonly<Record<string, { kind: 'move' | 'resize'; column: number; row: number }>> = {
  '--move-left': { kind: 'move', column: -1, row: 0 },
  '--move-right': { kind: 'move', column: 1, row: 0 },
  '--move-up': { kind: 'move', column: 0, row: -1 },
  '--move-down': { kind: 'move', column: 0, row: 1 },
  '--increase-width': { kind: 'resize', column: 1, row: 0 },
  '--decrease-width': { kind: 'resize', column: -1, row: 0 },
  '--increase-height': { kind: 'resize', column: 0, row: 1 },
  '--decrease-height': { kind: 'resize', column: 0, row: -1 }
};

const resizeEdges: readonly DashboardResizeEdge[] = ['left', 'right', 'top', 'bottom', 'bottom-right', 'bottom-left'];

interface DashboardActionInput {
  readonly layout: DashboardLayout;
  readonly panels: readonly DashboardSpanConstraints[];
  readonly id: string;
  readonly request: DashboardArrangementRequest;
  readonly movable: boolean;
  readonly resizable: boolean;
  readonly autoSettle: boolean;
  readonly readingDirection: DashboardReadingDirection;
  readonly resizeEdge: DashboardResizeEdge;
}

/** Applies movement and resize permissions before planning a layout proposal. */
export function planDashboardAction(input: DashboardActionInput): DashboardLayout | undefined {
  const { layout, panels, id, movable, resizable, request } = input;
  const source = layout.items.find(item => item.id === id);
  if (!source || !panels.some(panel => panel.id === id)) return undefined;

  const intent = createRequestIntent(input, source);
  if (!intent || !isDashboardGridPlacement(intent.geometry)) return undefined;

  const explicit = intent.kind === 'start' || request.kind === 'anchored-resize';
  if (
    !explicit &&
    !isPlacementAllowed(source, intent.geometry, { movable, resizable, readingDirection: input.readingDirection })
  ) {
    return undefined;
  }

  return placeDashboard(layout, panels, { id, intent, autoSettle: input.autoSettle });
}

function createRequestIntent(input: DashboardActionInput, source: DashboardItem): DashboardIntent | undefined {
  const { request, resizable } = input;

  switch (request.kind) {
    case 'pointer':
      return request;
    case 'start':
      return createStartIntent(input, source, request.geometry);
    case 'anchored-resize':
      return resizable &&
        preservesDashboardResizeAnchors(source, request.geometry, {
          edge: request.edge,
          readingDirection: input.readingDirection
        })
        ? { kind: 'resize', geometry: request.geometry }
        : undefined;
    case 'command':
      return createCommandIntent(input, source, request);
    default: {
      const exhaustive: never = request;
      return exhaustive;
    }
  }
}

function createCommandIntent(
  input: DashboardActionInput,
  source: DashboardItem,
  request: Extract<DashboardArrangementRequest, { kind: 'command' }>
): DashboardIntent | undefined {
  if (request.command === '--move-to-start' || request.command === '--place') {
    return createPlacementIntent(input, source, request);
  }

  const action = getCommandAction(request.command, input.readingDirection);
  if (!action) return undefined;

  const boundaries = getDashboardResizeBoundaries(input.resizeEdge, input.readingDirection);

  return action.kind === 'move'
    ? {
        kind: 'advance',
        geometry: { ...source, column: source.column + action.column, row: source.row + action.row },
        step: { column: action.column, row: action.row }
      }
    : {
        kind: 'resize',
        geometry: {
          ...source,
          column: source.column - (boundaries.column === 'minimum' ? action.column : 0),
          columnSpan: source.columnSpan + action.column,
          rowSpan: source.rowSpan + action.row
        }
      };
}

function getCommandAction(command: string, readingDirection: DashboardActionInput['readingDirection']) {
  const action = actions[command];
  if (action?.kind !== 'move' || readingDirection !== 'rtl') return action;

  return { ...action, column: -action.column };
}

function createPlacementIntent(
  input: DashboardActionInput,
  source: DashboardItem,
  request: Extract<DashboardArrangementRequest, { kind: 'command' }>
): DashboardIntent | undefined {
  const supplied = request.placement;
  if (supplied !== undefined && !isDashboardGridPlacement(supplied)) return undefined;

  return request.command === '--move-to-start'
    ? createStartIntent(input, source, supplied)
    : supplied && { kind: 'coordinate', geometry: supplied };
}

function createStartIntent(
  input: DashboardActionInput,
  source: DashboardItem,
  supplied?: DashboardGridPlacement
): DashboardIntent | undefined {
  if (!input.movable) return undefined;

  const geometry = {
    column: supplied?.column ?? source.column,
    row: supplied?.row ?? source.row,
    columnSpan: source.columnSpan,
    rowSpan: source.rowSpan,
    [input.layout.grid.flow === 'vertical' ? 'row' : 'column']: 0
  };

  return { kind: 'start', geometry };
}

function isPlacementAllowed(
  source: DashboardGridPlacement,
  geometry: DashboardGridPlacement,
  permissions: { movable: boolean; resizable: boolean; readingDirection: DashboardReadingDirection }
): boolean {
  const moving = source.column !== geometry.column || source.row !== geometry.row;
  const resizing = source.columnSpan !== geometry.columnSpan || source.rowSpan !== geometry.rowSpan;
  const anchoredResize =
    resizing &&
    permissions.resizable &&
    resizeEdges.some(edge =>
      preservesDashboardResizeAnchors(source, geometry, { edge, readingDirection: permissions.readingDirection })
    );

  return (!moving || permissions.movable || anchoredResize) && (!resizing || permissions.resizable);
}
