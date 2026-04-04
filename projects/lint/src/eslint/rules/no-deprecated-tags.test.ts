// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noDeprecatedTags from './no-deprecated-tags.js';

describe('noDeprecatedTags', () => {
  it('should define rule metadata', () => {
    expect(noDeprecatedTags.meta).toBeDefined();
    expect(noDeprecatedTags.meta.type).toBe('problem');
    expect(noDeprecatedTags.meta.docs).toBeDefined();
    expect(noDeprecatedTags.meta.docs.description).toBe('Disallow use of deprecated elements in HTML.');
    expect(noDeprecatedTags.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedTags.meta.docs.recommended).toBe(true);
    expect(noDeprecatedTags.meta.docs.url).toContain('/docs/lint/');
    expect(noDeprecatedTags.meta.schema).toBeDefined();
    expect(noDeprecatedTags.meta.messages).toBeDefined();
    expect(noDeprecatedTags.meta.messages['unexpected-deprecated-tag']).toBe(
      'Unexpected use of deprecated tag <{{tag}}>. Use <{{replacement}}> instead.'
    );
  });

  it('should report unexpected use of deprecated tag', () => {
    const tester = new RuleTester({
      languageOptions: {
        parser: htmlParser,
        parserOptions: {
          frontmatter: true
        }
      }
    });

    tester.run('unexpected use of deprecated tag', noDeprecatedTags as unknown as JSRuleDefinition, {
      valid: ['<div></div>', '<p></p>', '<nve-button></nve-button>', '<nve-badge></nve-badge>'],
      invalid: [
        {
          code: '<nve-app-header></nve-app-header>',
          errors: [
            { messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-app-header', replacement: 'nve-page-header' } }
          ]
        },
        {
          code: '<nve-alert-banner></nve-alert-banner>',
          errors: [
            {
              messageId: 'unexpected-deprecated-tag',
              data: { tag: 'nve-alert-banner', replacement: 'nve-alert-group' }
            }
          ]
        },
        {
          code: '<nve-json-view></nve-json-view>',
          errors: [
            { messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-json-view', replacement: 'nve-monaco-editor' } }
          ]
        }
      ]
    });
  });

  it('should report unexpected use of deprecated v0 mlv-* tags', () => {
    const tester = new RuleTester({
      languageOptions: {
        parser: htmlParser,
        parserOptions: {
          frontmatter: true
        }
      }
    });

    tester.run('unexpected use of deprecated v0 tag', noDeprecatedTags as unknown as JSRuleDefinition, {
      valid: [],
      invalid: [
        {
          code: '<mlv-button></mlv-button>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'mlv-button', replacement: 'nve-button' } }]
        },
        {
          code: '<mlv-input></mlv-input>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'mlv-input', replacement: 'nve-input' } }]
        },
        {
          code: '<mlv-dialog></mlv-dialog>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'mlv-dialog', replacement: 'nve-dialog' } }]
        },
        {
          code: '<mlv-grid></mlv-grid>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'mlv-grid', replacement: 'nve-grid' } }]
        },
        {
          code: '<mlv-tabs></mlv-tabs>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'mlv-tabs', replacement: 'nve-tabs' } }]
        },
        {
          code: '<mlv-accordion></mlv-accordion>',
          errors: [
            { messageId: 'unexpected-deprecated-tag', data: { tag: 'mlv-accordion', replacement: 'nve-accordion' } }
          ]
        },
        {
          code: '<mlv-menu></mlv-menu>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'mlv-menu', replacement: 'nve-menu' } }]
        },
        {
          code: '<mlv-tooltip></mlv-tooltip>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'mlv-tooltip', replacement: 'nve-tooltip' } }]
        }
      ]
    });
  });
});
