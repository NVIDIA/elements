import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noDeprecatedGlobalAttributes from './no-deprecated-global-attributes.js';

const rule = noDeprecatedGlobalAttributes as unknown as JSRuleDefinition;

describe('noDeprecatedGlobalAttributes', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      languageOptions: {
        parser: htmlParser
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noDeprecatedGlobalAttributes.meta).toBeDefined();
    expect(noDeprecatedGlobalAttributes.meta.type).toBe('problem');
    expect(noDeprecatedGlobalAttributes.meta.docs).toBeDefined();
    expect(noDeprecatedGlobalAttributes.meta.docs.description).toBe(
      'Disallow use of deprecated global utility attributes in HTML.'
    );
    expect(noDeprecatedGlobalAttributes.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedGlobalAttributes.meta.docs.recommended).toBe(true);
    expect(noDeprecatedGlobalAttributes.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noDeprecatedGlobalAttributes.meta.schema).toBeDefined();
    expect(noDeprecatedGlobalAttributes.meta.messages).toBeDefined();
    expect(noDeprecatedGlobalAttributes.meta.messages['unexpected-deprecated-global-attribute']).toBe(
      'Unexpected use of deprecated global attribute {{attribute}}. Use {{alternative}} instead.'
    );
  });

  it('should allow valid use of global utility attributes', () => {
    tester.run('should allow valid use of global utility attributes', rule, {
      valid: [`<html nve-theme="light"></html>`, '<div nve-layout="row"></div>', '<p nve-text="body"></p>'],
      invalid: []
    });
  });

  it('should report unexpected use of deprecated global attributes', () => {
    tester.run('unexpected use of deprecated attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<html nve-theme="light"></html>',
          errors: [
            {
              messageId: 'unexpected-deprecated-global-attribute',
              data: { attribute: 'nve-theme', alternative: 'nve-theme', output: '<html nve-theme="light"></html>' }
            }
          ]
        },
        {
          code: '<div nve-layout="row"></div>',
          errors: [
            {
              messageId: 'unexpected-deprecated-global-attribute',
              data: { attribute: 'nve-layout', alternative: 'nve-layout', output: '<div nve-layout="row"></div>' }
            }
          ]
        },
        {
          code: '<p nve-text="body"></p>',
          errors: [
            {
              messageId: 'unexpected-deprecated-global-attribute',
              data: { attribute: 'nve-text', alternative: 'nve-text', output: '<p nve-text="body"></p>' }
            }
          ]
        }
      ]
    });
  });
});
