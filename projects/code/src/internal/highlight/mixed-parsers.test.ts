// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { javascript } from './mixed-parsers.js';
import { syntaxRanges } from './syntax.js';

describe('mixed parsers', () => {
  it('parses CSS templates while keeping substitutions in JavaScript', () => {
    const source = 'css`div { color: ${color}; }`';
    const tokens = syntaxRanges(javascript.parse(source)).map(([start, end, category]) => [
      source.slice(start, end),
      category
    ]);
    expect(tokens).toContainEqual(['color', 'property']);
    expect(tokens).toContainEqual(['color', 'variable']);
  });
});
