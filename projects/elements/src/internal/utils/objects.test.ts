import { describe, expect, it } from 'vitest';
import { deepMerge } from '@elements/elements/internal';

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
        d: "override d",
        e: "e",
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
