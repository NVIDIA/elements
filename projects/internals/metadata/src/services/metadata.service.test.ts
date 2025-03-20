import { describe, expect, it } from 'vitest';
import { MetadataService } from './metadata.service.js';

describe('MetadataService', () => {
  it('should return the metadata json', async () => {
    const metadata = await MetadataService.getMetadata();
    expect(metadata).toBeDefined();
    expect(metadata.created).toBeDefined();
  });

  it('should return the elements metadata', async () => {
    const elementsMetadata = await MetadataService.getMaglevMetadata();
    expect(elementsMetadata).toBeDefined();
    expect(elementsMetadata.created).toBeDefined();
    expect(elementsMetadata.projects).toBeDefined();
  });
});
