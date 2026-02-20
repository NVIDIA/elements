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
    expect(noDeprecatedTags.meta.docs.url).toBe('https://NVIDIA.github.io/elements/docs/lint/');
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

  it('should report unexpected use of deprecated v0 nve-* tags', () => {
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
          code: '<nve-button></nve-button>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-button', replacement: 'nve-button' } }]
        },
        {
          code: '<nve-input></nve-input>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-input', replacement: 'nve-input' } }]
        },
        {
          code: '<nve-dialog></nve-dialog>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-dialog', replacement: 'nve-dialog' } }]
        },
        {
          code: '<nve-grid></nve-grid>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-grid', replacement: 'nve-grid' } }]
        },
        {
          code: '<nve-tabs></nve-tabs>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-tabs', replacement: 'nve-tabs' } }]
        },
        {
          code: '<nve-accordion></nve-accordion>',
          errors: [
            { messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-accordion', replacement: 'nve-accordion' } }
          ]
        },
        {
          code: '<nve-menu></nve-menu>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-menu', replacement: 'nve-menu' } }]
        },
        {
          code: '<nve-tooltip></nve-tooltip>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-tooltip', replacement: 'nve-tooltip' } }]
        }
      ]
    });
  });
});
