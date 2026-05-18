import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import noHostManagedAriaAttributes from './no-host-managed-aria-attributes.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  });
});

test('defines rule metadata', () => {
  assert.equal(noHostManagedAriaAttributes.meta.type, 'problem');
  assert.equal(noHostManagedAriaAttributes.meta.name, 'no-host-managed-aria-attributes');
  assert.ok(noHostManagedAriaAttributes.meta.messages['managed-attribute']);
});

test('valid: keeps host relationships and non-host attribute mutations valid', () => {
  tester.run('no-host-managed-aria-attributes', noHostManagedAriaAttributes, {
    valid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              this.setAttribute('aria-labelledby', this.labelId);
            }
          }
        `
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              this._internals.role = 'status';
              this._internals.ariaPressed = 'true';
            }
          }
        `
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              this.host.setAttribute('aria-pressed', 'true');
              panel.setAttribute('role', 'tabpanel');
            }
          }
        `
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              this.setAttribute(attribute, value);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: flags host-managed ARIA attributes', () => {
  tester.run('no-host-managed-aria-attributes', noHostManagedAriaAttributes, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              this.setAttribute('aria-disabled', 'true');
            }
          }
        `,
        errors: [
          {
            messageId: 'managed-attribute',
            data: {
              attribute: 'aria-disabled',
              controller: 'stateDisabled',
              method: 'setAttribute'
            }
          }
        ]
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              this.setAttribute('aria-label', 'open');
            }
          }
        `,
        errors: [
          {
            messageId: 'managed-attribute',
            data: {
              attribute: 'aria-label',
              controller: 'ElementInternals.ariaLabel',
              method: 'setAttribute'
            }
          }
        ]
      },
      {
        code: `
          class Foo {
            updated() {
              this.removeAttribute('aria-pressed');
            }
          }
        `,
        errors: [
          {
            messageId: 'managed-attribute',
            data: {
              attribute: 'aria-pressed',
              controller: 'statePressed',
              method: 'removeAttribute'
            }
          }
        ]
      },
      {
        code: `
          class Foo {
            updated() {
              this.toggleAttribute('aria-expanded', this.open);
            }
          }
        `,
        errors: [
          {
            messageId: 'managed-attribute',
            data: {
              attribute: 'aria-expanded',
              controller: 'stateExpanded',
              method: 'toggleAttribute'
            }
          }
        ]
      }
    ]
  });
});

test('invalid: flags host role mutations with literal or static template names', () => {
  tester.run('no-host-managed-aria-attributes', noHostManagedAriaAttributes, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              this.setAttribute('role', 'button');
            }
          }
        `,
        errors: [
          {
            messageId: 'managed-attribute',
            data: {
              attribute: 'role',
              controller: 'ElementInternals.role',
              method: 'setAttribute'
            }
          }
        ]
      },
      {
        code: `
          class Foo {
            updated() {
              this.setAttribute(\`aria-current\`, 'page');
            }
          }
        `,
        errors: [
          {
            messageId: 'managed-attribute',
            data: {
              attribute: 'aria-current',
              controller: 'stateCurrent',
              method: 'setAttribute'
            }
          }
        ]
      },
      {
        code: `
          class Foo {
            updated() {
              this.setAttribute('aria-selected', 'true');
            }
          }
        `,
        errors: [
          {
            messageId: 'managed-attribute',
            data: {
              attribute: 'aria-selected',
              controller: 'stateSelected',
              method: 'setAttribute'
            }
          }
        ]
      }
    ]
  });
});
