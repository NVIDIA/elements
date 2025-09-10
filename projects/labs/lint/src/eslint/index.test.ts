import { describe, expect, it } from 'vitest';
import { ESLINT_VERSION } from './index.js';

describe('ESLINT_VERSION', () => {
  it('should export a ESLINT_VERSION const', () => {
    expect(ESLINT_VERSION).toBe('0.0.0');
  });
});
