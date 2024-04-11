import { describe, expect, it } from 'vitest';
import { deepMerge, formatStandardNumber, parseVersion } from '@nvidia-elements/core/internal';

describe('deepMerge', () => {
  const obj1 = {
    a: 'a',
    c: {
      d: 'd',
      e: 'e',
      f: 'f',
      g: [1, 2, 3]
    }
  };

  const obj2 = {
    b: 'b',
    c: {
      d: 'override d',
      e: 'e',
      g: [1, 2, 3, 4]
    }
  };

  it('should recursively merge two objects', () => {
    const merged = {
      a: 'a',
      b: 'b',
      c: {
        d: 'override d',
        e: 'e',
        f: 'f',
        g: [1, 2, 3, 4]
      }
    };

    expect(deepMerge(obj1, obj2)).toStrictEqual(merged);
  });

  it('works when nested fields change their type to object', () => {
    const result = deepMerge({ field: 'hello' }, { field: { a: 1 } });
    expect(result).toStrictEqual({ field: { a: 1 } });
  });
});

describe('parseVersion', () => {
  it('it should parse a version string', () => {
    expect(parseVersion('1.2.3')).toStrictEqual({ major: 1, minor: 2, patch: 3 });
  });

  it('it should parse a invalid version string', () => {
    expect(parseVersion('BROKEN_VERSION')).toStrictEqual({ major: -1, minor: -1, patch: -1 });
  });
});

describe('formatStandardNumber', () => {
  it('it should format number to standard locale', () => {
    expect(formatStandardNumber(1000000)).toBe('1,000,000');
  });
});
