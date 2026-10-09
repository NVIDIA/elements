// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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
