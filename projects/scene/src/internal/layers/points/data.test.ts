// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { normalizePointSizeUnit } from './data.js';

describe(normalizePointSizeUnit.name, () => {
  it('accepts world units explicitly and defaults invalid inputs to pixels', () => {
    expect(normalizePointSizeUnit('world')).toBe('world');
    for (const input of ['pixel', 'WORLD', '', undefined, null, {}, 1]) {
      expect(normalizePointSizeUnit(input)).toBe('pixel');
    }
  });
});
