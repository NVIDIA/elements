import { describe, expect, it } from 'vitest';
import { TestsService } from './tests.service.js';

describe('TestsService', () => {
  it('should be defined', () => {
    expect(TestsService.getData).toBeDefined();
  });
});
