import { describe, expect, it } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { TokensService } from './service.js';

describe('TokensService', () => {
  it('should provide list tool', async () => {
    const result = await TokensService.list();
    expect(result).toBeDefined();
    expect(result).toContain('## CSS Variables');
    expect((TokensService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((TokensService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((TokensService.list as ToolMethod<unknown>).metadata.description).toBe(
      'Get available semantic CSS variables / design tokens for theming.'
    );
  });
});
