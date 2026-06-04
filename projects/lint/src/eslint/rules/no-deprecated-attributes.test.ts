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
    expect(noDeprecatedAttributes.meta.messages['unexpected-deprecated-attribute-value-replacement']).toBe(
      'Unexpected use of deprecated value "{{value}}" in attribute "{{attribute}}". Use {{replacement}} instead.'
    );
  });

  it('should allow valid use of attributes', () => {
    tester.run('should allow valid use of attributes', rule, {
      valid: [
        '<nve-badge></nve-badge>',
        '<nve-badge status="success"></nve-badge>',
        `<nve-badge status=${'success'}></nve-badge>`,
        '<nve-button interaction="emphasis"></nve-button>',
        '<nve-button container="flat" interaction="destructive"></nve-button>',
        '<nve-combobox tag-layout="hidden"></nve-combobox>',
        '<nve-combobox tag-layout="wrap"></nve-combobox>',
        '<nve-icon-button interaction="destructive"></nve-icon-button>',
        '<nve-toast status="success"></nve-toast>',
        '<nve-toast prominence="muted"></nve-toast>'
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
          code: '<nve-button interaction="emphasize"></nve-button>',
          output: '<nve-button interaction="emphasis"></nve-button>',
          errors: [
            {
              messageId: 'unexpected-deprecated-attribute-value-replacement',
              data: { attribute: 'interaction', value: 'emphasize', replacement: 'interaction="emphasis"' }
            }
          ]
        },
        {
          code: '<nve-button interaction="inverse"></nve-button>',
          errors: [
            { messageId: 'unexpected-deprecated-attribute', data: { attribute: 'interaction', value: 'inverse' } }
          ]
        },
        {
          code: '<nve-button interaction="flat"></nve-button>',
          output: '<nve-button container="flat"></nve-button>',
          errors: [
            {
              messageId: 'unexpected-deprecated-attribute-value-replacement',
              data: { attribute: 'interaction', value: 'flat', replacement: 'container="flat"' }
            }
          ]
        },
        {
          code: '<nve-button interaction="flat-destructive"></nve-button>',
          output: '<nve-button container="flat" interaction="destructive"></nve-button>',
          errors: [
            {
              messageId: 'unexpected-deprecated-attribute-value-replacement',
              data: {
                attribute: 'interaction',
                value: 'flat-destructive',
                replacement: 'container="flat" interaction="destructive"'
              }
            }
          ]
        },
        {
          code: '<nve-button interaction="flat-emphasis"></nve-button>',
          output: '<nve-button container="flat" interaction="emphasis"></nve-button>',
          errors: [
            {
              messageId: 'unexpected-deprecated-attribute-value-replacement',
              data: {
                attribute: 'interaction',
                value: 'flat-emphasis',
                replacement: 'container="flat" interaction="emphasis"'
              }
            }
          ]
        },
        {
          code: '<nve-icon-button interaction="flat-emphasize"></nve-icon-button>',
          output: '<nve-icon-button container="flat" interaction="emphasis"></nve-icon-button>',
          errors: [
            {
              messageId: 'unexpected-deprecated-attribute-value-replacement',
              data: {
                attribute: 'interaction',
                value: 'flat-emphasize',
                replacement: 'container="flat" interaction="emphasis"'
              }
            }
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
        },
        {
          code: '<nve-toast status="muted"></nve-toast>',
          output: '<nve-toast prominence="muted"></nve-toast>',
          errors: [
            {
              messageId: 'unexpected-deprecated-attribute-value-replacement',
              data: { attribute: 'status', value: 'muted', replacement: 'prominence="muted"' }
            }
          ]
        }
      ]
    });
  });
});
