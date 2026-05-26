import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import primitiveProperty from './primitive-property.js';

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
  assert.equal(primitiveProperty.meta.type, 'problem');
  assert.equal(primitiveProperty.meta.docs.description, 'Prevent complex types used on public API properties');
});

test('valid: allows primitive public properties and documented exceptions', () => {
  tester.run('primitive-property', primitiveProperty, {
    valid: [
      {
        code: `
          import { property } from 'lit/decorators/property.js';

          class TestElement {
            @property({ type: String }) label = '';
            @property({ type: Number }) value = 0;
            @property({ type: Boolean }) disabled = false;
          }
        `
      },
      {
        code: `
          import { property } from 'lit/decorators/property.js';

          class TestElement {
            @property({ type: Object }) commandForElement = null;
            @property({ type: Array }) data = [];
            @property({ type: Object }) i18n = {};
            @property({ type: Array }) stepSizes = [];
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: rejects complex public properties without an exception', () => {
  tester.run('primitive-property', primitiveProperty, {
    valid: [],
    invalid: [
      {
        code: `
          import { property } from 'lit/decorators/property.js';

          class TestElement {
            @property({ type: Object }) config = {};
          }
        `,
        errors: [
          {
            message:
              'Public API "config" with type Object must be a primitive type https://NVIDIA.github.io/elements/docs/api-design/properties-attributes/'
          }
        ]
      },
      {
        code: `
          import { property } from 'lit/decorators/property.js';

          class TestElement {
            @property({ type: Array }) items = [];
          }
        `,
        errors: [
          {
            message:
              'Public API "items" with type Array must be a primitive type https://NVIDIA.github.io/elements/docs/api-design/properties-attributes/'
          }
        ]
      }
    ]
  });
});
