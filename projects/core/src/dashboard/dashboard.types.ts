// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Zero-based grid placement. Columns count from inline start (right in RTL); rows count from the top. Spans are positive cell counts. */
export interface DashboardGridPlacement {
  readonly column: number;
  readonly row: number;
  readonly columnSpan: number;
  readonly rowSpan: number;
}

export interface DashboardItem extends DashboardGridPlacement {
  readonly id: string;
}

/** Grid and placements of the currently owned panels. */
export interface DashboardLayout {
  readonly version: 1;
  readonly grid: {
    readonly flow: 'vertical' | 'horizontal';
    readonly tracks: number;
  };
  readonly items: readonly DashboardItem[];
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
