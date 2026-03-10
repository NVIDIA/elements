import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import html from '@html-eslint/eslint-plugin';
import noRestrictedPageSizing from './no-restricted-page-sizing.js';

const rule = noRestrictedPageSizing as unknown as JSRuleDefinition;

describe('noRestrictedPageSizing', () => {
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
    expect(noRestrictedPageSizing.meta).toBeDefined();
    expect(noRestrictedPageSizing.meta.type).toBe('problem');
    expect(noRestrictedPageSizing.meta.docs).toBeDefined();
    expect(noRestrictedPageSizing.meta.docs.description).toBe('Disallow custom height or width styles on nve-page.');
    expect(noRestrictedPageSizing.meta.docs.category).toBe('Best Practice');
    expect(noRestrictedPageSizing.meta.docs.recommended).toBe(true);
    expect(noRestrictedPageSizing.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noRestrictedPageSizing.meta.schema).toBeDefined();
    expect(noRestrictedPageSizing.meta.messages).toBeDefined();
  });

  it('should allow nve-page without style attribute', () => {
    tester.run('should allow nve-page without style attribute', rule, {
      valid: ['<nve-page></nve-page>', '<nve-page document-scroll></nve-page>'],
      invalid: []
    });
  });

  it('should allow nve-page with non-sizing styles', () => {
    tester.run('should allow nve-page with non-sizing styles', rule, {
      valid: [
        '<nve-page style="--padding: 16px"></nve-page>',
        '<nve-page style="--background: red"></nve-page>',
        '<nve-page style="display: block"></nve-page>'
      ],
      invalid: []
    });
  });

  it('should allow sizing styles on other elements', () => {
    tester.run('should allow sizing styles on other elements', rule, {
      valid: [
        '<div style="height: 100px"></div>',
        '<div style="width: 800px"></div>',
        '<nve-badge style="height: 24px"></nve-badge>'
      ],
      invalid: []
    });
  });

  it('should not allow height style on nve-page', () => {
    tester.run('should not allow height style on nve-page', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-page style="height: 100vh"></nve-page>',
          errors: [{ messageId: 'no-restricted-page-sizing' }]
        },
        {
          code: '<nve-page style="height: 500px"></nve-page>',
          errors: [{ messageId: 'no-restricted-page-sizing' }]
        }
      ]
    });
  });

  it('should not allow width style on nve-page', () => {
    tester.run('should not allow width style on nve-page', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-page style="width: 800px"></nve-page>',
          errors: [{ messageId: 'no-restricted-page-sizing' }]
        },
        {
          code: '<nve-page style="width: 100%"></nve-page>',
          errors: [{ messageId: 'no-restricted-page-sizing' }]
        }
      ]
    });
  });

  it('should not allow min/max sizing styles on nve-page', () => {
    tester.run('should not allow min/max sizing styles on nve-page', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-page style="min-height: 500px"></nve-page>',
          errors: [{ messageId: 'no-restricted-page-sizing' }]
        },
        {
          code: '<nve-page style="max-height: 900px"></nve-page>',
          errors: [{ messageId: 'no-restricted-page-sizing' }]
        },
        {
          code: '<nve-page style="min-width: 320px"></nve-page>',
          errors: [{ messageId: 'no-restricted-page-sizing' }]
        },
        {
          code: '<nve-page style="max-width: 1200px"></nve-page>',
          errors: [{ messageId: 'no-restricted-page-sizing' }]
        }
      ]
    });
  });

  it('should report multiple sizing properties in one style attribute', () => {
    tester.run('should report multiple sizing properties in one style attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-page style="height: 100vh; width: 800px"></nve-page>',
          errors: [{ messageId: 'no-restricted-page-sizing' }, { messageId: 'no-restricted-page-sizing' }]
        }
      ]
    });
  });
});
