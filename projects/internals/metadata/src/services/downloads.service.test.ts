import { describe, expect, it } from 'vitest';
import { DownloadsService } from './downloads.service.js';

describe('DownloadsService', () => {
  it('should return the downloads data', async () => {
    const downloads = await DownloadsService.getData();
    expect(downloads).toBeDefined();
    expect(downloads.totalDownloads).toBeDefined();
    expect(downloads.packages).toBeDefined();
    expect(downloads.packages.length).toBeGreaterThan(0);
  });
});
