// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noDeprecatedAttributeValue, { DEPRECATED_ATTRIBUTE_VALUES } from './no-deprecated-global-attribute-value.js';
import noDeprecatedGlobalAttributeValue from './no-deprecated-global-attribute-value.js';

const rule = noDeprecatedGlobalAttributeValue as unknown as JSRuleDefinition;

const MIGRATE_PROMPT_DEPRECATIONS: { attribute: string; before: string; after: string }[] = [
  { attribute: 'nve-text', before: 'eyebrow', after: 'label sm' },
  { attribute: 'nve-layout', before: 'grow', after: 'full' }
];

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

  it('should define rule metadata', () => {
    expect(noDeprecatedAttributeValue.meta).toBeDefined();
    expect(noDeprecatedAttributeValue.meta.type).toBe('problem');
    expect(noDeprecatedAttributeValue.meta.fixable).toBe('code');
    expect(noDeprecatedAttributeValue.meta.hasSuggestions).toBe(true);
    expect(noDeprecatedAttributeValue.meta.docs.recommended).toBe(true);
    expect(noDeprecatedAttributeValue.meta.docs.url).toContain('/docs/lint/');
  });

  it('should cover every deprecation documented in the migrate prompt', () => {
    MIGRATE_PROMPT_DEPRECATIONS.forEach(({ attribute, before, after }) => {
      expect(DEPRECATED_ATTRIBUTE_VALUES[attribute]?.[before]).toBe(after);
    });
  });

  it('should allow non-deprecated values', () => {
    tester.run('non-deprecated values', rule, {
      valid: [
        '<div nve-text="body"></div>',
        '<div nve-text="label sm"></div>',
        '<div nve-layout="row"></div>',
        '<div nve-layout="full"></div>',
        '<div></div>'
      ],
      invalid: []
    });
  });

  it('should ignore template binding expressions', () => {
    tester.run('template binding expressions', rule, {
      valid: [
        '<div nve-text="${value}"></div>',
        '<div nve-text="{{ value }}"></div>',
        '<div nve-layout="{value}"></div>'
      ],
      invalid: []
    });
  });

  it('should report and auto-fix every migrate-prompt deprecation', () => {
    tester.run('migrate prompt deprecations', rule, {
      valid: [],
      invalid: MIGRATE_PROMPT_DEPRECATIONS.map(({ attribute, before, after }) => ({
        code: `<div ${attribute}="${before}"></div>`,
        output: `<div ${attribute}="${after}"></div>`,
        errors: [
          {
            messageId: 'unexpected-deprecated-global-attribute-value',
            data: { attribute, value: before, alternative: after },
            suggestions: [
              {
                messageId: 'suggest-replace-deprecated-global-attribute-value',
                data: { value: before, alternative: after },
                output: `<div ${attribute}="${after}"></div>`
              }
            ]
          }
        ]
      }))
    });
  });

  it('should rewrite deprecated tokens within a multi-token value', () => {
    tester.run('multi-token replacement', rule, {
      valid: [],
      invalid: [
        {
          code: '<div nve-layout="grow column"></div>',
          output: '<div nve-layout="full column"></div>',
          errors: [
            {
              messageId: 'unexpected-deprecated-global-attribute-value',
              data: { attribute: 'nve-layout', value: 'grow column', alternative: 'full column' },
              suggestions: [
                {
                  messageId: 'suggest-replace-deprecated-global-attribute-value',
                  data: { value: 'grow column', alternative: 'full column' },
                  output: '<div nve-layout="full column"></div>'
                }
              ]
            }
          ]
        }
      ]
    });
  });
});
