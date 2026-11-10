// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { DashboardGridPlacement, DashboardLayout } from '../dashboard.types.js';

export interface DashboardMovementRequest {
  readonly id: string;
  readonly geometry: DashboardGridPlacement;
}

/** Snaps the carried rectangle to bounded grid coordinates; layout planning resolves its destination. */
export function resolveDashboardTarget(
  layout: DashboardLayout,
  request: DashboardMovementRequest
): DashboardGridPlacement | undefined {
  const source = layout.items.find(item => item.id === request.id);
  if (!source) return undefined;

  const bounded = layout.grid.flow === 'vertical' ? 'column' : 'row';
  const span = bounded === 'column' ? 'columnSpan' : 'rowSpan';
  const chosen = {
    column: Math.max(0, Math.round(request.geometry.column)),
    row: Math.max(0, Math.round(request.geometry.row)),
    columnSpan: source.columnSpan,
    rowSpan: source.rowSpan
  };

  chosen[bounded] = Math.min(layout.grid.tracks - source[span], chosen[bounded]);

  return chosen;
}
