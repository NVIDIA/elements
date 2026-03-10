import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noDeprecatedPopoverAttributes from './no-deprecated-popover-attributes.js';

const rule = noDeprecatedPopoverAttributes as unknown as JSRuleDefinition;

describe('noDeprecatedPopoverAttributes', () => {
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
    expect(noDeprecatedPopoverAttributes.meta).toBeDefined();
    expect(noDeprecatedPopoverAttributes.meta.type).toBe('problem');
    expect(noDeprecatedPopoverAttributes.meta.docs).toBeDefined();
    expect(noDeprecatedPopoverAttributes.meta.docs.description).toBe('Disallow use of deprecated popover attributes.');
    expect(noDeprecatedPopoverAttributes.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedPopoverAttributes.meta.docs.recommended).toBe(true);
    expect(noDeprecatedPopoverAttributes.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noDeprecatedPopoverAttributes.meta.schema).toBeDefined();
    expect(noDeprecatedPopoverAttributes.meta.messages).toBeDefined();
    expect(noDeprecatedPopoverAttributes.meta.messages['unexpected-deprecated-popover-attribute']).toBe(
      'Unexpected use of deprecated popover attribute {{attribute}}. Use native HTML popover API instead.'
    );
  });

  it('should allow valid use of popover related attributes', () => {
    tester.run('unexpected use of deprecated attribute', rule, {
      valid: ['<div></div>', '<nve-dialog></nve-dialog>', '<ui-dialog trigger behavior-trigger></ui-dialog>'],
      invalid: []
    });
  });

  it('should report unexpected use of deprecated popover attributes', () => {
    tester.run('unexpected use of deprecated attribute', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-dialog trigger></nve-dialog>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'trigger' } }]
        },
        {
          code: '<nve-dialog behavior-trigger></nve-dialog>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'behavior-trigger' } }]
        },
        {
          code: '<nve-tooltip trigger></nve-tooltip>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'trigger' } }]
        },
        {
          code: '<nve-tooltip behavior-trigger></nve-tooltip>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'behavior-trigger' } }]
        },
        {
          code: '<nve-toast trigger></nve-toast>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'trigger' } }]
        },
        {
          code: '<nve-toast behavior-trigger></nve-toast>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'behavior-trigger' } }]
        },
        {
          code: '<nve-drawer trigger></nve-drawer>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'trigger' } }]
        },
        {
          code: '<nve-drawer behavior-trigger></nve-drawer>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'behavior-trigger' } }]
        },
        {
          code: '<nve-dropdown trigger></nve-dropdown>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'trigger' } }]
        },
        {
          code: '<nve-dropdown behavior-trigger></nve-dropdown>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'behavior-trigger' } }]
        },
        {
          code: '<nve-notification trigger></nve-notification>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'trigger' } }]
        },
        {
          code: '<nve-notification behavior-trigger></nve-notification>',
          errors: [{ messageId: 'unexpected-deprecated-popover-attribute', data: { attribute: 'behavior-trigger' } }]
        }
      ]
    });
  });
});
