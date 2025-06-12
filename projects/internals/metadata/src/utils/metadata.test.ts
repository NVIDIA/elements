import { describe, expect, it } from 'vitest';
import { metadata } from './metadata.js';
import type { MetadataMethod } from './metadata.js';

describe('metadata', () => {
  it('should be defined', () => {
    expect(metadata).toBeDefined();
  });

  it('should add metadata to the method', () => {
    class Test {
      @metadata({ description: 'test' })
      method() {
        return new Promise(resolve => resolve('test'));
      }
    }
    const test = new Test();
    expect((test.method as MetadataMethod<string>).metadata).toBeDefined();
    expect((test.method as MetadataMethod<string>).metadata.description).toBe('test');
    expect((test.method as MetadataMethod<string>).metadata.name).toBe('elements_method');
  });
});
