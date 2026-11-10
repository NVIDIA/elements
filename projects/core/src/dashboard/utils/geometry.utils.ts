// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rect } from '@nvidia-elements/core/internal';

import type { DashboardGridGeometry } from './intent.types.js';

import type { DashboardGridPlacement, DashboardLayout, DashboardSpanConstraints } from '../dashboard.types.js';

export interface DashboardMetrics {
  readonly columnSize: number;
  readonly rowSize: number;
  /** Signed separation between outer cell boxes; negative means border overlap. */
  readonly gap: number;
  readonly width: number;
  readonly height: number;
}

export function transposeDashboardGridGeometry(geometry: DashboardGridGeometry): DashboardGridGeometry {
  return { column: geometry.row, row: geometry.column, columnSpan: geometry.rowSpan, rowSpan: geometry.columnSpan };
}

export function doDashboardGridGeometriesOverlap(left: DashboardGridGeometry, right: DashboardGridGeometry): boolean {
  return (
    left.column < right.column + right.columnSpan &&
    right.column < left.column + left.columnSpan &&
    left.row < right.row + right.rowSpan &&
    right.row < left.row + left.rowSpan
  );
}

interface DashboardMetricInput {
  flow: DashboardLayout['grid']['flow'];
  tracks: number;
  sizing: 'fit' | 'fixed';
  width: number;
  height: number;
  columnSize: number;
  rowSize: number;
  gap: number;
  overlap: number;
}

export function resolveDashboardMetrics(input: DashboardMetricInput): DashboardMetrics | undefined {
  const { flow, tracks, sizing, width, height } = input;
  const gap = input.gap - (input.gap === 0 ? input.overlap : 0);
  if (!isMetricInputValid(input)) return undefined;

  const columnSize = sizing === 'fit' && flow === 'vertical' ? (width - (tracks - 1) * gap) / tracks : input.columnSize;
  const rowSize = sizing === 'fit' && flow === 'horizontal' ? (height - (tracks - 1) * gap) / tracks : input.rowSize;
  if (![columnSize, rowSize, columnSize + gap, rowSize + gap].every(value => Number.isFinite(value) && value > 0)) {
    return undefined;
  }

  return { columnSize, rowSize, gap, width, height };
}

/** CSS-pixel placement measured from the canvas inline start and top. */
export interface DashboardPixelPlacement {
  readonly inlineStart: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export type DashboardReadingDirection = 'ltr' | 'rtl';

export function getDashboardPixelPlacement(
  geometry: DashboardGridGeometry,
  metrics: DashboardMetrics
): DashboardPixelPlacement {
  return {
    inlineStart: geometry.column * (metrics.columnSize + metrics.gap),
    top: geometry.row * (metrics.rowSize + metrics.gap),
    width: geometry.columnSpan * metrics.columnSize + (geometry.columnSpan - 1) * metrics.gap,
    height: geometry.rowSpan * metrics.rowSize + (geometry.rowSpan - 1) * metrics.gap
  };
}

/** Projects logical canvas placement into physical client coordinates. */
export function getDashboardPlacementClientRect(
  placement: DashboardPixelPlacement,
  canvasClientRect: Rect,
  readingDirection: DashboardReadingDirection
): Rect {
  return {
    x:
      readingDirection === 'rtl'
        ? canvasClientRect.x + canvasClientRect.width - placement.inlineStart - placement.width
        : canvasClientRect.x + placement.inlineStart,
    y: canvasClientRect.y + placement.top,
    width: placement.width,
    height: placement.height
  };
}

export function getProjectedControlRect(
  input: { control: Rect; current: Rect; target: Rect },
  anchoredEdges: { right: boolean; bottom: boolean }
): Rect {
  const { control, current, target } = input;
  return {
    ...control,
    x: control.x + target.x - current.x + (anchoredEdges.right ? target.width - current.width : 0),
    y: control.y + target.y - current.y + (anchoredEdges.bottom ? target.height - current.height : 0)
  };
}

export function getRevealScrollDelta(rect: Rect, viewport: Rect): { x: number; y: number } {
  return {
    x: getNearestScrollDelta({
      start: rect.x,
      end: rect.x + rect.width,
      low: viewport.x,
      high: viewport.x + viewport.width
    }),
    y: getNearestScrollDelta({
      start: rect.y,
      end: rect.y + rect.height,
      low: viewport.y,
      high: viewport.y + viewport.height
    })
  };
}

function getNearestScrollDelta(input: { start: number; end: number; low: number; high: number }): number {
  if (input.start < input.low) return input.start - input.low;
  if (input.end > input.high) return input.end - input.high;

  return 0;
}

export function getDashboardCanvasSize(input: {
  layout: DashboardLayout;
  metrics: DashboardMetrics;
  sizing: 'fit' | 'fixed';
  items: readonly DashboardGridPlacement[];
  floor?: { width: number; height: number };
}): { width: number; height: number } {
  const { layout, metrics, sizing, items } = input;
  const pixels = items.map(item => getDashboardPixelPlacement(item, metrics));
  const right = Math.max(metrics.width, input.floor?.width ?? 0, ...pixels.map(item => item.inlineStart + item.width));
  const bottom = Math.max(metrics.height, input.floor?.height ?? 0, ...pixels.map(item => item.top + item.height));

  if (layout.grid.flow === 'vertical') {
    const boundedWidth =
      sizing === 'fit' ? metrics.width : layout.grid.tracks * (metrics.columnSize + metrics.gap) - metrics.gap;

    return { width: boundedWidth, height: bottom };
  }

  const boundedHeight =
    sizing === 'fit' ? metrics.height : layout.grid.tracks * (metrics.rowSize + metrics.gap) - metrics.gap;

  return { width: right, height: boundedHeight };
}

function isMetricInputValid(input: DashboardMetricInput): boolean {
  return (
    [input.width, input.height, input.gap, input.overlap].every(Number.isFinite) &&
    input.width > 0 &&
    input.height > 0 &&
    input.gap >= 0 &&
    input.overlap >= 0 &&
    Number.isSafeInteger(input.tracks) &&
    input.tracks >= 1
  );
}

export type DashboardResizeEdge = 'left' | 'right' | 'top' | 'bottom' | 'bottom-right' | 'bottom-left';

interface ResizeAxisInput {
  start: number;
  span: number;
  pixelStart: number;
  pixelLength: number;
  pixelDelta: number;
  edge: 'minimum' | 'maximum' | 'none';
  minimumSpan: number;
  maximumSpan: number;
  coordinateLimit: number;
  /** Cell pitch and signed cell spacing, in CSS pixels. */
  pitch: number;
  gap: number;
}

/** Physical corner occupied by the panel's resize control. */
export function getDashboardResizeCorner(panel: Element): 'bottom-left' | 'bottom-right' {
  return panel.matches(':dir(rtl)') ? 'bottom-left' : 'bottom-right';
}

interface ResizeBoundaries {
  readonly column: ResizeAxisInput['edge'];
  readonly row: ResizeAxisInput['edge'];
}

const resizeBoundaries: Readonly<Record<DashboardResizeEdge, ResizeBoundaries>> = {
  left: { column: 'minimum', row: 'none' },
  right: { column: 'maximum', row: 'none' },
  top: { column: 'none', row: 'minimum' },
  bottom: { column: 'none', row: 'maximum' },
  'bottom-left': { column: 'minimum', row: 'maximum' },
  'bottom-right': { column: 'maximum', row: 'maximum' }
};

/** Resolves physical edges against the grid's logical column direction. */
export function getDashboardResizeBoundaries(
  edge: DashboardResizeEdge,
  readingDirection: DashboardReadingDirection
): ResizeBoundaries {
  const physical = resizeBoundaries[edge];
  if (readingDirection === 'ltr' || physical.column === 'none') return physical;

  return { ...physical, column: physical.column === 'minimum' ? 'maximum' : 'minimum' };
}

interface AnchoredResizeInput {
  source: DashboardGridPlacement;
  initialPixelPlacement: DashboardPixelPlacement;
  delta: { inline: number; vertical: number };
  edge: DashboardResizeEdge;
  grid: DashboardLayout['grid'];
  limits: DashboardSpanConstraints;
  readingDirection: DashboardReadingDirection;
}

/** Keeps the opposite grid boundary fixed while resizing a physical edge. */
export function getAnchoredResizeGeometry(
  input: AnchoredResizeInput,
  metrics: DashboardMetrics
): { geometry: DashboardGridPlacement; canvasPlacement: DashboardPixelPlacement } {
  const { source, initialPixelPlacement, delta, edge, grid, limits } = input;
  const boundaries = getDashboardResizeBoundaries(edge, input.readingDirection);
  const horizontal = resizeAxis({
    start: source.column,
    span: source.columnSpan,
    pixelStart: initialPixelPlacement.inlineStart,
    pixelLength: initialPixelPlacement.width,
    pixelDelta: delta.inline,
    edge: boundaries.column,
    minimumSpan: limits.minColumnSpan,
    maximumSpan: limits.maxColumnSpan,
    coordinateLimit: grid.flow === 'vertical' ? grid.tracks : 1_000_000,
    pitch: metrics.columnSize + metrics.gap,
    gap: metrics.gap
  });
  const vertical = resizeAxis({
    start: source.row,
    span: source.rowSpan,
    pixelStart: initialPixelPlacement.top,
    pixelLength: initialPixelPlacement.height,
    pixelDelta: delta.vertical,
    edge: boundaries.row,
    minimumSpan: limits.minRowSpan,
    maximumSpan: limits.maxRowSpan,
    coordinateLimit: grid.flow === 'horizontal' ? grid.tracks : 1_000_000,
    pitch: metrics.rowSize + metrics.gap,
    gap: metrics.gap
  });

  return {
    geometry: { column: horizontal.start, row: vertical.start, columnSpan: horizontal.span, rowSpan: vertical.span },
    canvasPlacement: {
      inlineStart: horizontal.pixelStart,
      top: vertical.pixelStart,
      width: horizontal.pixelLength,
      height: vertical.pixelLength
    }
  };
}

function resizeAxis(input: ResizeAxisInput) {
  const {
    start,
    span,
    pixelStart,
    pixelLength,
    pixelDelta,
    edge,
    minimumSpan,
    maximumSpan,
    coordinateLimit,
    pitch,
    gap
  } = input;
  if (edge === 'none') return { start, span, pixelStart, pixelLength };

  const end = start + span;
  const leading = edge === 'minimum';
  const maxSpan = Math.min(maximumSpan, leading ? end : coordinateLimit - start);
  const rawLength = Math.max(
    minimumSpan * pitch - gap,
    Math.min(maxSpan * pitch - gap, pixelLength + (leading ? -pixelDelta : pixelDelta))
  );
  const rawStart = leading ? pixelStart + pixelLength - rawLength : pixelStart;
  const logicalLength = span * pitch - gap + (leading ? -pixelDelta : pixelDelta);
  const boundary = Math.round(leading ? end - (logicalLength + gap) / pitch : start + (logicalLength + gap) / pitch);
  const size = Math.max(minimumSpan, Math.min(maxSpan, leading ? end - boundary : boundary - start));

  return { start: leading ? end - size : start, span: size, pixelStart: rawStart, pixelLength: rawLength };
}

/** Validates resize semantics independently of ordinary movement permissions. */
export function preservesDashboardResizeAnchors(
  source: DashboardGridPlacement,
  geometry: DashboardGridPlacement,
  options: { edge: DashboardResizeEdge; readingDirection: DashboardReadingDirection }
): boolean {
  const boundaries = getDashboardResizeBoundaries(options.edge, options.readingDirection);
  return (['column', 'row'] as const).every(axis => {
    const span = axis === 'column' ? 'columnSpan' : 'rowSpan';
    return (
      (boundaries[axis] === 'maximum' || source[axis] + source[span] === geometry[axis] + geometry[span]) &&
      (boundaries[axis] === 'minimum' || source[axis] === geometry[axis])
    );
  });
}

export function isDashboardResizeEdge(value: string | undefined): value is DashboardResizeEdge {
  return (
    value === 'left' ||
    value === 'right' ||
    value === 'top' ||
    value === 'bottom' ||
    value === 'bottom-right' ||
    value === 'bottom-left'
  );
}

export function getDashboardClientRect(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect();
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

export function haveSameGridPitch(left: DashboardMetrics | undefined, right: DashboardMetrics | undefined): boolean {
  return (
    !!left &&
    !!right &&
    left.columnSize === right.columnSize &&
    left.rowSize === right.rowSize &&
    left.gap === right.gap
  );
}
