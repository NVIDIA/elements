import { describe, expect, it } from 'vitest';
import { VERSION } from './index.js';

describe('VERSION', () => {
  it('should export a VERSION const', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
