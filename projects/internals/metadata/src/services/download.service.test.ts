import { describe, expect, it } from 'vitest';
import { DownloadService } from './download.service.js';

describe('DownloadService', () => {
  it('should return the downloads data', async () => {
    const downloads = await DownloadService.getDownloads();
    expect(downloads).toBeDefined();
    expect(downloads.totalDownloads).toBeDefined();
    expect(downloads.packages).toBeDefined();
    expect(downloads.packages.length).toBeGreaterThan(0);
  });
});
