// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ViewportRect } from './viewport.types.js';

const MIN_RETAINED_SPACING_FACTOR = 0.5;
const MAX_RETAINED_SPACING_FACTOR = 1.5;
const OVERSCAN_FACTOR = 1;
const COVERAGE_GUARD_FACTOR = 0.25;

interface GridlineIntervalOptions {
  readonly current?: number;
  readonly scale: number;
  readonly step: number;
  readonly targetSpacing: number;
}

export function selectGridlineInterval(options: GridlineIntervalOptions): number {
  const { scale, step, targetSpacing } = options;
  const retained = retainInterval(options);
  if (retained !== undefined) return retained;
  const desiredInterval = targetSpacing / scale;
  return Number.isFinite(desiredInterval) ? nearestInterval(step, desiredInterval) : Number.MAX_VALUE;
}

function retainInterval({ current, scale, step, targetSpacing }: GridlineIntervalOptions): number | undefined {
  if (current === undefined || !isIntegralMultiple(current, step)) return undefined;
  const projectedSpacing = current * scale;
  if (
    projectedSpacing < targetSpacing * MIN_RETAINED_SPACING_FACTOR ||
    projectedSpacing > targetSpacing * MAX_RETAINED_SPACING_FACTOR
  ) {
    return undefined;
  }
  return current;
}

function nearestInterval(step: number, desiredInterval: number): number {
  const desiredFactor = Math.max(1, desiredInterval / step);
  if (!Number.isFinite(desiredFactor)) return Number.MAX_VALUE;
  const exponent = Math.max(0, Math.floor(Math.log10(desiredFactor)));
  let nearestFactor = 1;
  let nearestDistance = Math.abs(desiredFactor - nearestFactor);

  for (let power = Math.max(0, exponent - 1); power <= exponent + 1; power += 1) {
    const magnitude = 10 ** power;
    for (const multiplier of [1, 2, 5]) {
      const factor = multiplier * magnitude;
      if (!Number.isFinite(step * factor)) continue;
      const distance = Math.abs(desiredFactor - factor);
      if (distance < nearestDistance) {
        nearestFactor = factor;
        nearestDistance = distance;
      }
    }
  }

  return step * nearestFactor;
}

function isIntegralMultiple(interval: number, step: number): boolean {
  const factor = interval / step;
  return Number.isFinite(factor) && Math.abs(factor - Math.round(factor)) < Number.EPSILON * 16;
}

export function createGridlineCoverage(visible: ViewportRect): ViewportRect {
  const horizontalOverscan = visible.width * OVERSCAN_FACTOR;
  const verticalOverscan = visible.height * OVERSCAN_FACTOR;
  return {
    x: visible.x - horizontalOverscan,
    y: visible.y - verticalOverscan,
    width: visible.width + horizontalOverscan * 2,
    height: visible.height + verticalOverscan * 2
  };
}

export function gridlineCoverageNeedsUpdate(coverage: ViewportRect | undefined, visible: ViewportRect): boolean {
  if (!coverage) return true;
  const horizontalGuard = visible.width * COVERAGE_GUARD_FACTOR;
  const verticalGuard = visible.height * COVERAGE_GUARD_FACTOR;
  return (
    visible.x < coverage.x + horizontalGuard ||
    visible.y < coverage.y + verticalGuard ||
    visible.x + visible.width > coverage.x + coverage.width - horizontalGuard ||
    visible.y + visible.height > coverage.y + coverage.height - verticalGuard
  );
}
