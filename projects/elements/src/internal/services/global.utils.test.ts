import { describe, expect, it } from 'vitest';
import { getEnv } from './global.utils.js';

describe('getEnv', () => {
  it('should return the environment as development for localhost', async () => {
    expect(getEnv()).toBe('development');
  });
});
