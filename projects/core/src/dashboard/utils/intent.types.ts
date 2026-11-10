// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { DashboardResizeEdge } from './geometry.utils.js';

/** Continuous grid-cell geometry used while interpreting pointer movement. */
export interface DashboardGridGeometry {
  readonly column: number;
  readonly row: number;
  readonly columnSpan: number;
  readonly rowSpan: number;
}

export type DashboardAction = 'move' | 'resize';

export type DashboardAxis = 'column' | 'row';

export type DashboardAxisDirection = -1 | 1;

export interface DashboardGridPoint {
  readonly column: number;
  readonly row: number;
}

/** Pointer coordinates and spacing use cell pitches. */
export interface DashboardPointerPlacementQuery {
  readonly aimGeometry: DashboardGridGeometry;
  readonly pointerPosition: DashboardGridPoint;
  readonly spacingFraction: DashboardGridPoint;
}

/** Semantic input after command and gesture permission checks. */
export type DashboardIntent =
  | { readonly kind: 'coordinate'; readonly geometry: DashboardGridGeometry }
  | {
      readonly kind: 'pointer';
      readonly geometry: DashboardGridGeometry;
      readonly position: DashboardPointerPlacementQuery;
    }
  | {
      readonly kind: 'advance';
      readonly geometry: DashboardGridGeometry;
      readonly step: DashboardGridPoint;
    }
  | { readonly kind: 'start'; readonly geometry: DashboardGridGeometry }
  | { readonly kind: 'resize'; readonly geometry: DashboardGridGeometry };

/** Pointer admission uses the same complete request for replay. */
export type DashboardPointerIntent =
  | {
      readonly kind: 'pointer';
      readonly geometry: DashboardGridGeometry;
      readonly position: DashboardPointerPlacementQuery;
    }
  | { readonly kind: 'start'; readonly geometry: DashboardGridGeometry }
  | {
      readonly kind: 'anchored-resize';
      readonly geometry: DashboardGridGeometry;
      readonly edge: DashboardResizeEdge;
    };

export type DashboardArrangementRequest =
  | {
      readonly kind: 'command';
      readonly command: string;
      readonly placement?: unknown;
    }
  | DashboardPointerIntent;

export type DashboardCommandEvent = Event & {
  command?: string;
  source?: HTMLElement & {
    value?: string;
    placement?: unknown;
    disabled?: boolean;
    readOnly?: boolean;
  };
};
