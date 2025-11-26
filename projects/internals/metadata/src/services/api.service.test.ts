import { describe, expect, it } from 'vitest';
import { ApiService } from './api.service.js';

describe('ApiService', () => {
  it('should return the api json', async () => {
    const api = await ApiService.getData();
    expect(api).toBeDefined();
    expect(api.data.elements.length).toBeGreaterThan(0);
    expect(api.data.attributes.length).toBeGreaterThan(0);
    expect(api.data.tokens.length).toBeGreaterThan(0);
    expect(api.data.types.length).toBeGreaterThan(0);
    expect(api.created).toBeDefined();
  });

  it('should search api items', async () => {
    const results = await ApiService.search('button');
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });
});
