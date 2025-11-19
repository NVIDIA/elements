import { describe, expect, it } from 'vitest';
import { getEnv } from './global.utils.js';

describe('getEnv', () => {
  it('should return the current environment as development or production', async () => {
    const env = getEnv();
    expect(env === 'development' || env === 'production').toBe(true);
  });
});
