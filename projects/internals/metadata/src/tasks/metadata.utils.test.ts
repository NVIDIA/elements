import { describe, expect, it } from 'vitest';
import { getMetadata } from './metadata.utils.js';

describe('Metadata', () => {
  // todo: mock file dependencies
  it('should return the metadata json', async () => {
    expect(getMetadata).toBeDefined();
  });
});
