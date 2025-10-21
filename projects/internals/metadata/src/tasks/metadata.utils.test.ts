import { beforeAll, describe, expect, it } from 'vitest';
import { getMetadata } from './metadata.utils.js';
import type { MetadataSummary } from '../types.js';

describe('Metadata', () => {
  let metadata: MetadataSummary;

  beforeAll(async () => {
    metadata = await getMetadata();
  });

  it('should return the metadata json', async () => {
    expect(metadata).toBeDefined();
  });

  it('should return the created date', async () => {
    expect(metadata.created).toBeDefined();
  });

  it('should return the types', async () => {
    expect(metadata.projects['@nvidia-elements/core'].types).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].types.length).toBeGreaterThan(0);
    expect(metadata.projects['@nvidia-elements/core'].types[0].name).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].types[0].type).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].types[0].description).toBeDefined();
  });

  it('should return the project metadata', async () => {
    expect(metadata.projects['@nvidia-elements/core']).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].name).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].version).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].readme).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].changelog).toBeDefined();
  });

  it('should return the project elements', async () => {
    expect(metadata.projects['@nvidia-elements/core'].elements).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].elements.length).toBeGreaterThan(0);
    expect(metadata.projects['@nvidia-elements/core'].elements[0].name).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].elements[0].manifest).toBeDefined();
  });
});
