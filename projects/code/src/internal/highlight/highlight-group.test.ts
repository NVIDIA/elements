// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getHighlightGroup } from './highlight-group.js';

describe('getHighlightGroup', () => {
  it('sets priority for new bracket groups and preserves an existing group', () => {
    const name = 'nve-code-bracket-test';
    const group = getHighlightGroup('bracket-test');
    try {
      expect(CSS.highlights.get(name)).toBe(group);
      expect(group.priority).toBe(1);
      group.priority = 7;
      expect(getHighlightGroup('bracket-test')).toBe(group);
      expect(group.priority).toBe(7);
    } finally {
      CSS.highlights.delete(name);
    }
  });
});
