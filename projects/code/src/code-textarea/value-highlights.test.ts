// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { supportsValueHighlights, ValueHighlights } from './value-highlights.js';

describe('ValueHighlights', () => {
  it('reuses a matching native range and removes it when cleared', () => {
    const textarea = document.createElement('textarea');
    textarea.value = 'const answer = 42;';
    if (!supportsValueHighlights(textarea)) throw new Error('Native value highlights are required');
    const highlights = new ValueHighlights(textarea);
    const name = 'nve-code-test-value';
    try {
      highlights.update([[0, 5, 'test-value']]);
      const group = CSS.highlights.get(name);
      if (!group) throw new Error('Missing test highlight group');
      const [range] = group;
      expect(range?.startOffset).toBe(0);
      expect(range?.endOffset).toBe(5);
      highlights.update([[0, 5, 'test-value']]);
      expect([...group][0]).toBe(range);
      highlights.clear();
      expect(group.size).toBe(0);
    } finally {
      highlights.clear();
      CSS.highlights.delete(name);
    }
  });
});
