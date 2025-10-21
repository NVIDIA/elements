import { beforeAll, describe, expect, it } from 'vitest';
import { generateTestSummary } from './tests.utils.js';
import type { ProjectTestSummary } from '../types.js';

describe('TestsUtils', () => {
  let tests: ProjectTestSummary;

  beforeAll(async () => {
    tests = await generateTestSummary();
  });

  it('should return the metadata json', async () => {
    expect(tests).toBeDefined();
  });

  it('should return the created date', async () => {
    expect(tests.created).toBeDefined();
  });
});
