// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  deepMerge,
  formatStandardNumber,
  getDifference,
  isObject,
  isObjectLiteral,
  parseVersion
} from '@nvidia-elements/core/internal';

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

describe('parseVersion', () => {
  it('it should parse a version string', () => {
    expect(parseVersion('1.2.3')).toStrictEqual({ major: 1, minor: 2, patch: 3 });
  });

  it('it should parse a invalid version string', () => {
    expect(parseVersion('BROKEN_VERSION')).toStrictEqual({ major: -1, minor: -1, patch: -1 });
  });

  it('it should parse a version string with zero components', () => {
    expect(parseVersion('0.1.0')).toStrictEqual({ major: 0, minor: 1, patch: 0 });
  });
});

describe('formatStandardNumber', () => {
  it('it should format number to standard locale', () => {
    expect(formatStandardNumber(1000000)).toBe('1,000,000');
  });
});

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('should return false for null, undefined, and primitives', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject('string')).toBe(false);
    expect(isObject(42)).toBe(false);
    expect(isObject(true)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('should return true for class instances, Maps, and Dates', () => {
    expect(isObject(new Date())).toBe(true);
    expect(isObject(new Map())).toBe(true);
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

describe('getDifference', () => {
  it('should return the difference of two numbers', () => {
    expect(getDifference(1, 3)).toBe(2);
    expect(getDifference(3, 1)).toBe(-2);
  });

  it('should return the difference of two negative numbers', () => {
    expect(getDifference(-1, -3)).toBe(-2);
    expect(getDifference(-3, -1)).toBe(2);
  });

  it('should return the difference negative and positive numbers', () => {
    expect(getDifference(1, -3)).toBe(-4);
    expect(getDifference(3, -1)).toBe(-4);
    expect(getDifference(-3, 1)).toBe(4);
    expect(getDifference(-1, 3)).toBe(4);
  });
});
