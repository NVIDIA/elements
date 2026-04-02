// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { Example } from '@internals/metadata';
import { getPublicExamples, searchPublicExamples, renderExampleMarkdown, condenseTemplate } from './utils.js';
import { wrapText } from '../internal/utils.js';

describe('utils', () => {
  const mockExamples: Example[] = [
    {
      id: 'project_button-default',
      name: 'Default',
      template: '<nve-button>Click me</nve-button>',
      summary: 'Default button example',
      description: '',
      composition: false,
      tags: [],
      element: 'nve-button'
    },
    {
      id: 'project_button-with-icon',
      name: 'WithIcon',
      template: '<nve-button><nve-icon name="star"></nve-icon>Star</nve-button>',
      summary: 'Button with icon example',
      description: '',
      composition: false,
      tags: [],
      element: 'nve-button'
    },
    {
      id: 'project_old-deprecated',
      name: 'Deprecated',
      template: '<nve-old-component>Old</nve-old-component>',
      summary: 'This is deprecated',
      description: '',
      composition: false,
      tags: [],
      element: 'nve-old-component',
      deprecated: true
    },
    {
      id: 'project_anti-pattern',
      name: 'AntiPattern',
      template: '<div style="color: red;">Bad practice</div>',
      summary: 'This is an anti-pattern',
      description: '',
      composition: false,
      tags: ['anti-pattern'],
      element: 'div'
    },
    {
      id: 'project_card-default',
      name: 'Default',
      template:
        '<nve-card><nve-card-header>Header</nve-card-header><nve-card-content>Content</nve-card-content></nve-card>',
      summary: 'Default card example',
      description: '',
      composition: false,
      tags: [],
      element: 'nve-card'
    }
  ];

  describe('getAvailableExamples', () => {
    it('should return markdown format correctly', () => {
      const result = getPublicExamples('markdown', mockExamples);
      expect(result).toContain('`project_button-default`: Default button example');
      expect(result).toContain('`project_card-default`: Default card example');
    });

    it('should return JSON format correctly', () => {
      const result = getPublicExamples('json', mockExamples);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'project_button-default',
        name: 'Default',
        element: 'nve-button',
        summary: 'Default button example',
        template: '<nve-button>Click me</nve-button>'
      });
      expect(result[1]).toEqual({
        id: 'project_card-default',
        name: 'Default',
        element: 'nve-card',
        summary: 'Default card example',
        template:
          '<nve-card><nve-card-header>Header</nve-card-header><nve-card-content>Content</nve-card-content></nve-card>'
      });
    });

    it('should handle empty examples array', () => {
      const result = getPublicExamples('markdown', []);
      expect(result).toBe('');

      const jsonResult = getPublicExamples('json', []);
      expect(jsonResult).toEqual([]);
    });

    it('should sort pattern IDs first, then page IDs, then alphabetically', () => {
      const unsorted: Partial<Example>[] = [
        { id: 'zoo-default', name: 'Zoo', tags: [], element: 'nve-zoo', template: '', summary: 'Zoo' },
        { id: 'page-layout', name: 'PageLayout', tags: [], element: 'nve-page', template: '', summary: 'Page layout' },
        { id: 'alpha-default', name: 'Alpha', tags: [], element: 'nve-alpha', template: '', summary: 'Alpha' },
        {
          id: 'pattern-form',
          name: 'PatternForm',
          tags: ['pattern'],
          element: 'nve-form',
          template: '',
          summary: 'Form pattern'
        },
        { id: 'page-header', name: 'PageHeader', tags: [], element: 'nve-page', template: '', summary: 'Page header' },
        {
          id: 'pattern-auth',
          name: 'PatternAuth',
          tags: ['pattern'],
          element: 'nve-auth',
          template: '',
          summary: 'Auth pattern'
        }
      ];

      const result = getPublicExamples('json', unsorted) as Array<{ id: string }>;
      expect(result.map(r => r.id)).toEqual([
        'pattern-auth',
        'pattern-form',
        'page-header',
        'page-layout',
        'alpha-default',
        'zoo-default'
      ]);
    });

    it('should handle examples with missing summary', () => {
      const examplesWithMissingDesc: Partial<Example>[] = [
        { id: 'test-default-1', name: 'Test1', tags: [], element: 'nve-test', template: '', summary: 'Has summary' },
        { id: 'test-default-2', name: 'Test2', tags: [], element: 'nve-test', template: '' } // missing summary
      ];

      const markdownResult = getPublicExamples('markdown', examplesWithMissingDesc);
      expect(markdownResult).toContain('`test-default-1`: Has summary');
      expect(markdownResult).not.toContain('test-default-2');

      const jsonResult = getPublicExamples('json', examplesWithMissingDesc) as Array<{
        id: string;
        name: string;
        summary?: string;
      }>;
      expect(jsonResult[0].summary).toBe('Has summary');
      expect(jsonResult[1]).toBe(undefined);
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

  describe('condenseTemplate', () => {
    it('should return empty/falsy templates unchanged', () => {
      expect(condenseTemplate('')).toBe('');
      expect(condenseTemplate(undefined as unknown as string)).toBe(undefined);
    });

    it('should not condense when elements are within maxRepeat', () => {
      const template = [
        '<nve-grid-row>',
        '  <nve-grid-cell>cell 0</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-grid-row>',
        '  <nve-grid-cell>cell 1</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-grid-row>',
        '  <nve-grid-cell>cell 2</nve-grid-cell>',
        '</nve-grid-row>'
      ].join('\n');

      expect(condenseTemplate(template, 3)).toBe(template);
    });

    it('should condense repeated single-line sibling elements', () => {
      const template = [
        '<nve-grid-column>col 0</nve-grid-column>',
        '<nve-grid-column>col 1</nve-grid-column>',
        '<nve-grid-column>col 2</nve-grid-column>',
        '<nve-grid-column>col 3</nve-grid-column>',
        '<nve-grid-column>col 4</nve-grid-column>'
      ].join('\n');

      const result = condenseTemplate(template, 3);
      expect(result).toBe(
        [
          '<nve-grid-column>col 0</nve-grid-column>',
          '<nve-grid-column>col 1</nve-grid-column>',
          '<nve-grid-column>col 2</nve-grid-column>',
          '<!-- ... 2 more <nve-grid-column> elements ... -->'
        ].join('\n')
      );
    });

    it('should condense repeated multi-line sibling elements', () => {
      const template = [
        '<nve-grid-row>',
        '  <nve-grid-cell>cell 0</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-grid-row>',
        '  <nve-grid-cell>cell 1</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-grid-row>',
        '  <nve-grid-cell>cell 2</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-grid-row>',
        '  <nve-grid-cell>cell 3</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-grid-row>',
        '  <nve-grid-cell>cell 4</nve-grid-cell>',
        '</nve-grid-row>'
      ].join('\n');

      const result = condenseTemplate(template, 3);
      expect(result).toBe(
        [
          '<nve-grid-row>',
          '  <nve-grid-cell>cell 0</nve-grid-cell>',
          '</nve-grid-row>',
          '<nve-grid-row>',
          '  <nve-grid-cell>cell 1</nve-grid-cell>',
          '</nve-grid-row>',
          '<nve-grid-row>',
          '  <nve-grid-cell>cell 2</nve-grid-cell>',
          '</nve-grid-row>',
          '<!-- ... 2 more <nve-grid-row> elements ... -->'
        ].join('\n')
      );
    });

    it('should recursively condense children of kept elements', () => {
      const template = [
        '<nve-grid-row>',
        '  <nve-grid-cell>cell 0-0</nve-grid-cell>',
        '  <nve-grid-cell>cell 0-1</nve-grid-cell>',
        '  <nve-grid-cell>cell 0-2</nve-grid-cell>',
        '  <nve-grid-cell>cell 0-3</nve-grid-cell>',
        '  <nve-grid-cell>cell 0-4</nve-grid-cell>',
        '</nve-grid-row>'
      ].join('\n');

      const result = condenseTemplate(template, 3);
      expect(result).toBe(
        [
          '<nve-grid-row>',
          '  <nve-grid-cell>cell 0-0</nve-grid-cell>',
          '  <nve-grid-cell>cell 0-1</nve-grid-cell>',
          '  <nve-grid-cell>cell 0-2</nve-grid-cell>',
          '  <!-- ... 2 more <nve-grid-cell> elements ... -->',
          '</nve-grid-row>'
        ].join('\n')
      );
    });

    it('should condense a full grid with rows and cells', () => {
      const rows = Array.from({ length: 10 }, (_, r) =>
        [
          '  <nve-grid-row>',
          ...Array.from({ length: 5 }, (_, c) => `    <nve-grid-cell>cell ${r}-${c}</nve-grid-cell>`),
          '  </nve-grid-row>'
        ].join('\n')
      );

      const template = ['<nve-grid>', '  <nve-grid-header>', '  </nve-grid-header>', ...rows, '</nve-grid>'].join('\n');

      const result = condenseTemplate(template, 3);

      const lines = result.split('\n');
      expect(lines).toContain('  <!-- ... 7 more <nve-grid-row> elements ... -->');
      expect(lines).toContain('    <!-- ... 2 more <nve-grid-cell> elements ... -->');
      expect(result).not.toContain('cell 3-');
      expect(result).not.toContain('cell 9-');
    });

    it('should condense repeated card elements', () => {
      const cards = Array.from(
        { length: 8 },
        (_, i) =>
          `  <nve-card>
    <h3>Card ${i}</h3>
    <p>Content ${i}</p>
  </nve-card>`
      );

      const template = ['<div nve-layout="grid">', ...cards, '</div>'].join('\n');
      const result = condenseTemplate(template, 3);

      expect(result).toContain('<nve-card>');
      expect(result).toContain('<!-- ... 5 more <nve-card> elements ... -->');
      expect(result).not.toContain('Card 3');
      expect(result).not.toContain('Card 7');
    });

    it('should preserve non-repeated elements around condensed groups', () => {
      const template = [
        '<nve-toolbar>toolbar</nve-toolbar>',
        '<nve-grid-row>',
        '  <nve-grid-cell>0</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-grid-row>',
        '  <nve-grid-cell>1</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-grid-row>',
        '  <nve-grid-cell>2</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-grid-row>',
        '  <nve-grid-cell>3</nve-grid-cell>',
        '</nve-grid-row>',
        '<nve-pagination></nve-pagination>'
      ].join('\n');

      const result = condenseTemplate(template, 3);
      expect(result).toContain('<nve-toolbar>toolbar</nve-toolbar>');
      expect(result).toContain('<!-- ... 1 more <nve-grid-row> elements ... -->');
      expect(result).toContain('<nve-pagination></nve-pagination>');
    });

    it('should handle self-closing tags', () => {
      const template = [
        '<br />',
        '<img src="a.png" />',
        '<img src="b.png" />',
        '<img src="c.png" />',
        '<img src="d.png" />',
        '<img src="e.png" />'
      ].join('\n');

      const result = condenseTemplate(template, 3);
      expect(result).toContain('<!-- ... 2 more <img> elements ... -->');
    });

    it('should handle void elements without closing tags', () => {
      const template = ['<input type="text">', '<input type="email">', '<input type="tel">', '<input type="url">'].join(
        '\n'
      );

      const result = condenseTemplate(template, 3);
      expect(result).toContain('<!-- ... 1 more <input> elements ... -->');
    });

    it('should respect custom maxRepeat parameter', () => {
      const template = [
        '<li>Item 1</li>',
        '<li>Item 2</li>',
        '<li>Item 3</li>',
        '<li>Item 4</li>',
        '<li>Item 5</li>'
      ].join('\n');

      const result1 = condenseTemplate(template, 1);
      expect(result1).toContain('<!-- ... 4 more <li> elements ... -->');

      const result2 = condenseTemplate(template, 5);
      expect(result2).toBe(template);
    });

    it('should not condense different tag types as siblings', () => {
      const template = [
        '<nve-button>Button</nve-button>',
        '<nve-icon>icon</nve-icon>',
        '<nve-badge>badge</nve-badge>',
        '<nve-alert>alert</nve-alert>'
      ].join('\n');

      expect(condenseTemplate(template, 3)).toBe(template);
    });

    it('should handle nested elements of the same tag name', () => {
      const template = [
        '<div>',
        '  <div>',
        '    <div>nested</div>',
        '  </div>',
        '</div>',
        '<div>',
        '  <div>sibling</div>',
        '</div>',
        '<div>',
        '  <div>sibling 2</div>',
        '</div>',
        '<div>',
        '  <div>sibling 3</div>',
        '</div>'
      ].join('\n');

      const result = condenseTemplate(template, 3);
      expect(result).toContain('<!-- ... 1 more <div> elements ... -->');
      expect(result).toContain('nested');
      expect(result).toContain('sibling');
    });

    it('should condense renderExampleMarkdown templates', () => {
      const example = {
        id: 'elements-grid_default',
        name: 'Default',
        summary: 'Basic data grid',
        template: Array.from(
          { length: 10 },
          (_, r) => `<nve-grid-row>\n  <nve-grid-cell>cell ${r}</nve-grid-cell>\n</nve-grid-row>`
        ).join('\n')
      };

      const result = renderExampleMarkdown(example);
      expect(result).toContain('```html');
      expect(result).toContain('<!-- ... 7 more <nve-grid-row> elements ... -->');
      expect(result).not.toContain('cell 3');
    });
  });
});
