// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { normalizeTruncateString, normalizeTruncateText, truncateText } from './utils.js';

const options = {
  position: 'end',
  strategy: 'character',
  bias: 'end',
  preserve: 1,
  availableWidth: 5,
  measureText: (value: string) => Array.from(value).length
} as const;

describe('truncate text utilities', () => {
  it('normalizes whitespace across individual strings and node boundaries', () => {
    expect(normalizeTruncateString('  one\n two\tthree ')).toBe('one two three');
    expect(normalizeTruncateText([document.createTextNode(' one '), document.createTextNode(' two ')])).toBe('one two');
  });

  it.each([
    ['start', '…ghij'],
    ['end', 'abcd…'],
    ['center', 'abc…j']
  ] as const)('truncates at %s', (position, expected) => {
    expect(truncateText('abcdefghij', { ...options, position })).toBe(expected);
  });

  it('preserves a prefix when center truncation favors the start', () => {
    expect(truncateText('abcdefghij', { ...options, position: 'center', bias: 'start', preserve: 2 })).toBe('ab…ij');
  });

  it('retains whole word and path units when preserving the end', () => {
    expect(
      truncateText('one two three', { ...options, position: 'center', strategy: 'word', availableWidth: 10 })
    ).toBe('one…three');
    expect(
      truncateText('/root/folder/file.ts', { ...options, position: 'center', strategy: 'path', availableWidth: 12 })
    ).toBe('…/file.ts');
  });

  it('does not split a grapheme cluster', () => {
    const result = truncateText('👩‍💻abcd', {
      ...options,
      availableWidth: 4,
      measureText: value => [...new Intl.Segmenter().segment(value)].length
    });
    expect(result).toBe('👩‍💻ab…');
  });

  it('handles no space, fitting text and nonfinite widths', () => {
    expect(truncateText('abc', { ...options, availableWidth: 0 })).toBe('');
    expect(truncateText('abc', options)).toBe('abc');
    expect(truncateText('abc', { ...options, availableWidth: Infinity })).toBe('abc');
    expect(truncateText('abc', { ...options, availableWidth: 0.5 })).toBe('…');
  });
});
