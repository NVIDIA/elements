// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noDeprecatedAttributes from './no-deprecated-attributes.js';

const rule = noDeprecatedAttributes as unknown as JSRuleDefinition;

describe('noDeprecatedAttributes', () => {
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
    expect(noDeprecatedAttributes.meta).toBeDefined();
    expect(noDeprecatedAttributes.meta.type).toBe('problem');
    expect(noDeprecatedAttributes.meta.docs).toBeDefined();
    expect(noDeprecatedAttributes.meta.docs.description).toBe('Disallow use of deprecated attributes in HTML.');
    expect(noDeprecatedAttributes.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedAttributes.meta.docs.recommended).toBe(true);
    expect(noDeprecatedAttributes.meta.docs.url).toContain('/docs/lint/');
    expect(noDeprecatedAttributes.meta.schema).toBeDefined();
    expect(noDeprecatedAttributes.meta.messages).toBeDefined();
    expect(noDeprecatedAttributes.meta.messages['unexpected-deprecated-attribute']).toBe(
      'Unexpected use of deprecated value "{{value}}" in attribute "{{attribute}}"'
    );
    expect(noDeprecatedAttributes.meta.messages['unexpected-deprecated-attribute-replacement']).toBe(
      'Unexpected use of deprecated attribute "{{attribute}}". Use {{replacement}} instead.'
    );
  });

  it('should allow valid use of attributes', () => {
    tester.run('should allow valid use of attributes', rule, {
      valid: [
        '<nve-badge></nve-badge>',
        '<nve-badge status="success"></nve-badge>',
        `<nve-badge status=${'success'}></nve-badge>`,
        '<nve-combobox tag-layout="hidden"></nve-combobox>',
        '<nve-combobox tag-layout="wrap"></nve-combobox>'
      ],
      invalid: []
    });
  });

  it('should report unexpected use of deprecated attributes', () => {
    tester.run('unexpected use of deprecated attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-badge status="trend-up"></nve-badge>  ',
          errors: [{ messageId: 'unexpected-deprecated-attribute', data: { attribute: 'status', value: 'trend-up' } }]
        },
        {
          code: '<nve-badge status="trend-down"></nve-badge>',
          errors: [{ messageId: 'unexpected-deprecated-attribute', data: { attribute: 'status', value: 'trend-down' } }]
        },
        {
          code: '<nve-badge status="trend-neutral"></nve-badge>',
          errors: [
            { messageId: 'unexpected-deprecated-attribute', data: { attribute: 'status', value: 'trend-neutral' } }
          ]
        },
        {
          code: '<nve-combobox notags></nve-combobox>',
          output: '<nve-combobox tag-layout="hidden"></nve-combobox>',
          errors: [
            {
              messageId: 'unexpected-deprecated-attribute-replacement',
              data: { attribute: 'notags', replacement: 'tag-layout="hidden"' }
            }
          ]
        },
        {
          code: '<nve-combobox notags="true"></nve-combobox>',
          output: '<nve-combobox tag-layout="hidden"></nve-combobox>',
          errors: [
            {
              messageId: 'unexpected-deprecated-attribute-replacement',
              data: { attribute: 'notags', replacement: 'tag-layout="hidden"' }
            }
          ]
        }
      ]
    });
  });
});
