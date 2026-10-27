// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { formatStandardNumber, getDifference, isObject, parseVersion } from '@nvidia-elements/core/internal';

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
