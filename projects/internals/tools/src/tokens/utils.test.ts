import { describe, expect, it } from 'vitest';
import type { Token } from '@nve-internals/metadata';
import { getSemanticTokens } from './utils.js';

describe('getSemanticTokens', () => {
  const createToken = (name: string, value: string = '#000', description: string = ''): Token => ({
    name,
    value,
    description
  });

  describe('filtering', () => {
    it('should filter out nve-config- tokens', () => {
      const tokens = [createToken('nve-config-test'), createToken('sys-color-primary')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('nve-config-'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-color tokens', () => {
      const tokens = [createToken('ref-color-blue'), createToken('sys-color-primary')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-color'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-scale tokens', () => {
      const tokens = [createToken('ref-scale-100'), createToken('sys-spacing-md')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-scale'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-opacity tokens', () => {
      const tokens = [createToken('ref-opacity-50'), createToken('sys-opacity-md')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-opacity'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-outline tokens', () => {
      const tokens = [createToken('ref-outline-width'), createToken('sys-outline-default')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-outline'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-font-family- tokens', () => {
      const tokens = [createToken('ref-font-family-mono'), createToken('sys-font-body')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-font-family-'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out sys-color-scheme tokens', () => {
      const tokens = [createToken('sys-color-scheme-dark'), createToken('sys-color-primary')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('sys-color-scheme'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out sys-contrast tokens', () => {
      const tokens = [createToken('sys-contrast-high'), createToken('sys-color-primary')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('sys-contrast'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out line-height tokens', () => {
      const tokens = [createToken('sys-line-height-lg'), createToken('sys-font-size-lg')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('line-height'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ratio tokens', () => {
      const tokens = [createToken('sys-ratio-wide'), createToken('sys-spacing-md')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ratio'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out -xxx tokens', () => {
      const tokens = [createToken('sys-size-xxxl'), createToken('sys-size-lg')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('-xxx'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out -xx tokens', () => {
      const tokens = [createToken('sys-size-xxl'), createToken('sys-size-lg')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('-xx'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should keep valid semantic tokens', () => {
      const tokens = [createToken('sys-color-primary'), createToken('sys-spacing-md'), createToken('sys-font-size-lg')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result).toHaveLength(3);
    });
  });

  describe('sorting', () => {
    it('should sort tokens alphabetically by name', () => {
      const tokens = [createToken('sys-z-index'), createToken('sys-alpha'), createToken('sys-medium')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result[0].name).toBe('sys-alpha');
      expect(result[1].name).toBe('sys-medium');
      expect(result[2].name).toBe('sys-z-index');
    });
  });

  describe('markdown format', () => {
    it('should return markdown table with header', () => {
      const tokens = [createToken('sys-color-primary', '#007bff')];
      const result = getSemanticTokens('markdown', tokens);
      expect(result).toContain('## CSS Variables');
      expect(result).toContain('Available semantic design tokens for theming.');
      expect(result).toContain('| name     | value |');
      expect(result).toContain('| -------- | ----- |');
    });

    it('should include token name and value in markdown rows', () => {
      const tokens = [createToken('sys-color-primary', '#007bff'), createToken('sys-spacing-md', '16px')];
      const result = getSemanticTokens('markdown', tokens);
      expect(result).toContain('| sys-color-primary | #007bff |');
      expect(result).toContain('| sys-spacing-md | 16px |');
    });

    it('should return markdown with empty table when all tokens filtered', () => {
      const tokens = [createToken('nve-config-test')];
      const result = getSemanticTokens('markdown', tokens);
      expect(result).toContain('## CSS Variables');
      expect(result).not.toContain('nve-config-test');
    });
  });

  describe('json format', () => {
    it('should return array of filtered tokens', () => {
      const tokens = [createToken('sys-color-primary', '#007bff'), createToken('nve-config-test', 'value')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'sys-color-primary', value: '#007bff', description: '' });
    });

    it('should return empty array when all tokens are filtered', () => {
      const tokens = [createToken('nve-config-test'), createToken('ref-color-blue')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty token array', () => {
      const result = getSemanticTokens('json', []) as Token[];
      expect(result).toEqual([]);
    });

    it('should handle empty token array for markdown', () => {
      const result = getSemanticTokens('markdown', []);
      expect(result).toContain('## CSS Variables');
    });

    it('should return undefined for invalid format', () => {
      const tokens = [createToken('sys-color-primary')];
      // @ts-expect-error - testing invalid format
      const result = getSemanticTokens('invalid', tokens);
      expect(result).toBeUndefined();
    });
  });
});
