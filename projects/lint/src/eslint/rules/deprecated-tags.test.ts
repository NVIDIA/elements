import { describe, it, expect } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import deprecatedTags from './deprecated-tags.js';

describe('deprecatedTags', () => {
  it('should define rule metadata', () => {
    expect(deprecatedTags.meta).toBeDefined();
    expect(deprecatedTags.meta.type).toBe('problem');
    expect(deprecatedTags.meta.docs).toBeDefined();
    expect(deprecatedTags.meta.docs.description).toBe('Disallow use of deprecated elements in HTML.');
    expect(deprecatedTags.meta.docs.category).toBe('Best Practice');
    expect(deprecatedTags.meta.docs.recommended).toBe(true);
    expect(deprecatedTags.meta.docs.url).toBe('https://NVIDIA.github.io/elements/docs/lint/');
    expect(deprecatedTags.meta.schema).toBeDefined();
    expect(deprecatedTags.meta.messages).toBeDefined();
    expect(deprecatedTags.meta.messages.unexpected).toBe('Unexpected use of deprecated tag <{{tag}}>');
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

    tester.run('unexpected use of deprecated tag', deprecatedTags as unknown as JSRuleDefinition, {
      valid: ['<div></div>', '<p></p>', '<nve-button></nve-button>', '<nve-badge></nve-badge>'],
      invalid: [
        {
          code: '<nve-app-header></nve-app-header>',
          errors: [{ messageId: 'unexpected', data: { tag: 'nve-app-header' } }]
        },
        {
          code: '<nve-alert-banner></nve-alert-banner>',
          errors: [{ messageId: 'unexpected', data: { tag: 'nve-alert-banner' } }]
        },
        {
          code: '<nve-json-view></nve-json-view>',
          errors: [{ messageId: 'unexpected', data: { tag: 'nve-json-view' } }]
        }
      ]
    });
  });
});
