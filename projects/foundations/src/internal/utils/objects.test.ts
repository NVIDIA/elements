// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { deepMerge, isObjectLiteral } from './objects.js';

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

  it.each(['root', 'nested'])('should ignore __proto__ keys at %s depth', depth => {
    const pollutionKey = 'nveDeepMergePollutionTest';
    const unsafe = Object.fromEntries([
      ['__proto__', { [pollutionKey]: true }],
      ['safe', 'value']
    ]);
    const target: Record<string, unknown> = depth === 'root' ? {} : { nested: {} };
    const source = depth === 'root' ? unsafe : { nested: unsafe };

    try {
      const result = deepMerge(target, source);

      expect(Object.getOwnPropertyDescriptor(Object.prototype, pollutionKey)).toBeUndefined();
      expect(Object.getPrototypeOf(target)).toBe(Object.prototype);
      expect(result).toStrictEqual(depth === 'root' ? { safe: 'value' } : { nested: { safe: 'value' } });
    } finally {
      Reflect.deleteProperty(Object.prototype, pollutionKey);
    }
  });

  it('works when nested fields change their type to object', () => {
    const result = deepMerge({ field: 'hello' }, { field: { a: 1 } });
    expect(result).toStrictEqual({ field: { a: 1 } });
  });

  it('should not corrupt class instances like Date and Map', () => {
    const date = new Date('2025-01-01');
    const map = new Map([['key', 'value']]);
    const result = deepMerge({ a: 'original' }, { a: date, b: map });
    expect(result.a).toBe(date);
    expect(result.a).toBeInstanceOf(Date);
    expect(result.b).toBe(map);
    expect(result.b).toBeInstanceOf(Map);
  });
});

describe('isObjectLiteral', () => {
  it('should return true for plain objects', () => {
    expect(isObjectLiteral({})).toBe(true);
    expect(isObjectLiteral({ a: 1 })).toBe(true);
  });

  it('should return true for objects with null prototype', () => {
    expect(isObjectLiteral(Object.create(null))).toBe(true);
  });

  it('should return false for null, undefined, and primitives', () => {
    expect(isObjectLiteral(null)).toBe(false);
    expect(isObjectLiteral(undefined)).toBe(false);
    expect(isObjectLiteral('string')).toBe(false);
    expect(isObjectLiteral(42)).toBe(false);
    expect(isObjectLiteral(true)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isObjectLiteral([])).toBe(false);
    expect(isObjectLiteral([1, 2, 3])).toBe(false);
  });

  it('should return false for class instances like Date and Map', () => {
    expect(isObjectLiteral(new Date())).toBe(false);
    expect(isObjectLiteral(new Map())).toBe(false);
  });
});
