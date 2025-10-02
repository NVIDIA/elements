import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import html from '@html-eslint/eslint-plugin';
import noUnexpectedStyleCustomization from './no-unexpected-style-customization.js';

const rule = noUnexpectedStyleCustomization as unknown as JSRuleDefinition;

describe('noUnexpectedStyleCustomization', () => {
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
    expect(noUnexpectedStyleCustomization.meta).toBeDefined();
    expect(noUnexpectedStyleCustomization.meta.type).toBe('problem');
    expect(noUnexpectedStyleCustomization.meta.docs).toBeDefined();
    expect(noUnexpectedStyleCustomization.meta.docs.description).toBe(
      'Disallow use of style customization in Elements playground template.'
    );
    expect(noUnexpectedStyleCustomization.meta.docs.category).toBe('Best Practice');
    expect(noUnexpectedStyleCustomization.meta.docs.recommended).toBe(true);
    expect(noUnexpectedStyleCustomization.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noUnexpectedStyleCustomization.meta.schema).toBeDefined();
    expect(noUnexpectedStyleCustomization.meta.messages).toBeDefined();
  });

  it('should allow valid use of non style attributes', () => {
    tester.run('should allow valid use of non style attributes', rule, {
      valid: ['<button disabled></button>', '<nve-badge status="success"></nve-badge>'],
      invalid: []
    });
  });

  it('should not allow invalid use of style attribute', () => {
    tester.run('should not allow invalid use of style attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<div><style>:root { color: red; }</style></div>',
          errors: [{ messageId: 'unexpected-style-tag-customization' }]
        },
        {
          code: '<div style="color: red;"></div>',
          errors: [{ messageId: 'unexpected-style-attribute-customization' }]
        },
        {
          code: '<nve-badge style="color: red;"></nve-badge>',
          errors: [{ messageId: 'unexpected-style-attribute-customization' }]
        }
      ]
    });
  });
});
