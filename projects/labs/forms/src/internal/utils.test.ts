import { describe, it, expect } from 'vitest';
import { isObjectLiteral } from './utils.js';

describe('isObjectLiteral', () => {
  it('should return true for an object literal', () => {
    const obj = { a: 1, b: 2 };
    expect(isObjectLiteral(obj)).toBe(true);
  });

  it('should return false for non object literals', () => {
    expect(isObjectLiteral(null)).toBe(false);
    expect(isObjectLiteral(undefined)).toBe(false);
    expect(isObjectLiteral(1)).toBe(false);
    expect(isObjectLiteral('string')).toBe(false);
    expect(isObjectLiteral(true)).toBe(false);
    expect(isObjectLiteral([])).toBe(false);
  });
});
