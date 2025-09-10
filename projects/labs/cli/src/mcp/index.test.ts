import { describe, expect, it, beforeEach } from 'vitest';

describe('MCP server environment setup', () => {
  beforeEach(() => {
    delete process.env.ELEMENTS_ENV;
  });

  it('should set ELEMENTS_ENV to "mcp" when module is imported', async () => {
    expect(process.env.ELEMENTS_ENV).toBeUndefined();
    await import('./index.js');
    expect(process.env.ELEMENTS_ENV).toBe('mcp');
  });
});
