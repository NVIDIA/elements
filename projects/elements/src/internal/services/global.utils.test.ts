import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getEnv, getHostDetails } from './global.utils.js';

describe('getEnv', () => {
  it('should return the current environment as development or production', async () => {
    const env = getEnv();
    expect(env === 'development' || env === 'production').toBe(true);
  });

  it('should return development when hostname is localhost', () => {
    expect(getEnv()).toBe('development');
  });
});

describe('getHostDetails', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not warn when not hosted on esm.sh', () => {
    getHostDetails();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should return host details', () => {
    const result = getHostDetails();
    expect(typeof result.moduleHost).toBe('string');
    expect(typeof result.pageHost).toBe('string');
  });
});
