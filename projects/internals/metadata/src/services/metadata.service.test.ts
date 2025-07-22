import { describe, expect, it } from 'vitest';
import { MetadataService } from './metadata.service.js';

describe('MetadataService', () => {
  it('should return the metadata json', async () => {
    const metadata = await MetadataService.getMetadata();
    expect(metadata).toBeDefined();
    expect(metadata.created).toBeDefined();
  });

  it('should return the stories json', async () => {
    const stories = await MetadataService.getStories();
    expect(stories).toBeDefined();
    expect(stories.length).toBeGreaterThan(0);
  });
});
