// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { DEPRECATED_ATTRIBUTE_VALUES } from './no-deprecated-global-attribute-value.js';
import noDeprecatedGlobalAttributeValue from './no-deprecated-global-attribute-value.js';

const rule = noDeprecatedGlobalAttributeValue as unknown as JSRuleDefinition;

describe('noDeprecatedGlobalAttributeValue', () => {
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

  afterEach(() => {
    delete DEPRECATED_ATTRIBUTE_VALUES['nve-text'];
  });

  it('should define rule metadata', () => {
    expect(noDeprecatedGlobalAttributeValue.meta).toBeDefined();
    expect(noDeprecatedGlobalAttributeValue.meta.type).toBe('problem');
    expect(noDeprecatedGlobalAttributeValue.meta.fixable).toBe('code');
    expect(noDeprecatedGlobalAttributeValue.meta.hasSuggestions).toBe(true);
    expect(noDeprecatedGlobalAttributeValue.meta.docs.recommended).toBe(true);
    expect(noDeprecatedGlobalAttributeValue.meta.docs.url).toContain('/docs/lint/');
  });

  it('should not retain removed utility value deprecations', () => {
    expect(DEPRECATED_ATTRIBUTE_VALUES).toEqual({});
  });

  it('should not own removed utility values', () => {
    tester.run('removed utility values', rule, {
      valid: [
        '<div nve-text="body"></div>',
        '<div nve-text="label sm"></div>',
        '<div nve-text="eyebrow"></div>',
        '<div nve-layout="row"></div>',
        '<div nve-layout="full"></div>',
        '<div nve-layout="grow"></div>',
        '<div></div>'
      ],
      invalid: []
    });
  });

  it('should ignore template binding expressions', () => {
    DEPRECATED_ATTRIBUTE_VALUES['nve-text'] = {
      eyebrow: 'label sm'
    };

    tester.run('template binding expressions', rule, {
      valid: [
        '<div nve-text="${value}"></div>',
        '<div nve-text="{{ value }}"></div>',
        '<div nve-layout="{value}"></div>'
      ],
      invalid: []
    });
  });

  it('should report and fix deprecated utility values when configured', () => {
    DEPRECATED_ATTRIBUTE_VALUES['nve-text'] = {
      default: 'body',
      eyebrow: 'label sm',
      subtitle: 'body sm'
    };

    tester.run('deprecated utility values', rule, {
      valid: ['<div></div>', '<div nve-layout="row"></div>', '<p nve-text="body"></p>', '<p nve-text></p>'],
      invalid: [
        {
          code: '<p nve-text="default"></p>',
          output: '<p nve-text="body"></p>',
          errors: [
            {
              messageId: 'unexpected-deprecated-global-attribute-value',
              data: { attribute: 'nve-text', value: 'default', alternative: 'body' },
              suggestions: [
                {
                  messageId: 'suggest-replace-deprecated-global-attribute-value',
                  data: { value: 'default', alternative: 'body' },
                  output: '<p nve-text="body"></p>'
                }
              ]
            }
          ]
        },
        {
          code: '<p nve-text="eyebrow muted default subtitle"></p>',
          output: '<p nve-text="label sm muted body"></p>',
          errors: [
            {
              messageId: 'unexpected-deprecated-global-attribute-value',
              data: {
                attribute: 'nve-text',
                value: 'eyebrow muted default subtitle',
                alternative: 'label sm muted body'
              },
              suggestions: [
                {
                  messageId: 'suggest-replace-deprecated-global-attribute-value',
                  data: { value: 'eyebrow muted default subtitle', alternative: 'label sm muted body' },
                  output: '<p nve-text="label sm muted body"></p>'
                }
              ]
            }
          ]
        }
      ]
    });
  });
});
