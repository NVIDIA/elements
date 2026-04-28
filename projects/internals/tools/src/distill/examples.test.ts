// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { Example } from '@internals/metadata';
import { isContextExample, rankExample, distillExamples } from './examples.js';

describe('isContextExample', () => {
  it('should accept default examples with summaries', () => {
    expect(
      isContextExample({ id: 'project_button-default', summary: 'A button', tags: [], element: 'nve-button' })
    ).toBe(true);
  });

  it('should reject deprecated examples', () => {
    expect(
      isContextExample({
        id: 'project_button-default',
        summary: 'Deprecated',
        tags: [],
        element: 'nve-button',
        deprecated: true
      })
    ).toBe(false);
  });

  it('should reject anti-pattern tagged examples', () => {
    expect(
      isContextExample({ id: 'project_button-default', summary: 'Bad', tags: ['anti-pattern'], element: 'nve-button' })
    ).toBe(false);
  });

  it('should reject performance tagged examples', () => {
    expect(
      isContextExample({ id: 'project_button-default', summary: 'Perf', tags: ['performance'], element: 'nve-button' })
    ).toBe(false);
  });

  it('should reject test-case tagged examples', () => {
    expect(
      isContextExample({ id: 'project_button-default', summary: 'Test', tags: ['test-case'], element: 'nve-button' })
    ).toBe(false);
  });

  it('should reject examples with theme in id', () => {
    expect(isContextExample({ id: 'project_button-theme', summary: 'Theme', tags: [], element: 'nve-button' })).toBe(
      false
    );
  });

  it('should reject examples with internal in id', () => {
    expect(
      isContextExample({ id: 'project_button-internal', summary: 'Internal', tags: [], element: 'nve-button' })
    ).toBe(false);
  });

  it('should reject examples with internal in element', () => {
    expect(
      isContextExample({ id: 'project_button-default', summary: 'Internal', tags: [], element: 'nve-internal-button' })
    ).toBe(false);
  });

  it('should reject examples with responsive in element', () => {
    expect(
      isContextExample({
        id: 'project_button-default',
        summary: 'Responsive',
        tags: [],
        element: 'nve-responsive-grid'
      })
    ).toBe(false);
  });

  it('should reject examples without a summary', () => {
    expect(isContextExample({ id: 'project_button-default', tags: [], element: 'nve-button' })).toBe(false);
  });

  it('should reject examples with empty summary', () => {
    expect(isContextExample({ id: 'project_button-default', summary: '', tags: [], element: 'nve-button' })).toBe(
      false
    );
  });

  it('should accept compositions regardless of id pattern', () => {
    expect(
      isContextExample({
        id: 'project_misc-something',
        summary: 'A composition',
        tags: [],
        element: 'nve-card',
        composition: true
      })
    ).toBe(true);
  });

  it('should accept pattern-tagged examples', () => {
    expect(
      isContextExample({
        id: 'project_misc-something',
        summary: 'A pattern',
        tags: ['pattern'],
        element: 'nve-card'
      })
    ).toBe(true);
  });

  it('should accept examples matching included id patterns', () => {
    const includedPatterns = ['default', 'forms', 'popover', 'page', 'grid', 'invoker'];
    for (const pattern of includedPatterns) {
      expect(
        isContextExample({
          id: `project_button-${pattern}`,
          summary: `${pattern} example`,
          tags: [],
          element: 'nve-button'
        })
      ).toBe(true);
    }
  });

  it('should reject examples not matching any included pattern', () => {
    expect(
      isContextExample({
        id: 'project_button-custom-variant',
        summary: 'Custom variant',
        tags: [],
        element: 'nve-button'
      })
    ).toBe(false);
  });
});

describe('rankExample', () => {
  it('should rank template examples first', () => {
    expect(rankExample({ id: 'template-dashboard' })).toBe(0);
  });

  it('should rank pattern examples second', () => {
    expect(rankExample({ id: 'pattern-form' })).toBe(1);
  });

  it('should rank page examples third', () => {
    expect(rankExample({ id: 'page-header' })).toBe(2);
  });

  it('should rank other examples last', () => {
    expect(rankExample({ id: 'button-default' })).toBe(3);
  });

  it('should strip elements- prefix before ranking', () => {
    expect(rankExample({ id: 'elements-template-foo' })).toBe(0);
    expect(rankExample({ id: 'elements-pattern-form' })).toBe(1);
    expect(rankExample({ id: 'elements-page-header' })).toBe(2);
  });
});

describe('distillExamples', () => {
  const mockExamples: Partial<Example>[] = [
    {
      id: 'project_button-default',
      name: 'Default',
      template: '<nve-button>Click me</nve-button>',
      summary: 'Default button example',
      tags: [],
      element: 'nve-button'
    },
    {
      id: 'project_button-with-icon',
      name: 'WithIcon',
      template: '<nve-button><nve-icon name="star"></nve-icon>Star</nve-button>',
      summary: 'Button with icon example',
      tags: [],
      element: 'nve-button'
    },
    {
      id: 'project_old-deprecated',
      name: 'Deprecated',
      template: '<nve-old-component>Old</nve-old-component>',
      summary: 'This is deprecated',
      tags: [],
      element: 'nve-old-component',
      deprecated: true
    },
    {
      id: 'project_anti-pattern',
      name: 'AntiPattern',
      template: '<div style="color: red;">Bad practice</div>',
      summary: 'This is an anti-pattern',
      tags: ['anti-pattern'],
      element: 'div'
    },
    {
      id: 'project_card-default',
      name: 'Default',
      template:
        '<nve-card><nve-card-header>Header</nve-card-header><nve-card-content>Content</nve-card-content></nve-card>',
      summary: 'Default card example',
      tags: [],
      element: 'nve-card'
    }
  ];

  it('should filter out deprecated and anti-pattern examples', () => {
    const result = distillExamples(mockExamples);
    expect(result).toHaveLength(2);
    expect(result.find(e => e.id === 'project_old-deprecated')).toBeUndefined();
    expect(result.find(e => e.id === 'project_anti-pattern')).toBeUndefined();
  });

  it('should shape results to the expected fields', () => {
    const result = distillExamples(mockExamples);
    expect(result[0]).toEqual({
      id: 'project_button-default',
      name: 'Default',
      element: 'nve-button',
      summary: 'Button example',
      template: '<nve-button>Click me</nve-button>'
    });
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

    const result = distillExamples(unsorted);
    expect(result.map(r => r.id)).toEqual([
      'pattern-auth',
      'pattern-form',
      'page-header',
      'page-layout',
      'alpha-default',
      'zoo-default'
    ]);
  });

  it('should return empty array for empty input', () => {
    expect(distillExamples([])).toEqual([]);
  });

  it('should filter out examples with missing summary', () => {
    const examples: Partial<Example>[] = [
      { id: 'test-default-1', name: 'Test1', tags: [], element: 'nve-test', template: '', summary: 'Has summary' },
      { id: 'test-default-2', name: 'Test2', tags: [], element: 'nve-test', template: '' }
    ];

    const result = distillExamples(examples);
    expect(result).toHaveLength(1);
    expect(result[0].summary).toBe('Has summary');
  });
});
