import { describe, expect, it } from 'vitest';
import { UsageService } from './usage.service.js';

describe('UsageService', () => {
  it('should return the usage metadata', async () => {
    const metadata = await UsageService.getData();
    expect(metadata).toBeDefined();
    expect(metadata.created).toBeDefined();
    expect(metadata.projects).toBeDefined();
  });
});
