import { beforeEach, describe, expect, it } from 'vitest';
import { getMetadata } from './metadata.utils.js';
import type { MetadataSummary } from '../types.js';

describe('Metadata', () => {
  let metadata: MetadataSummary;

  beforeEach(async () => {
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
    expect(metadata.projects['@nvidia-elements/core'].tests).toBeDefined();
  });

  it('should return the project tests', async () => {
    expect(metadata.projects['@nvidia-elements/core'].tests).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage.length).toBeGreaterThan(0);
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].file).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].lines).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].lines.pct).toBeDefined();
  });

  it('should return the project elements', async () => {
    expect(metadata.projects['@nvidia-elements/core'].elements).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].elements.length).toBeGreaterThan(0);
    expect(metadata.projects['@nvidia-elements/core'].elements[0].name).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].elements[0].manifest).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].elements[0].tests).toBeDefined();
  });

  it('should return the project test summary', async () => {
    expect(metadata.projects['@nvidia-elements/core'].tests).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.unitTestsTotal).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.axeTestsTotal).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.visualTestsTotal).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.ssrTestsTotal).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverageTotal).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverageTotal.lines).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverageTotal.lines.pct).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverageTotal.statements).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverageTotal.statements.pct).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverageTotal.branches).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverageTotal.branches.pct).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverageTotal.functions).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverageTotal.functions.pct).toBeDefined();
  });

  it('should return the project test files', async () => {
    expect(metadata.projects['@nvidia-elements/core'].tests).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage.length).toBeGreaterThan(0);
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].file).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].lines).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].lines.pct).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].statements).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].statements.pct).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].branches).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].branches.pct).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].functions).toBeDefined();
    expect(metadata.projects['@nvidia-elements/core'].tests.coverage[0].functions.pct).toBeDefined();
  });
});
