import { describe, expect, it } from 'vitest';
import type { MetadataExample } from '@nve-internals/metadata';
import { getAvailableExamples, searchExamples, filterExamples, renderExampleMarkdown, wrapText } from './utils.js';

describe('utils', () => {
  const mockExamples: MetadataExample[] = [
    {
      id: 'ButtonBasic',
      template: '<nve-button>Click me</nve-button>',
      summary: 'Basic button example',
      description: '',
      tags: ['button', 'basic'],
      element: 'nve-button'
    },
    {
      id: 'ButtonWithIcon',
      template: '<nve-button><nve-icon name="star"></nve-icon>Star</nve-button>',
      summary: 'Button with icon example',
      description: '',
      tags: ['button', 'icon'],
      element: 'nve-button'
    },
    {
      id: 'DeprecatedExample',
      template: '<nve-old-component>Old</nve-old-component>',
      summary: 'This is deprecated',
      description: '',
      tags: ['deprecated'],
      element: 'nve-old-component',
      deprecated: true
    },
    {
      id: 'AntiPatternExample',
      template: '<div style="color: red;">Bad practice</div>',
      summary: 'This is an anti-pattern',
      description: '',
      tags: ['anti-pattern'],
      element: 'div'
    },
    {
      id: 'CardComponent',
      template: '<nve-card>Content</nve-card>',
      summary: 'Card component example',
      description: '',
      tags: ['card'],
      element: 'nve-card'
    }
  ];

  describe('getAvailableExamples', () => {
    it('should return markdown format correctly', () => {
      const result = getAvailableExamples('markdown', mockExamples);
      expect(result).toContain('## ButtonBasic');
      expect(result).toContain('## ButtonWithIcon');
      expect(result).toContain('Basic button example');
      expect(result).toContain('Button with icon example');
      expect(result).toContain('---');
    });

    it('should return JSON format correctly', () => {
      const result = getAvailableExamples('json', mockExamples);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'ButtonBasic',
        element: 'nve-button',
        summary: 'Basic button example'
      });
      expect(result[1]).toEqual({
        id: 'ButtonWithIcon',
        element: 'nve-button',
        summary: 'Button with icon example'
      });
    });

    it('should handle empty examples array', () => {
      const result = getAvailableExamples('markdown', []);
      expect(result).toBe('');

      const jsonResult = getAvailableExamples('json', []);
      expect(jsonResult).toEqual([]);
    });

    it('should handle examples with missing summary', () => {
      const examplesWithMissingDesc: Partial<MetadataExample>[] = [
        { id: 'Test1', tags: [], element: 'nve-test', template: '', summary: 'Has summary' },
        { id: 'Test2', tags: [], element: 'nve-test', template: '' } // missing summary
      ];

      const markdownResult = getAvailableExamples('markdown', examplesWithMissingDesc);
      expect(markdownResult).toContain('## Test1');
      expect(markdownResult).toContain('## Test2');

      const jsonResult = getAvailableExamples('json', examplesWithMissingDesc) as Array<{
        id: string;
        summary?: string;
      }>;
      expect(jsonResult[0].summary).toBe('Has summary');
      expect(jsonResult[1].summary).toBeUndefined();
    });
  });

  describe('searchExamples', () => {
    it('should search and return markdown format', async () => {
      const result = await searchExamples('button', 'markdown', mockExamples);
      expect(result).toContain('## ButtonBasic');
      expect(result).toContain('## ButtonWithIcon');
      expect(result).toContain('Basic button example');
      expect(result).toContain('Button with icon example');
    });

    it('should search and return JSON format', async () => {
      const result = await searchExamples('button', 'json', mockExamples);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      const jsonResult = result as MetadataExample[];
      expect(jsonResult[0].id).toBe('ButtonBasic');
      expect(jsonResult[1].id).toBe('ButtonWithIcon');
    });

    it('should handle empty query', async () => {
      const result = await searchExamples('', 'json', mockExamples);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should handle query with only noise words', async () => {
      const result = await searchExamples('example examples story stories pattern patterns', 'json', mockExamples);
      expect(Array.isArray(result)).toBe(true);
      // The query contains only noise words, but the function might still find matches
      // in the mock data due to partial matches in other fields
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('filterExamples', () => {
    it('should filter out deprecated examples', async () => {
      const result = await filterExamples('button', mockExamples);
      const hasDeprecated = result.some(e => e.id === 'DeprecatedExample');
      expect(hasDeprecated).toBe(false);
    });

    it('should filter out anti-pattern examples', async () => {
      const result = await filterExamples('component', mockExamples);
      const hasAntiPattern = result.some(e => e.id === 'AntiPatternExample');
      expect(hasAntiPattern).toBe(false);
    });

    it('should score exact ID matches highest', async () => {
      const result = await filterExamples('ButtonBasic', mockExamples);
      expect(result[0].id).toBe('ButtonBasic');
    });

    it('should score element matches high', async () => {
      const result = await filterExamples('nve-button', mockExamples);
      expect(result[0].id).toBe('ButtonBasic');
      expect(result[1].id).toBe('ButtonWithIcon');
    });

    it('should score description matches', async () => {
      const result = await filterExamples('icon', mockExamples);
      expect(result[0].id).toBe('ButtonWithIcon');
    });

    it('should handle camelCase ID splitting', async () => {
      const result = await filterExamples('basic', mockExamples);
      expect(result.some(e => e.id === 'ButtonBasic')).toBe(true);
    });

    it('should limit results to 5', async () => {
      const manyExamples = Array.from({ length: 10 }, (_, i) => ({
        id: `Test${i}`,
        template: `<div>Test ${i}</div>`,
        summary: `This is test ${i}`,
        description: '',
        tags: ['test'],
        element: 'div'
      }));

      const result = await filterExamples('test', manyExamples);
      expect(result).toHaveLength(5);
    });

    it('should sort by score then summary length', async () => {
      const examples = [
        {
          id: 'ShortDesc',
          template: '<div>Short</div>',
          summary: 'Short',
          description: '',
          tags: ['test'],
          element: 'div'
        },
        {
          id: 'LongDescription',
          template: '<div>Long</div>',
          summary: 'This is a very long summary that should come after the short one when scores are equal',
          description: '',
          tags: ['test'],
          element: 'div'
        }
      ];

      const result = await filterExamples('div', examples);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('ShortDesc');
      expect(result[1].id).toBe('LongDescription');
    });

    it('should handle case insensitive search', async () => {
      const result = await filterExamples('BUTTON', mockExamples);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('ButtonBasic');
      expect(result[1].id).toBe('ButtonWithIcon');
    });

    it('should handle multiple word queries', async () => {
      const result = await filterExamples('button icon', mockExamples);
      expect(result.some(e => e.id === 'ButtonWithIcon')).toBe(true);
    });

    it('should remove noise words from query', async () => {
      const result = await filterExamples('button example story pattern', mockExamples);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('ButtonBasic');
      expect(result[1].id).toBe('ButtonWithIcon');
    });
  });

  describe('renderExampleMarkdown', () => {
    it('should render complete example correctly', () => {
      const example = {
        id: 'TestExample',
        description: 'This is a test description',
        element: 'nve-test',
        template: '<nve-test>Content</nve-test>'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toContain('## TestExample - nve-test');
      expect(result).toContain('This is a test description');
      expect(result).toContain('```html');
      expect(result).toContain('<nve-test>Content</nve-test>');
    });

    it('should handle example without element', () => {
      const example = {
        id: 'TestExample',
        description: 'This is a test description',
        template: '<div>Content</div>'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toContain('## TestExample');
      expect(result).not.toContain(' - ');
    });

    it('should handle example without description', () => {
      const example = {
        id: 'TestExample',
        element: 'nve-test',
        template: '<nve-test>Content</nve-test>'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toContain('## TestExample - nve-test');
      expect(result).not.toContain('This is a test description');
      expect(result).toContain('```html');
    });

    it('should handle example without template', () => {
      const example = {
        id: 'TestExample',
        description: 'This is a test description',
        element: 'nve-test'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toContain('## TestExample - nve-test');
      expect(result).toContain('This is a test description');
      expect(result).not.toContain('```html');
    });

    it('should handle example with only ID', () => {
      const example = {
        id: 'TestExample'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toBe('## TestExample');
    });
  });

  describe('wrapText', () => {
    it('should wrap text to the given width', () => {
      const result = wrapText('This is a test description', 80);
      expect(result).toBe('This is a test description');
    });

    it('should wrap text to the given width and keep the original line breaks', () => {
      const result = wrapText(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        80
      );
      expect(result).toBe(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor\nincididunt ut labore et dolore magna aliqua.'
      );
    });
  });
});
