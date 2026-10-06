import { describe, expect, it } from 'vitest';
import { replaceTextRanges } from './string.js';

describe('replaceTextRanges', () => {
  it('applies unsorted edits of different lengths using original source offsets', () => {
    const source = 'first / second / third';
    const replacements = [
      { start: 8, end: 14, value: '' },
      { start: 0, end: 5, value: 'expanded first' },
      { start: 17, end: 22, value: 'last' }
    ];

    expect(replaceTextRanges(source, replacements)).toBe('expanded first /  / last');
    expect(replacements.map(({ start }) => start)).toEqual([8, 0, 17]);
  });

  it('returns the source unchanged when there are no replacements', () => {
    expect(replaceTextRanges('unchanged source', [])).toBe('unchanged source');
  });
});
