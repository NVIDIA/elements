import { describe, expect, it } from 'vitest';
import { tool } from './tools.js';
import type { ToolMethod } from './tools.js';

describe('metadata', () => {
  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  it('should add metadata to the method', () => {
    class Test {
      @tool({ description: 'test' })
      method() {
        return new Promise(resolve => resolve('test'));
      }
    }

    const test = new Test();
    expect((test.method as ToolMethod<string>).metadata).toBeDefined();
    expect((test.method as ToolMethod<string>).metadata.description).toBe('test');
    expect((test.method as ToolMethod<string>).metadata.name).toBe('method');
    expect((test.method as ToolMethod<string>).metadata.command).toBe('method');
  });
});
