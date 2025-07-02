import { describe, it, expect } from 'vitest';
import { VERSION } from './index.js';

describe('index', () => {
  it('should have a version', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
