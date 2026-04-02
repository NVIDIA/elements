// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Dimensions, Interpolation, Point, Rect, Scale, SparklineMark } from '@nvidia-elements/core/internal';

export const PRECISION = 2;
export const VIEW_HEIGHT = 100;
export const DEFAULT_INTERVAL_LENGTH_EM = 0.6;

const HORIZONTAL_UNIT_WIDTH = VIEW_HEIGHT * DEFAULT_INTERVAL_LENGTH_EM;
const COLUMN_GAP_RATIO = 0.7;
const WINLOSS_GAP_RATIO = 0.85;

export function toValidData(data: unknown): number[] {
  if (!Array.isArray(data)) return [];
  return data.filter(Number.isFinite);
}

export function calculateViewBox(
  mark: SparklineMark,
  pointCount: number,
  intervalLength = DEFAULT_INTERVAL_LENGTH_EM
): Dimensions {
  const isIntervalBased = mark === 'line' || mark === 'area' || mark === 'gradient';
  const widthUnitCount = isIntervalBased ? Math.max(pointCount - 1, 1) : pointCount;
  const normalizedIntervalLength =
    Number.isFinite(intervalLength) && intervalLength > 0 ? intervalLength : DEFAULT_INTERVAL_LENGTH_EM;
  const width =
    mark === 'line' ? widthUnitCount * VIEW_HEIGHT * normalizedIntervalLength : widthUnitCount * HORIZONTAL_UNIT_WIDTH;

  return {
    width,
    height: VIEW_HEIGHT
  };
}

export function calculateDomain(
  values: number[],
  explicitMin?: number,
  explicitMax?: number,
  includeZero = false
): Scale | undefined {
  if (values.length === 0) return undefined;

  const dataMinimum = Math.min(...values);
  const dataMaximum = Math.max(...values);

  return {
    min: explicitMin ?? (includeZero ? Math.min(dataMinimum, 0) : dataMinimum),
    max: explicitMax ?? (includeZero ? Math.max(dataMaximum, 0) : dataMaximum)
  };
}

export function valueToY(value: number, min: number, max: number, viewHeight = VIEW_HEIGHT): number {
  const range = max - min;
  if (range === 0) return viewHeight / 2;
  return viewHeight - ((value - min) / range) * viewHeight;
}

export function toPlotPoints(
  values: number[],
  min: number,
  max: number,
  viewWidth: number,
  viewHeight = VIEW_HEIGHT
): Point[] {
  const stepX = values.length > 1 ? viewWidth / (values.length - 1) : 0;
  return values.map((value, index) => ({
    x: index * stepX,
    y: valueToY(value, min, max, viewHeight)
  }));
}

export function calculateSymbolIndices(
  values: number[],
  denoteFirst: boolean,
  denoteLast: boolean,
  denoteMin: boolean,
  denoteMax: boolean
): Set<number> {
  const indices = new Set<number>();
  if (values.length === 0) return indices;

  if (denoteFirst) indices.add(0);
  if (denoteLast) indices.add(values.length - 1);

  const needsExtrema = denoteMin || denoteMax;
  if (!needsExtrema) return indices;

  const min = Math.min(...values);
  const max = Math.max(...values);

  values.forEach((value, index) => {
    if (denoteMin && value === min) indices.add(index);
    if (denoteMax && value === max) indices.add(index);
  });

  return indices;
}

export function toInterpolation(interpolation: unknown): Interpolation {
  switch (interpolation) {
    case 'linear':
      return 'linear';
    case 'smooth':
      return 'smooth';
    case 'step':
      return 'step';
    default: {
      return 'linear';
    }
  }
}

export function toLinePath(points: Point[], interpolation: Interpolation, viewWidth: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const y = points[0]!.y.toFixed(PRECISION);
    return `M 0 ${y} L ${viewWidth.toFixed(PRECISION)} ${y}`;
  }

  switch (interpolation) {
    case 'step':
      return toStepOpenPath(points);
    case 'smooth':
      return toSmoothOpenPath(points);
    case 'linear':
      return toLinearOpenPath(points);
    default: {
      const exhaustiveCheck: never = interpolation;
      throw new Error(`Unhandled interpolation: ${exhaustiveCheck}`);
    }
  }
}

export function toAreaPath(points: Point[], interpolation: Interpolation, viewHeight = VIEW_HEIGHT): string {
  if (points.length === 0) return '';

  let openPath = '';
  switch (interpolation) {
    case 'step':
      openPath = toStepOpenPath(points);
      break;
    case 'smooth':
      openPath = toSmoothOpenPath(points);
      break;
    case 'linear':
      openPath = toLinearOpenPath(points);
      break;
    default: {
      const exhaustiveCheck: never = interpolation;
      throw new Error(`Unhandled interpolation: ${exhaustiveCheck}`);
    }
  }

  const last = points[points.length - 1]!;
  const first = points[0]!;
  openPath += ` L ${last.x.toFixed(PRECISION)} ${viewHeight.toFixed(PRECISION)}`;
  openPath += ` L ${first.x.toFixed(PRECISION)} ${viewHeight.toFixed(PRECISION)} Z`;
  return openPath;
}

export function toColumnRects(points: Point[], baselineY: number, width: number): Rect[] {
  const { bandSize: bandWidth, stepSize: stepX } = calculateBandSizing(points.length, width, COLUMN_GAP_RATIO);

  return points.map((point, index) => {
    const x = index * stepX + (stepX - bandWidth) / 2;
    const height = Math.abs(point.y - baselineY);
    const y = Math.min(point.y, baselineY);
    return { x, y, width: bandWidth, height };
  });
}

export function toWinLossRects(
  values: number[],
  baselineY: number,
  width: number,
  height: number
): (Rect & { className: 'win' | 'loss' | 'draw' })[] {
  const { bandSize: bandWidth, stepSize: stepX } = calculateBandSizing(values.length, width, WINLOSS_GAP_RATIO);
  const barHeight = height / 2;

  return values.map((value, index) => {
    const x = index * stepX + (stepX - bandWidth) / 2;

    if (value > 0) {
      return { className: 'win', x, y: baselineY - barHeight, width: bandWidth, height: barHeight };
    }

    if (value < 0) {
      return { className: 'loss', x, y: baselineY, width: bandWidth, height: barHeight };
    }

    return {
      className: 'draw',
      x,
      y: baselineY - barHeight / 4,
      width: bandWidth,
      height: barHeight / 2
    };
  });
}

function toLinearOpenPath(points: Point[]): string {
  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x.toFixed(PRECISION)} ${point.y.toFixed(PRECISION)}`;
    }
    return `${path} L ${point.x.toFixed(PRECISION)} ${point.y.toFixed(PRECISION)}`;
  }, '');
}

function toSmoothOpenPath(points: Point[]): string {
  const segments = points.map((point, index) => {
    if (index === 0) {
      return `M ${point.x.toFixed(PRECISION)} ${point.y.toFixed(PRECISION)}`;
    }
    const previous = points[index - 1]!;
    const deltaX = (point.x - previous.x) / 3;
    const p = PRECISION;
    return `C ${(previous.x + deltaX).toFixed(p)} ${previous.y.toFixed(p)} ${(point.x - deltaX).toFixed(p)} ${point.y.toFixed(p)} ${point.x.toFixed(p)} ${point.y.toFixed(p)}`;
  });
  return segments.join(' ');
}

function toStepOpenPath(points: Point[]): string {
  let path = `M ${points[0]!.x.toFixed(PRECISION)} ${points[0]!.y.toFixed(PRECISION)}`;
  for (let index = 1; index < points.length; index++) {
    const point = points[index]!;
    path += ` H ${point.x.toFixed(PRECISION)} V ${point.y.toFixed(PRECISION)}`;
  }
  return path;
}

function calculateBandSizing(count: number, viewDimension: number, gapRatio: number) {
  if (count <= 0) return { bandSize: 0, stepSize: 0 };

  const stepSize = viewDimension / count;
  const bandSize = stepSize * gapRatio;
  return { bandSize, stepSize };
}
