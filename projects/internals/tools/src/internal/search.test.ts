// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { fuzzyMatch, removeNoiseWords, removeWords } from './search.js';

describe('removeNoiseWords', () => {
  it('should remove noise words from string', () => {
    const result = removeNoiseWords('This is a test description');
    expect(result).toBe('test description');
  });
});

describe('removeWords', () => {
  it('should remove words from string', () => {
    const result = removeWords('This is a test description', ['this']);
    expect(result).toBe('test description');
  });

  it('should remove multiple words from string', () => {
    const result = removeWords('This is a test description', ['test', 'description']);
    expect(result).toBe('this');
  });

  it('should remove words from middle of string', () => {
    const result = removeWords('This is a test description', ['test']);
    expect(result).toBe('this description');
  });

  it('should remove words with 2 or fewer characters from string', () => {
    const result = removeWords('This is a test description', []);
    expect(result).toBe('this test description');
  });

  it('should remove both specified words and short words', () => {
    const result = removeWords('This is a test description', ['test']);
    expect(result).toBe('this description');
  });

  it('should handle string with only short words', () => {
    const result = removeWords('a is to be or', []);
    expect(result).toBe('');
  });

  it('should preserve words longer than 2 characters', () => {
    const result = removeWords('The cat and dog are fun', []);
    expect(result).toBe('the cat and dog are fun');
  });
});

describe('fuzzyMatch', () => {
  it('should match exact word in candidates', () => {
    const result = fuzzyMatch('button', ['button', 'input', 'select']);
    expect(result).toEqual(['button']);
  });

  it('should match case-insensitively', () => {
    const result = fuzzyMatch('Button', ['button', 'input']);
    expect(result).toEqual(['button']);
  });

  it('should match multiple candidates', () => {
    const result = fuzzyMatch('button', ['button', 'button-group', 'input']);
    expect(result).toEqual(['button', 'button-group']);
  });

  it('should filter out words with 2 or fewer characters', () => {
    const result = fuzzyMatch('a is okay', ['a', 'is', 'ok', 'okay']);
    expect(result).toEqual(['okay']);
  });

  it('should split search string on special characters', () => {
    const result = fuzzyMatch('button@group', ['button', 'group', 'input']);
    expect(result).toEqual(['button', 'group']);
  });

  it('should match hyphenated candidates', () => {
    const result = fuzzyMatch('button', ['button-group', 'input-button', 'select']);
    expect(result).toEqual(['button-group', 'input-button']);
  });

  it('should match slash-separated candidates', () => {
    const result = fuzzyMatch('button', ['elements/button', 'components/input']);
    expect(result).toEqual(['elements/button']);
  });

  it('should filter out "nve" from candidate parts', () => {
    const result = fuzzyMatch('button', ['nve/button', 'nve/input']);
    expect(result).toEqual(['nve/button']);
  });

  it('should match when search contains hyphens', () => {
    const result = fuzzyMatch('button-group', ['button-group', 'button', 'group']);
    expect(result).toEqual(['button-group', 'button', 'group']);
  });

  it('should match when search contains slashes', () => {
    const result = fuzzyMatch('elements/button', ['elements/button', 'components/button']);
    expect(result).toEqual(['elements/button', 'components/button']);
  });

  it('should not match partial words in candidates', () => {
    const result = fuzzyMatch('nve-text', ['nve-text', 'nve-textarea']);
    expect(result).toEqual(['nve-text']);
  });

  it('should return empty array when no matches found', () => {
    const result = fuzzyMatch('button', ['input', 'select', 'textarea']);
    expect(result).toEqual([]);
  });

  it('should return empty array for empty search string', () => {
    const result = fuzzyMatch('', ['button', 'input']);
    expect(result).toEqual([]);
  });

  it('should return empty array for empty candidates', () => {
    const result = fuzzyMatch('button', []);
    expect(result).toEqual([]);
  });

  it('should handle complex candidate paths', () => {
    const result = fuzzyMatch('accordion', [
      'elements/accordion',
      'components/accordion-item',
      'patterns/accordion-group'
    ]);
    expect(result).toEqual(['elements/accordion', 'components/accordion-item', 'patterns/accordion-group']);
  });

  it('should match partial words in multi-part candidates', () => {
    const result = fuzzyMatch('card', ['card-header', 'card-body', 'button']);
    expect(result).toEqual(['card-header', 'card-body']);
  });

  it('should handle search with multiple words', () => {
    const result = fuzzyMatch('button group', ['button-group', 'button', 'group', 'input-group']);
    expect(result).toEqual(['button-group', 'button', 'group', 'input-group']);
  });
});
