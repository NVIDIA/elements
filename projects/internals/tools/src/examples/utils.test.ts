import { describe, expect, it } from 'vitest';
import type { Example } from '@nve-internals/metadata';
import { getPublicExamples, searchPublicExamples, renderExampleMarkdown } from './utils.js';
import { wrapText } from '../internal/utils.js';

describe('utils', () => {
  const mockExamples: Example[] = [
    {
      id: 'project-example_button-basic',
      name: 'ButtonBasic',
      template: '<nve-button>Click me</nve-button>',
      summary: 'Basic button example',
      description: '',
      tags: [],
      element: 'nve-button'
    },
    {
      id: 'project-example_button-with-icon',
      name: 'ButtonWithIcon',
      template: '<nve-button><nve-icon name="star"></nve-icon>Star</nve-button>',
      summary: 'Button with icon example',
      description: '',
      tags: [],
      element: 'nve-button'
    },
    {
      id: 'project-example_deprecated-example',
      name: 'DeprecatedExample',
      template: '<nve-old-component>Old</nve-old-component>',
      summary: 'This is deprecated',
      description: '',
      tags: [],
      element: 'nve-old-component',
      deprecated: true
    },
    {
      id: 'project-example_anti-pattern-example',
      name: 'AntiPatternExample',
      template: '<div style="color: red;">Bad practice</div>',
      summary: 'This is an anti-pattern',
      description: '',
      tags: ['anti-pattern'],
      element: 'div'
    },
    {
      id: 'project-example_card-component',
      name: 'CardComponent',
      template: '<nve-card>Content</nve-card>',
      summary: 'Card component example',
      description: '',
      tags: [],
      element: 'nve-card'
    }
  ];

  describe('getAvailableExamples', () => {
    it('should return markdown format correctly', () => {
      const result = getPublicExamples('markdown', mockExamples);
      expect(result).toContain('- **project-example_button-basic**: Basic button example');
      expect(result).toContain('- **project-example_button-with-icon**: Button with icon example');
      expect(result).toContain('Basic button example');
      expect(result).toContain('Button with icon example');
    });

    it('should return JSON format correctly', () => {
      const result = getPublicExamples('json', mockExamples);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      // Array is reversed, so card comes first
      expect(result[0]).toEqual({
        id: 'project-example_card-component',
        name: 'CardComponent',
        element: 'nve-card',
        summary: 'Card component example'
      });
      expect(result[1]).toEqual({
        id: 'project-example_button-with-icon',
        name: 'ButtonWithIcon',
        element: 'nve-button',
        summary: 'Button with icon example'
      });
    });

    it('should handle empty examples array', () => {
      const result = getPublicExamples('markdown', []);
      expect(result).toBe('');

      const jsonResult = getPublicExamples('json', []);
      expect(jsonResult).toEqual([]);
    });

    it('should handle examples with missing summary', () => {
      const examplesWithMissingDesc: Partial<Example>[] = [
        { id: 'test-1', name: 'Test1', tags: [], element: 'nve-test', template: '', summary: 'Has summary' },
        { id: 'test-2', name: 'Test2', tags: [], element: 'nve-test', template: '' } // missing summary
      ];

      // Markdown only includes examples with summaries
      const markdownResult = getPublicExamples('markdown', examplesWithMissingDesc);
      expect(markdownResult).toContain('- **test-1**: Has summary');
      expect(markdownResult).not.toContain('test-2'); // no summary, filtered out

      const jsonResult = getPublicExamples('json', examplesWithMissingDesc) as Array<{
        id: string;
        name: string;
        summary?: string;
      }>;
      // JSON includes all (reversed order)
      expect(jsonResult[0].summary).toBeUndefined(); // Test2 first (reversed)
      expect(jsonResult[1].summary).toBe('Has summary'); // Test1 second
    });
  });

  describe('searchExamples', () => {
    it('should search and return markdown format', async () => {
      const result = await searchPublicExamples('button', { format: 'markdown' });
      expect(typeof result).toBe('string');
      expect(result).toContain('button');
    });

    it('should search and return JSON format', async () => {
      const result = await searchPublicExamples('button', { format: 'json' });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty query', async () => {
      const result = await searchPublicExamples('', { format: 'json' });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should handle query with only noise words', async () => {
      const result = await searchPublicExamples('example examples story stories pattern patterns', { format: 'json' });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('renderExampleMarkdown', () => {
    it('should render complete example correctly', () => {
      const example = {
        id: 'project-example_test-example',
        name: 'TestExample',
        description: 'This is a test description',
        element: 'nve-test',
        template: '<nve-test>Content</nve-test>'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toContain('## Test Example (project-example_test-example)');
      expect(result).toContain('This is a test description');
      expect(result).toContain('```html');
      expect(result).toContain('<nve-test>Content</nve-test>');
    });

    it('should handle example without element', () => {
      const example = {
        id: 'project-example_test-example',
        name: 'TestExample',
        description: 'This is a test description',
        template: '<div>Content</div>'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toContain('## Test Example (project-example_test-example)');
      expect(result).not.toContain(' - ');
    });

    it('should handle example without description', () => {
      const example = {
        id: 'project-example_test-example',
        name: 'TestExample',
        element: 'nve-test',
        template: '<nve-test>Content</nve-test>'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toContain('## Test Example (project-example_test-example)');
      expect(result).not.toContain('This is a test description');
      expect(result).toContain('```html');
    });

    it('should handle example without template', () => {
      const example = {
        id: 'project-example_test-example',
        name: 'TestExample',
        description: 'This is a test description',
        element: 'nve-test'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toContain('## Test Example (project-example_test-example)');
      expect(result).toContain('This is a test description');
      expect(result).not.toContain('```html');
    });

    it('should handle example with only name', () => {
      const example = {
        id: 'project-example_test-example',
        name: 'TestExample'
      };

      const result = renderExampleMarkdown(example);
      expect(result).toBe('## Test Example (project-example_test-example)');
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
