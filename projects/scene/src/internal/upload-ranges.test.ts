// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { mergeUploadRanges } from './upload-ranges.js';

describe('upload ranges', () => {
  it('should ignore empty ranges and merge overlapping and adjacent ranges', () => {
    expect(
      mergeUploadRanges([
        { offset: 96, size: 48 },
        { offset: 0, size: 48 },
        { offset: 40, size: 56 },
        { offset: 192, size: 0 },
        { offset: 192, size: 48 }
      ])
    ).toEqual([
      { offset: 0, size: 144 },
      { offset: 192, size: 48 }
    ]);
  });
});
