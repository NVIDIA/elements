// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from '../../math/types.js';

export const DEFAULT_LINE_NORMAL: Vec3 = [0, 0, 1];
export const DEFAULT_LINE_WIDTH = 0.1;

export function lineDimensionsAreValid(width: number, dash: number, gap: number): boolean {
  return (
    Number.isFinite(width) &&
    Number.isFinite(dash) &&
    Number.isFinite(gap) &&
    width >= 0 &&
    dash >= 0 &&
    gap >= 0 &&
    (gap === 0 || dash > 0)
  );
}

export function lineNormalIsValid(x: number, y: number, z: number): boolean {
  return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) && Math.hypot(x, y, z) > 0;
}

// Boundary adapters check finiteness first to preserve their own numeric error messages.
export function assertLineDimensions(width: number, dash: number, gap: number): void {
  if (!lineDimensionsAreValid(width, dash, gap)) {
    throw new RangeError('Line width, dash, and gap must be nonnegative, with a positive dash before a gap.');
  }
}

export function assertLineNormal(normal: Readonly<Vec3>): void {
  if (!lineNormalIsValid(normal[0], normal[1], normal[2])) {
    throw new RangeError('Line normal length must be greater than zero.');
  }
}
