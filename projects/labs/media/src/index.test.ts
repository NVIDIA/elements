import { describe, it, expect } from 'vitest';
import { VERSION } from './index.js';

describe('@nvidia-elements/media', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
