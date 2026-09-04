// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface UploadRange {
  readonly offset: number;
  readonly size: number;
}

export function mergeUploadRanges(ranges: readonly UploadRange[]): UploadRange[] {
  const sorted = [...ranges].filter(range => range.size > 0).sort((left, right) => left.offset - right.offset);
  const merged: UploadRange[] = [];
  for (const range of sorted) {
    const previous = merged.at(-1);
    const end = range.offset + range.size;
    if (previous && range.offset <= previous.offset + previous.size) {
      merged[merged.length - 1] = {
        offset: previous.offset,
        size: Math.max(previous.offset + previous.size, end) - previous.offset
      };
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}
