import { describe, expect, it } from 'vitest';
import { ReleasesService } from './releases.service.js';

describe('ReleasesService', () => {
  it('should return the releases data', async () => {
    const releases = await ReleasesService.getReleases();
    expect(releases).toBeDefined();
    expect(releases.releases).toBeDefined();
    expect(releases.releases.length).toBeGreaterThan(0);
  });
});
