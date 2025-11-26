import { describe, expect, it } from 'vitest';
import { getApi } from './api.utils.js';

describe('ApiUtils', () => {
  // todo: mock file dependencies
  it('should return the api json', async () => {
    expect(getApi).toBeDefined();
  });
});
