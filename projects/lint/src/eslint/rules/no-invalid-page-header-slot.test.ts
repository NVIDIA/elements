// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { elementsHtmlConfig } from '../configs/html.js';
import noInvalidPageHeaderSlot from './no-invalid-page-header-slot.js';

const rule = noInvalidPageHeaderSlot as unknown as JSRuleDefinition;

describe('noInvalidPageHeaderSlot', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      languageOptions: {
        parser: htmlParser,
        parserOptions: {
          frontmatter: true
        }
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noInvalidPageHeaderSlot.meta.type).toBe('problem');
    expect(noInvalidPageHeaderSlot.meta.fixable).toBe('code');
    expect(noInvalidPageHeaderSlot.meta.docs.description).toBe(
      'Require direct nve-page-header children of nve-page to use slot="header".'
    );
    expect(noInvalidPageHeaderSlot.meta.docs.category).toBe('Best Practice');
    expect(noInvalidPageHeaderSlot.meta.docs.recommended).toBe(true);
    expect(noInvalidPageHeaderSlot.meta.docs.url).toContain('/docs/lint/');
    expect(noInvalidPageHeaderSlot.meta.schema).toEqual([]);
    expect(noInvalidPageHeaderSlot.meta.messages['invalid-page-header-slot']).toBe(
      '<nve-page-header> must use slot="header" when it is a direct child of <nve-page>.'
    );
  });

  it('should register the rule as a recommended error', () => {
    const plugin = elementsHtmlConfig.plugins?.['@nvidia-elements/lint'];

    expect(plugin?.rules?.['no-invalid-page-header-slot']).toBe(noInvalidPageHeaderSlot);
    expect(elementsHtmlConfig.rules?.['@nvidia-elements/lint/no-invalid-page-header-slot']).toEqual(['error']);
  });

  it('should allow valid, indirect, and dynamic page headers', () => {
    tester.run('valid page-header placement', rule, {
      valid: [
        '<nve-page><nve-page-header slot="header"></nve-page-header></nve-page>',
        '<nve-page-header></nve-page-header>',
        '<nve-card><nve-page-header slot="subheader"></nve-page-header></nve-card>',
        '<nve-page><div><nve-page-header slot="subheader"></nve-page-header></div></nve-page>',
        '<nve-page><nve-page-header slot=${slotName}></nve-page-header></nve-page>',
        '<nve-page><nve-page-header .slot=${slotName}></nve-page-header></nve-page>',
        '<nve-page><nve-page-header [slot]="slotName"></nve-page-header></nve-page>',
        '<nve-page><nve-page-header :slot="slotName"></nve-page-header></nve-page>'
      ],
      invalid: []
    });
  });

  it('should fix missing and incorrect static slots on direct children', () => {
    tester.run('invalid direct page-header slots', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-page><nve-page-header></nve-page-header></nve-page>',
          output: '<nve-page><nve-page-header slot="header"></nve-page-header></nve-page>',
          errors: [{ messageId: 'invalid-page-header-slot' }]
        },
        {
          code: '<nve-page><nve-page-header slot="subheader"></nve-page-header></nve-page>',
          output: '<nve-page><nve-page-header slot="header"></nve-page-header></nve-page>',
          errors: [{ messageId: 'invalid-page-header-slot' }]
        },
        {
          code: "<nve-page><nve-page-header slot='left'></nve-page-header></nve-page>",
          output: "<nve-page><nve-page-header slot='header'></nve-page-header></nve-page>",
          errors: [{ messageId: 'invalid-page-header-slot' }]
        },
        {
          code: '<nve-page><nve-page-header slot=""></nve-page-header></nve-page>',
          output: '<nve-page><nve-page-header slot="header"></nve-page-header></nve-page>',
          errors: [{ messageId: 'invalid-page-header-slot' }]
        },
        {
          code: '<nve-page><nve-page-header slot></nve-page-header></nve-page>',
          output: '<nve-page><nve-page-header slot="header"></nve-page-header></nve-page>',
          errors: [{ messageId: 'invalid-page-header-slot' }]
        }
      ]
    });
  });
});
