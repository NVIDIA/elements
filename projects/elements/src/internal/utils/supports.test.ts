import { describe, expect, it } from 'vitest';
import { supportsNativeCSSAnchorPosition } from './supports.js';

describe('supportsNativeCSSAnchorPosition', () => {
  it('should determine if CSS Anchor Positioning is supported ', async () => {
    expect(supportsNativeCSSAnchorPosition()).toBe(true);
  });
});
