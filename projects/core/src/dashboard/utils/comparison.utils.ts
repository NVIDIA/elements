// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { DashboardGridPlacement, DashboardItem, DashboardLayout } from '../dashboard.types.js';
import { haveSameGridPitch, type DashboardMetrics } from './geometry.utils.js';

/** Compares known arrangement fields; object property insertion order is irrelevant. */
export function sameDashboardLayout(left: DashboardLayout | undefined, right: DashboardLayout | undefined): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  return (
    left.version === right.version &&
    left.grid.flow === right.grid.flow &&
    left.grid.tracks === right.grid.tracks &&
    sameDashboardItems(left.items, right.items)
  );
}

export function sameDashboardItems(left: readonly DashboardItem[], right: readonly DashboardItem[]): boolean {
  return (
    left === right ||
    (left.length === right.length &&
      left.every((item, index) => {
        const other = right[index]!;
        return item.id === other.id && sameDashboardGridPlacement(item, other);
      }))
  );
}

export function sameDashboardGridPlacement(left: DashboardGridPlacement, right: DashboardGridPlacement): boolean {
  return (
    left.column === right.column &&
    left.row === right.row &&
    left.columnSpan === right.columnSpan &&
    left.rowSpan === right.rowSpan
  );
}

export function sameDashboardMetrics(left: DashboardMetrics | undefined, right: DashboardMetrics | undefined): boolean {
  return (
    left === right || (haveSameGridPitch(left, right) && left?.width === right?.width && left?.height === right?.height)
  );
}
