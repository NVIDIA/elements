import { beforeEach, test } from 'node:test';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import reservedPropertyNames from './reserved-property-names.js';

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

test('valid: readOnly property uses readonly attribute', () => {
  tester.run('reserved-property-names', reservedPropertyNames, {
    valid: [
      {
        code: `
          class TestElement {
            @property({ type: Boolean, attribute: 'readonly' }) readOnly = false;
          }
        `
      },
      {
        code: `
          class TestElement {
            get readonly() {
              return this.readOnly;
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: decorated readonly property', () => {
  tester.run('reserved-property-names', reservedPropertyNames, {
    valid: [],
    invalid: [
      {
        code: `
          class TestElement {
            @property({ type: Boolean }) readonly = false;
          }
        `,
        errors: [
          {
            message:
              '"@property readonly" must use the native DOM property name `readOnly` with `attribute: \'readonly\'`.'
          }
        ]
      }
    ]
  });
});
