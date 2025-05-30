import { describe, expect, it } from 'vitest';
import { AVInfraService } from './av-infra.service.js';

describe('AVInfraService', () => {
  it('should return the av-infra metadata', async () => {
    const metadata = await AVInfraService.getMetadata();
    expect(metadata).toBeDefined();
    expect(metadata.created).toBeDefined();
    expect(metadata.projects).toBeDefined();
  });
});
