import { beforeAll, describe, expect, it } from 'vitest';
import { generateTestSummary } from './tests.utils.js';
import type { ProjectsTestSummary } from '../utils/reports.js';

describe('TestsUtils', () => {
  let summary: ProjectsTestSummary;

  beforeAll(async () => {
    summary = await generateTestSummary();
  });

  it('should return the metadata json', async () => {
    expect(summary).toBeDefined();
  });

  it('should return the created date', async () => {
    expect(summary.created).toBeDefined();
  });
});
