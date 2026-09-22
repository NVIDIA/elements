// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { PICK_UNIFORM_OFFSETS } from './uniform-offsets.js';
import { getPickUniformOffset } from '../instance-partitions.js';
import { createLineItem, createMarkerItem } from '../../../../test/rendering.js';

describe('pick uniform offsets', () => {
  it('selects aligned ID fields without overlapping matrix storage', () => {
    expect(getPickUniformOffset(createMarkerItem())).toBe(PICK_UNIFORM_OFFSETS.marker);
    expect(getPickUniformOffset(createLineItem(3))).toBe(PICK_UNIFORM_OFFSETS.line);
    for (const offset of Object.values(PICK_UNIFORM_OFFSETS)) {
      expect(offset % Uint32Array.BYTES_PER_ELEMENT).toBe(0);
      expect(offset).toBeGreaterThanOrEqual(2 * 16 * Float32Array.BYTES_PER_ELEMENT);
    }
    expect(PICK_UNIFORM_OFFSETS.marker + 4).toBeLessThanOrEqual(160);
    expect(PICK_UNIFORM_OFFSETS.mesh + 4).toBeLessThanOrEqual(160);
    expect(PICK_UNIFORM_OFFSETS.stream + 4).toBeLessThanOrEqual(160);
    expect(PICK_UNIFORM_OFFSETS.line + 4).toBeLessThanOrEqual(192);
  });
});
