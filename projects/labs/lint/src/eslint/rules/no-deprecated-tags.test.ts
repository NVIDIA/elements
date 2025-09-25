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
      'Unexpected use of deprecated tag <{{tag}}>'
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
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-app-header' } }]
        },
        {
          code: '<nve-alert-banner></nve-alert-banner>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-alert-banner' } }]
        },
        {
          code: '<nve-json-view></nve-json-view>',
          errors: [{ messageId: 'unexpected-deprecated-tag', data: { tag: 'nve-json-view' } }]
        }
      ]
    });
  });
});
