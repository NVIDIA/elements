import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noInvalidInvokerTriggers from './no-invalid-invoker-triggers.js';

const rule = noInvalidInvokerTriggers as unknown as JSRuleDefinition;

const validElements =
  'nve-button, nve-icon-button, nve-menu-item, nve-sort-button, nve-tabs-item, nve-tag, nve-steps-item, nve-copy-button';

describe('noInvalidInvokerTriggers', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      languageOptions: {
        parser: htmlParser
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noInvalidInvokerTriggers.meta).toBeDefined();
    expect(noInvalidInvokerTriggers.meta.type).toBe('problem');
    expect(noInvalidInvokerTriggers.meta.docs).toBeDefined();
    expect(noInvalidInvokerTriggers.meta.docs.description).toBe(
      'Disallow use of invoker trigger attributes on non-button nve-* elements.'
    );
    expect(noInvalidInvokerTriggers.meta.docs.category).toBe('Best Practice');
    expect(noInvalidInvokerTriggers.meta.docs.recommended).toBe(true);
    expect(noInvalidInvokerTriggers.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noInvalidInvokerTriggers.meta.schema).toEqual([]);
    expect(noInvalidInvokerTriggers.meta.messages).toBeDefined();
    expect(noInvalidInvokerTriggers.meta.messages['no-invalid-invoker-triggers']).toBe(
      'Unexpected use of "{{attribute}}" on <{{element}}>. Invoker attributes are only valid on button-type elements: {{validElements}}.'
    );
  });

  it('should allow popovertarget on valid button-type elements', () => {
    tester.run('popovertarget on button-type elements', rule, {
      valid: [
        '<nve-button popovertarget="my-popover">Open</nve-button>',
        '<nve-icon-button popovertarget="my-popover"></nve-icon-button>',
        '<nve-menu-item popovertarget="my-popover">Item</nve-menu-item>',
        '<nve-sort-button popovertarget="my-popover">Sort</nve-sort-button>',
        '<nve-tabs-item popovertarget="my-popover">Tab</nve-tabs-item>',
        '<nve-tag popovertarget="my-popover">Tag</nve-tag>',
        '<nve-steps-item popovertarget="my-popover">Step</nve-steps-item>',
        '<nve-copy-button popovertarget="my-popover"></nve-copy-button>'
      ],
      invalid: []
    });
  });

  it('should allow commandfor on valid button-type elements', () => {
    tester.run('commandfor on button-type elements', rule, {
      valid: [
        '<nve-button commandfor="my-panel">Toggle</nve-button>',
        '<nve-icon-button commandfor="my-panel"></nve-icon-button>',
        '<nve-tag commandfor="my-panel">Tag</nve-tag>'
      ],
      invalid: []
    });
  });

  it('should allow interestfor on valid button-type elements', () => {
    tester.run('interestfor on button-type elements', rule, {
      valid: [
        '<nve-button interestfor="my-tooltip">Hover</nve-button>',
        '<nve-icon-button interestfor="my-tooltip"></nve-icon-button>'
      ],
      invalid: []
    });
  });

  it('should ignore non-nve elements', () => {
    tester.run('ignore non-nve elements', rule, {
      valid: [
        '<button popovertarget="my-popover">Open</button>',
        '<div popovertarget="my-popover">Div</div>',
        '<custom-element commandfor="my-panel">Custom</custom-element>',
        '<my-button interestfor="my-tooltip">Button</my-button>'
      ],
      invalid: []
    });
  });

  it('should ignore nve elements without invoker attributes', () => {
    tester.run('ignore elements without invoker attributes', rule, {
      valid: [
        '<nve-badge status="success">Badge</nve-badge>',
        '<nve-card>Content</nve-card>',
        '<nve-input value="text"></nve-input>'
      ],
      invalid: []
    });
  });

  it('should report popovertarget on non-button nve elements', () => {
    tester.run('popovertarget on non-button elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-badge popovertarget="my-popover">Badge</nve-badge>',
          errors: [
            {
              messageId: 'no-invalid-invoker-triggers',
              data: { attribute: 'popovertarget', element: 'nve-badge', validElements }
            }
          ]
        },
        {
          code: '<nve-card popovertarget="my-popover">Card</nve-card>',
          errors: [
            {
              messageId: 'no-invalid-invoker-triggers',
              data: { attribute: 'popovertarget', element: 'nve-card', validElements }
            }
          ]
        },
        {
          code: '<nve-input popovertarget="my-popover"></nve-input>',
          errors: [
            {
              messageId: 'no-invalid-invoker-triggers',
              data: { attribute: 'popovertarget', element: 'nve-input', validElements }
            }
          ]
        }
      ]
    });
  });

  it('should report commandfor on non-button nve elements', () => {
    tester.run('commandfor on non-button elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-badge commandfor="my-panel">Badge</nve-badge>',
          errors: [
            {
              messageId: 'no-invalid-invoker-triggers',
              data: { attribute: 'commandfor', element: 'nve-badge', validElements }
            }
          ]
        },
        {
          code: '<nve-tooltip commandfor="my-panel">Tooltip</nve-tooltip>',
          errors: [
            {
              messageId: 'no-invalid-invoker-triggers',
              data: { attribute: 'commandfor', element: 'nve-tooltip', validElements }
            }
          ]
        }
      ]
    });
  });

  it('should report interestfor on non-button nve elements', () => {
    tester.run('interestfor on non-button elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-card interestfor="my-tooltip">Card</nve-card>',
          errors: [
            {
              messageId: 'no-invalid-invoker-triggers',
              data: { attribute: 'interestfor', element: 'nve-card', validElements }
            }
          ]
        }
      ]
    });
  });

  it('should report multiple invoker attributes on the same non-button element', () => {
    tester.run('multiple invoker attributes on same element', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-badge popovertarget="my-popover" commandfor="my-panel">Badge</nve-badge>',
          errors: [
            {
              messageId: 'no-invalid-invoker-triggers',
              data: { attribute: 'popovertarget', element: 'nve-badge', validElements }
            },
            {
              messageId: 'no-invalid-invoker-triggers',
              data: { attribute: 'commandfor', element: 'nve-badge', validElements }
            }
          ]
        }
      ]
    });
  });

  it('should allow multiple invoker attributes on valid button-type elements', () => {
    tester.run('multiple invoker attributes on button-type elements', rule, {
      valid: ['<nve-button popovertarget="my-popover" commandfor="my-panel">Button</nve-button>'],
      invalid: []
    });
  });
});
