// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rect } from '@nvidia-elements/core/internal';

export function sameArrayItems<T>(left: readonly T[], right: readonly T[]) {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index++) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

export function sameRect(left: Rect, right: Rect) {
  return left.x === right.x && left.y === right.y && left.width === right.width && left.height === right.height;
}
