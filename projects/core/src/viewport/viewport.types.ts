// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PointerEndReason, PointerMovementGesture } from '@nvidia-elements/core/internal';

export interface ViewportTransform {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export interface ViewportPoint {
  readonly x: number;
  readonly y: number;
}

export interface ViewportRect extends ViewportPoint {
  readonly width: number;
  readonly height: number;
}

export type ViewportPanBehavior = boolean | 'space';

export interface ViewportPointerPanDetail extends PointerMovementGesture {
  readonly source: 'pointer';
  readonly start: ViewportTransform;
  readonly next: ViewportTransform;
}

export interface ViewportWheelPanDetail {
  readonly source: 'wheel';
  readonly event: WheelEvent;
  readonly clientX: number;
  readonly clientY: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly start: ViewportTransform;
  readonly next: ViewportTransform;
}

export interface ViewportDiscretePanDetail {
  readonly source: 'keyboard' | 'command';
  readonly event: KeyboardEvent | CommandEvent;
  readonly start: ViewportTransform;
  readonly next: ViewportTransform;
}

export type ViewportPanDetail = ViewportPointerPanDetail | ViewportWheelPanDetail | ViewportDiscretePanDetail;

export type ViewportPanEndReason = PointerEndReason | 'pinch';

export interface ViewportPanEndDetail {
  readonly source: 'pointer';
  readonly event: PointerEvent;
  readonly interrupted: boolean;
  readonly reason: ViewportPanEndReason;
  readonly start: ViewportTransform;
  readonly transform: ViewportTransform;
}

export interface ViewportZoomDetail {
  readonly source: 'wheel' | 'pinch' | 'keyboard' | 'command';
  readonly event: WheelEvent | PointerEvent | KeyboardEvent | CommandEvent;
  readonly clientX: number;
  readonly clientY: number;
  readonly anchor: ViewportPoint;
  readonly factor: number;
  readonly start: ViewportTransform;
  readonly next: ViewportTransform;
}

export interface ViewportAnimationOptions {
  readonly duration?: number;
}

export interface ViewportRevealOptions {
  /** Uniform CSS-pixel inset reserved around the revealed bounds. */
  readonly inset?: number;
  readonly scale?: number;
  readonly animated?: boolean;
  readonly duration?: number;
}
