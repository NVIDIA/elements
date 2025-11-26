import { describe, expect, it } from 'vitest';
import { ReleasesService } from './releases.service.js';

describe('ReleasesService', () => {
  it('should return the releases data', async () => {
    const releases = await ReleasesService.getData();
    expect(releases).toBeDefined();
    expect(releases.created).toBeDefined();
    expect(releases.data).toBeDefined();
    expect(releases.data.length).toBeGreaterThan(0);
  });
});
