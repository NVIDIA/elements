import { describe, expect, it } from 'vitest';
import { TestsService } from './tests.service.js';

describe('TestsService', () => {
  it('should return the tests json', async () => {
    const tests = await TestsService.getTests();
    expect(tests).toBeDefined();
    expect(tests.created).toBeDefined();
  });
});
