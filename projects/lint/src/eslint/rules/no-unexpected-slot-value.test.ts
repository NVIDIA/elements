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
    expect(noUnexpectedSlotValue.meta.docs.url).toContain('/docs/lint/');
    expect(noUnexpectedSlotValue.meta.schema).toBeDefined();
    expect(noUnexpectedSlotValue.meta.messages).toBeDefined();
    expect(noUnexpectedSlotValue.meta.messages['unexpected-slot-value']).toBe(
      'Unexpected slot "{{slotName}}" on "{{tagName}}" for element "{{parentTagName}}"'
    );
    expect(noUnexpectedSlotValue.meta.messages['no-default-slot']).toBe(
      'Element <{{tagName}}> does not have a default slot. Remove the child content or use a named slot if available.'
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

  it('should report text content in elements without a default slot', () => {
    tester.run('text content without default slot', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-sort-button>Node ID</nve-sort-button>',
          errors: [{ messageId: 'no-default-slot', data: { tagName: 'nve-sort-button' } }]
        }
      ]
    });
  });

  it('should report unslotted child elements in elements without a default slot', () => {
    tester.run('unslotted child elements without default slot', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-sort-button><span>Node ID</span></nve-sort-button>',
          errors: [{ messageId: 'no-default-slot', data: { tagName: 'nve-sort-button' } }]
        }
      ]
    });
  });

  it('should allow content in elements with a default slot', () => {
    tester.run('content in elements with default slot', rule, {
      valid: [
        '<nve-card>Content</nve-card>',
        '<nve-card><div>Content</div></nve-card>',
        '<nve-badge>Badge Text</nve-badge>'
      ],
      invalid: []
    });
  });

  it('should allow empty elements without a default slot', () => {
    tester.run('empty elements without default slot', rule, {
      valid: ['<nve-sort-button></nve-sort-button>'],
      invalid: []
    });
  });

  it('should allow whitespace-only content in elements without a default slot', () => {
    tester.run('whitespace-only content without default slot', rule, {
      valid: ['<nve-sort-button>   </nve-sort-button>', '<nve-sort-button>\n</nve-sort-button>'],
      invalid: []
    });
  });

  it('should skip elements with template syntax', () => {
    tester.run('template syntax in elements without default slot', rule, {
      valid: [
        '<nve-sort-button>${label}</nve-sort-button>',
        '<nve-sort-button>{{label}}</nve-sort-button>',
        '<nve-sort-button>{% label %}</nve-sort-button>'
      ],
      invalid: []
    });
  });

  it('should ignore non-nve elements', () => {
    tester.run('non-nve elements', rule, {
      valid: [
        '<custom-button>Content</custom-button>',
        '<div>Content</div>',
        '<my-element><span>Text</span></my-element>'
      ],
      invalid: []
    });
  });

  it('should not report no-default-slot for children assigned to named slots', () => {
    tester.run('named slots on children', rule, {
      valid: [
        // nve-badge has named slots (prefix-icon, suffix-icon) and a default slot
        // children with slot attributes go to their named slot, not the default slot
        '<nve-badge><nve-icon slot="prefix-icon"></nve-icon></nve-badge>'
      ],
      invalid: []
    });
  });
});
