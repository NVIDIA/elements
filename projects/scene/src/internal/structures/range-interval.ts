// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface RangeInterval {
  offset: number;
  size: number;
}

/** Checks nonnegative integer bounds and their sum. */
export function assertRangeInterval(offset: number, size: number): void {
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    !Number.isSafeInteger(size) ||
    size < 0 ||
    !Number.isSafeInteger(offset + size)
  ) {
    throw new RangeError('Range offsets, sizes, and endpoints must be nonnegative safe integers.');
  }
}
