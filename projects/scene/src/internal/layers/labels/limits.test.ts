// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LABEL_GLYPH_STRIDE, LabelTextBudget, MAX_LABEL_COUNT } from './limits.js';

describe(LabelTextBudget.name, () => {
  it('reads each text once while extending a prefix and reuses smaller prefixes without reading text', () => {
    let reads = 0;
    const texts = Array.from({ length: 1024 }, () => 'A');
    const source = new Proxy(texts, {
      get(target, key, receiver) {
        if (typeof key === 'string' && /^\d+$/.test(key)) reads += 1;
        return Reflect.get(target, key, receiver);
      }
    });
    const budget = new LabelTextBudget(source);
    budget.validate(512);
    expect(reads).toBe(512);
    budget.validate(1024);
    expect(reads).toBe(1024);
    for (const count of [512, 0, 1024, 1, 1023]) budget.validate(count);
    expect(reads).toBe(1024);
  });

  it('checks smaller device limits against cached totals and recovers after a rejected larger prefix', () => {
    const budget = new LabelTextBudget(['A', 'AA', 'AAA']);
    budget.validate(3, 6 * LABEL_GLYPH_STRIDE);
    expect(() => budget.validate(3, 5 * LABEL_GLYPH_STRIDE)).toThrow('glyph byte limit');
    expect(() => budget.validate(2, 3 * LABEL_GLYPH_STRIDE)).not.toThrow();
    const limited = new LabelTextBudget(['A', 'AA', 'AAA']);
    expect(() => limited.validate(3, 2 * LABEL_GLYPH_STRIDE)).toThrow('glyph byte limit');
    expect(() => limited.validate(1, LABEL_GLYPH_STRIDE)).not.toThrow();
    expect(() => limited.validate(3, 6 * LABEL_GLYPH_STRIDE)).not.toThrow();
  });

  it('bounds count before reading text and includes whitespace, surrogate pairs, and absent text', () => {
    const budget = new LabelTextBudget([' ', '🙂']);
    expect(() => budget.validate(MAX_LABEL_COUNT + 1)).toThrow('count');
    expect(() => budget.validate(-1)).toThrow('count');
    expect(() => budget.validate(1.5)).toThrow('count');
    expect(() => budget.validate(2, 2 * LABEL_GLYPH_STRIDE)).toThrow('glyph byte limit');
    expect(() => budget.validate(3, 3 * LABEL_GLYPH_STRIDE)).not.toThrow();
  });
});
