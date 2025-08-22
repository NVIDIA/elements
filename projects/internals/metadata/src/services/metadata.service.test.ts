import { describe, expect, it } from 'vitest';
import { MetadataService } from './metadata.service.js';

describe('MetadataService', () => {
  it('should return the metadata json', async () => {
    const metadata = await MetadataService.getMetadata();
    expect(metadata).toBeDefined();
    expect(metadata.created).toBeDefined();
  });

  it('should return the examples json', async () => {
    const examples = await MetadataService.getExamples();
    expect(examples).toBeDefined();
    expect(examples.length).toBeGreaterThan(0);
  });
});
