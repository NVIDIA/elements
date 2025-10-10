import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import html from '@html-eslint/eslint-plugin';
import noUnexpectedSlotValue from './no-unexpected-slot-value.js';

const rule = noUnexpectedSlotValue as unknown as JSRuleDefinition;

describe('noUnexpectedSlotValue', () => {
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
    expect(noUnexpectedSlotValue.meta).toBeDefined();
    expect(noUnexpectedSlotValue.meta.type).toBe('problem');
    expect(noUnexpectedSlotValue.meta.docs).toBeDefined();
    expect(noUnexpectedSlotValue.meta.docs.description).toBe('Disallow use of invalid slot values in HTML.');
    expect(noUnexpectedSlotValue.meta.docs.category).toBe('Best Practice');
    expect(noUnexpectedSlotValue.meta.docs.recommended).toBe(true);
    expect(noUnexpectedSlotValue.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noUnexpectedSlotValue.meta.schema).toBeDefined();
    expect(noUnexpectedSlotValue.meta.messages).toBeDefined();
    expect(noUnexpectedSlotValue.meta.messages['unexpected-slot-value']).toBe(
      'Unexpected slot "{{slotName}}" on "{{tagName}}" for element "{{parentTagName}}"'
    );
  });

  it('should allow valid use of slot values', () => {
    tester.run('should allow valid use of slot values', rule, {
      valid: [
        '<nve-page><div slot="left"></div></nve-page>',
        '<nve-badge><div slot="prefix-icon"></div></nve-badge>',
        '<nvd-component><div slot="content"></div></nvd-component>'
      ],
      invalid: []
    });
  });

  it('should recommend replacing unexpected slot values', () => {
    tester.run('should recommend replacing unexpected slot values', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-badge><nve-icon slot="icon"></nve-icon></nve-badge>',
          errors: [
            {
              messageId: 'unexpected-slot-value',
              data: { slotName: 'icon', tagName: 'nve-icon', parentTagName: 'nve-badge' },
              suggestions: [
                {
                  messageId: 'suggest-replace-slot-value',
                  data: { slotName: 'icon', alternative: 'prefix-icon' },
                  output: '<nve-badge><nve-icon slot="prefix-icon"></nve-icon></nve-badge>'
                }
              ]
            }
          ]
        }
      ]
    });
  });

  it('should recommend removing unexpected slot values', () => {
    tester.run('should recommend removing unexpected slot values', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-page><div slot="invalid"></div></nve-page>',
          errors: [
            {
              messageId: 'unexpected-slot-value',
              data: { slotName: 'invalid', tagName: 'div', parentTagName: 'nve-page' },
              suggestions: [
                {
                  messageId: 'suggest-remove-slot-value',
                  data: { slotName: 'invalid', alternative: '' },
                  output: '<nve-page><div ></div></nve-page>'
                }
              ]
            }
          ]
        },
        {
          code: '<nve-page><div slot="default"></div></nve-page>',
          errors: [
            {
              messageId: 'unexpected-slot-value',
              data: { slotName: 'default', tagName: 'div', parentTagName: 'nve-page' },
              suggestions: [
                {
                  messageId: 'suggest-remove-slot-value',
                  data: { slotName: 'default', alternative: '' },
                  output: '<nve-page><div ></div></nve-page>'
                }
              ]
            }
          ]
        }
      ]
    });
  });
});
