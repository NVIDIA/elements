// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { getRecommendedSlotName, hasSlot } from './slots.js';

describe('noUnexpectedSlotValue', () => {
  it('should', () => {
    expect(hasSlot('nve-card', 'content')).toBe(false);
    expect(hasSlot('nve-card', 'header')).toBe(false);
    expect(hasSlot('nve-card', 'footer')).toBe(false);
    expect(hasSlot('nve-card', '')).toBe(true);

    expect(hasSlot('nve-badge', 'prefix-icon')).toBe(true);
    expect(hasSlot('nve-badge', 'suffix-icon')).toBe(true);
    expect(hasSlot('nve-badge', '')).toBe(true);
  });
});

describe('getRecommendedSlotName', () => {
  it('should return the recommended slot name', () => {
    expect(getRecommendedSlotName('content', 'nve-card')).toBe('');
    expect(getRecommendedSlotName('default', 'nve-card')).toBe('');
    expect(getRecommendedSlotName('icon', 'nve-badge')).toBe('prefix-icon');
  });
});
