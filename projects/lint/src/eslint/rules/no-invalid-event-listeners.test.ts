import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noInvalidEventListeners from './no-invalid-event-listeners.js';

const rule = noInvalidEventListeners as unknown as JSRuleDefinition;

describe('noInvalidEventListeners', () => {
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
    expect(noInvalidEventListeners.meta).toBeDefined();
    expect(noInvalidEventListeners.meta.type).toBe('problem');
    expect(noInvalidEventListeners.meta.docs).toBeDefined();
    expect(noInvalidEventListeners.meta.docs.description).toBe('Disallow inline event handler attributes in HTML.');
    expect(noInvalidEventListeners.meta.docs.category).toBe('Best Practice');
    expect(noInvalidEventListeners.meta.docs.recommended).toBe(true);
    expect(noInvalidEventListeners.meta.docs.url).toContain('/docs/lint/');
    expect(noInvalidEventListeners.meta.schema).toEqual([]);
    expect(noInvalidEventListeners.meta.messages).toBeDefined();
    expect(noInvalidEventListeners.meta.messages['no-inline-event-handler']).toBe(
      'Unexpected inline event handler "{{attribute}}". Use addEventListener() or a framework event binding instead.'
    );
  });

  it('should allow elements without inline event handlers', () => {
    tester.run('should allow elements without inline event handlers', rule, {
      valid: [
        '<button>Click me</button>',
        '<button type="submit">Submit</button>',
        '<div class="container"></div>',
        '<input type="text" name="field" />',
        '<nve-button>Click</nve-button>',
        '<nve-icon-button icon-name="menu"></nve-icon-button>'
      ],
      invalid: []
    });
  });

  it('should allow framework event binding syntax', () => {
    tester.run('should allow framework event binding syntax', rule, {
      valid: [
        '<button @click="handleClick">Click</button>',
        '<button (click)="handleClick()">Click</button>',
        '<button v-on:click="handleClick">Click</button>'
      ],
      invalid: []
    });
  });

  it('should report inline onclick handler', () => {
    tester.run('should report inline onclick handler', rule, {
      valid: [],
      invalid: [
        {
          code: `<button onclick="alert('Hello')">Click me</button>`,
          errors: [{ messageId: 'no-inline-event-handler', data: { attribute: 'onclick' } }]
        }
      ]
    });
  });

  it('should report various inline event handlers', () => {
    tester.run('should report various inline event handlers', rule, {
      valid: [],
      invalid: [
        {
          code: '<div onmouseover="highlight()"></div>',
          errors: [{ messageId: 'no-inline-event-handler', data: { attribute: 'onmouseover' } }]
        },
        {
          code: '<input onchange="validate()" />',
          errors: [{ messageId: 'no-inline-event-handler', data: { attribute: 'onchange' } }]
        },
        {
          code: '<form onsubmit="handleSubmit()"></form>',
          errors: [{ messageId: 'no-inline-event-handler', data: { attribute: 'onsubmit' } }]
        },
        {
          code: '<input onfocus="clearError()" />',
          errors: [{ messageId: 'no-inline-event-handler', data: { attribute: 'onfocus' } }]
        },
        {
          code: '<input onblur="validate()" />',
          errors: [{ messageId: 'no-inline-event-handler', data: { attribute: 'onblur' } }]
        },
        {
          code: '<div onkeydown="handleKey(event)"></div>',
          errors: [{ messageId: 'no-inline-event-handler', data: { attribute: 'onkeydown' } }]
        }
      ]
    });
  });

  it('should report inline event handlers on custom elements', () => {
    tester.run('should report inline event handlers on custom elements', rule, {
      valid: [],
      invalid: [
        {
          code: '<nve-button onclick="doSomething()">Click</nve-button>',
          errors: [{ messageId: 'no-inline-event-handler', data: { attribute: 'onclick' } }]
        },
        {
          code: '<nve-input onchange="validate()"></nve-input>',
          errors: [{ messageId: 'no-inline-event-handler', data: { attribute: 'onchange' } }]
        }
      ]
    });
  });

  it('should report multiple inline event handlers on the same element', () => {
    tester.run('should report multiple inline handlers', rule, {
      valid: [],
      invalid: [
        {
          code: '<button onclick="click()" onmouseover="hover()">Click</button>',
          errors: [
            { messageId: 'no-inline-event-handler', data: { attribute: 'onclick' } },
            { messageId: 'no-inline-event-handler', data: { attribute: 'onmouseover' } }
          ]
        }
      ]
    });
  });
});
