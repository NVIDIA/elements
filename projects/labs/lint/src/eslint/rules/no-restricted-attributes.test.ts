import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noRestrictedAttributes from './no-restricted-attributes.js';

const rule = noRestrictedAttributes as unknown as JSRuleDefinition;

describe('noRestrictedAttributes', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      languageOptions: {
        parser: htmlParser
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noRestrictedAttributes.meta).toBeDefined();
    expect(noRestrictedAttributes.meta.type).toBe('problem');
    expect(noRestrictedAttributes.meta.docs).toBeDefined();
    expect(noRestrictedAttributes.meta.docs.description).toBe(
      'Disallow use of utility attributes on custom HTML element tags.'
    );
    expect(noRestrictedAttributes.meta.docs.category).toBe('Best Practice');
    expect(noRestrictedAttributes.meta.docs.recommended).toBe(true);
    expect(noRestrictedAttributes.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noRestrictedAttributes.meta.schema).toBeDefined();
    expect(noRestrictedAttributes.meta.messages).toBeDefined();
    expect(noRestrictedAttributes.meta.messages['no-restricted-attributes']).toBe(
      'Unexpected use of restricted attribute {{attribute}} on custom HTML element.'
    );
  });

  it('should allow valid use of global utility attributes', () => {
    tester.run('should allow valid use of global utility attributes', rule, {
      valid: ['<div nve-layout="row"></div>', '<p nve-text="body"></p>'],
      invalid: []
    });
  });

  it('should report unexpected use of restricted global attributes', () => {
    tester.run('unexpected use of restricted attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-button nve-layout="pad:md"></nve-button>',
          errors: [{ messageId: 'no-restricted-attributes', data: { attribute: 'nve-layout' } }]
        },
        {
          code: '<nve-card nve-layout="column"></nve-card>',
          errors: [{ messageId: 'no-restricted-attributes', data: { attribute: 'nve-layout' } }]
        }
      ]
    });
  });

  it('should allow external box-model attribute layout values', () => {
    tester.run('should allow external box-model attribute layout values', rule, {
      valid: [
        '<nve-button nve-layout="span:6"></nve-button>',
        '<nve-card nve-layout="full"></nve-card>',
        '<nve-card nve-layout="full span:6"></nve-card>'
      ],
      invalid: []
    });
  });
});
