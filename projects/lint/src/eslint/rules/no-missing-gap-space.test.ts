// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import html from '@html-eslint/eslint-plugin';
import noMissingGapSpace from './no-missing-gap-space.js';

const rule = noMissingGapSpace as unknown as JSRuleDefinition;

const SUGGESTED_GAP_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];

function gapSuggestions(layout: string) {
  return SUGGESTED_GAP_SIZES.map(size => ({
    messageId: 'suggest-add-gap',
    data: { size },
    output: `<div nve-layout="${layout} gap:${size}"></div>`
  }));
}

describe('noMissingGapSpace', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      language: 'html/html',
      languageOptions: {
        tolerant: true
      },
      plugins: {
        html
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noMissingGapSpace.meta).toBeDefined();
    expect(noMissingGapSpace.meta.type).toBe('problem');
    expect(noMissingGapSpace.meta.hasSuggestions).toBe(true);
    expect(noMissingGapSpace.meta.docs).toBeDefined();
    expect(noMissingGapSpace.meta.docs.description).toBe('Require gap spacing on row and column layouts.');
    expect(noMissingGapSpace.meta.docs.category).toBe('Best Practice');
    expect(noMissingGapSpace.meta.docs.recommended).toBe(true);
    expect(noMissingGapSpace.meta.docs.url).toContain('/docs/lint/');
    expect(noMissingGapSpace.meta.schema).toBeDefined();
    expect(noMissingGapSpace.meta.messages).toBeDefined();
    expect(noMissingGapSpace.meta.messages['missing-gap-space']).toBe(
      `Layout "{{layout}}" is missing gap spacing. Add a gap value such as "${SUGGESTED_GAP_SIZES.join('", "')}"`
    );
    expect(noMissingGapSpace.meta.messages['suggest-add-gap']).toBe('Add "gap:{{size}}" to the layout');
  });

  it('should allow row and column layouts with gap defined', () => {
    tester.run('should allow row and column layouts with gap defined', rule, {
      valid: [
        '<div nve-layout="row gap:sm"></div>',
        '<div nve-layout="row gap:md"></div>',
        '<div nve-layout="row gap:lg"></div>',
        '<div nve-layout="row gap:xs"></div>',
        '<div nve-layout="row gap:none"></div>',
        '<div nve-layout="column gap:sm"></div>',
        '<div nve-layout="column gap:md"></div>',
        '<div nve-layout="column gap:lg"></div>',
        '<div nve-layout="column gap:xs"></div>',
        '<div nve-layout="column gap:none"></div>',
        '<div nve-layout="row gap:md align:center"></div>',
        '<div nve-layout="column gap:lg pad:md"></div>',
        '<div nve-layout="row full gap:sm"></div>',
        '<div nve-layout="column full gap:md align:top"></div>'
      ],
      invalid: []
    });
  });

  it('should allow layouts with spacing alignment values', () => {
    tester.run('should allow layouts with spacing alignment values', rule, {
      valid: [
        '<div nve-layout="row align:space-between"></div>',
        '<div nve-layout="row align:space-around"></div>',
        '<div nve-layout="row align:space-evenly"></div>',
        '<div nve-layout="column align:space-between"></div>',
        '<div nve-layout="column align:space-around"></div>',
        '<div nve-layout="column align:space-evenly"></div>'
      ],
      invalid: []
    });
  });

  it('should allow non-row/column layouts without gap', () => {
    tester.run('should allow non-row/column layouts without gap', rule, {
      valid: [
        '<div nve-layout="grid"></div>',
        '<div nve-layout="grid gap:md"></div>',
        '<div nve-layout="full"></div>',
        '<div nve-layout="grid span-items:4"></div>'
      ],
      invalid: []
    });
  });

  it('should allow template syntax bindings', () => {
    tester.run('should allow template syntax bindings', rule, {
      valid: [
        '<div nve-layout="${layout}"></div>',
        '<div nve-layout=${layout}></div>',
        '<div nve-layout="{{layout}}"></div>',
        '<div nve-layout="{%layout%}"></div>'
      ],
      invalid: []
    });
  });

  it('should allow elements without nve-layout', () => {
    tester.run('should allow elements without nve-layout', rule, {
      valid: ['<div></div>', '<div class="row"></div>', '<section></section>'],
      invalid: []
    });
  });

  it('should report missing gap on row layout', () => {
    tester.run('should report missing gap on row layout', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-layout="row"></div>',
          errors: [
            {
              messageId: 'missing-gap-space',
              data: { layout: 'row' },
              suggestions: gapSuggestions('row')
            }
          ]
        }
      ]
    });
  });

  it('should report missing gap on column layout', () => {
    tester.run('should report missing gap on column layout', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-layout="column"></div>',
          errors: [
            {
              messageId: 'missing-gap-space',
              data: { layout: 'column' },
              suggestions: gapSuggestions('column')
            }
          ]
        }
      ]
    });
  });

  it('should report missing gap on row layout with other modifiers', () => {
    tester.run('should report missing gap on row layout with modifiers', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-layout="row align:center"></div>',
          errors: [
            {
              messageId: 'missing-gap-space',
              data: { layout: 'row align:center' },
              suggestions: gapSuggestions('row align:center')
            }
          ]
        }
      ]
    });
  });

  it('should report missing gap on column layout with other modifiers', () => {
    tester.run('should report missing gap on column layout with modifiers', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-layout="column full pad:md"></div>',
          errors: [
            {
              messageId: 'missing-gap-space',
              data: { layout: 'column full pad:md' },
              suggestions: gapSuggestions('column full pad:md')
            }
          ]
        }
      ]
    });
  });

  it('should report missing gap on row layout with align:wrap', () => {
    tester.run('should report missing gap on row with align:wrap', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-layout="row align:wrap"></div>',
          errors: [
            {
              messageId: 'missing-gap-space',
              data: { layout: 'row align:wrap' },
              suggestions: gapSuggestions('row align:wrap')
            }
          ]
        }
      ]
    });
  });
});
