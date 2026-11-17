// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Zero-based grid placement. Columns count from inline start (right in RTL); rows count from the top. Spans are positive cell counts. */
export interface DashboardGridPlacement {
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
}

export interface DashboardItem extends DashboardGridPlacement {
  id: string;
}

/** Grid and placements of the currently owned panels. */
export interface DashboardLayout {
  version: 1;
  grid: {
    flow: 'vertical' | 'horizontal';
    tracks: number;
  };
  items: DashboardItem[];
}

/** Allowed panel spans in columns and rows, independent of pixel sizing. */
export interface DashboardSpanConstraints {
  readonly id: string;
  readonly minColumnSpan: number;
  readonly minRowSpan: number;
  readonly maxColumnSpan: number;
  readonly maxRowSpan: number;
}

export interface DashboardCommandContext {
  /** Panel ID when a command targets the containing dashboard. */
  readonly value?: string;
  /** Integer grid placement for --place; --move-to-start uses only its bounded-axis coordinate. */
  readonly placement?: DashboardGridPlacement;
}
