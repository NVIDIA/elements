import { describe, expect, it } from 'vitest';
import { getEnv } from './global.utils.js';

describe('getEnv', () => {
  it('should return the environment as development if NODE_ENV was set', async () => {
    globalThis.process.env.NODE_ENV = 'development';
    expect(getEnv()).toBe('development');
  });

  it('should return the environment as development for localhost', async () => {
    expect(getEnv()).toBe('development');
  });
});
