// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RGBA } from '../color/types.js';

interface CheckerboardStyle {
  readonly count: number;
  readonly opaque: boolean;
  readonly transparent: boolean;
}

const checkerboards = new WeakMap<HTMLElement, CheckerboardStyle>();
const styleSamplers = new WeakMap<HTMLElement, () => void>();

/** Lets the owning scene sample resolved CSS colors during its existing animation tick. */
export function registerGridlinesStyleSampler(layer: HTMLElement, sample: () => void): void {
  styleSamplers.set(layer, sample);
}

export function getGridlinesStyleSampler(layer: HTMLElement): (() => void) | undefined {
  return styleSamplers.get(layer);
}

/** Captures procedural grid settings alongside the two packed corner records. */
export function setGridlinesCheckerboard(
  layer: HTMLElement,
  options: { readonly count: number; readonly color: RGBA; readonly alternateColor: RGBA } | undefined
): void {
  if (!options) {
    checkerboards.delete(layer);
    return;
  }
  const alpha = options.color[3];
  const alternateAlpha = options.alternateColor[3];
  checkerboards.set(layer, {
    count: options.count,
    opaque: alpha === 1 || alternateAlpha === 1,
    // Filtering between different alpha values also produces translucent fragments.
    transparent: Math.max(alpha, alternateAlpha) > 0 && Math.min(alpha, alternateAlpha) < 1
  });
}

export function getGridlinesCheckerboard(layer: HTMLElement): CheckerboardStyle | undefined {
  return checkerboards.get(layer);
}
