import { beforeAll, describe, expect, it } from 'vitest';
import { generateTestSummary } from './tests.utils.js';
import type { TestSummary } from '../types.js';

describe('TestsUtils', () => {
  let tests: TestSummary;

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
