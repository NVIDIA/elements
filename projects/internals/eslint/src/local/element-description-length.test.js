import { test } from 'node:test';
import { RuleTester } from 'eslint';
import parser from '@typescript-eslint/parser';
import elementDescriptionLength from './element-description-length.js';

const tester = new RuleTester({ languageOptions: { parser } });

function component(description) {
  return `/**
 * @element nve-test
 * @description ${description}
 */
export class Test extends HTMLElement {}`;
}

test('checks descriptions of JSDoc-tagged custom elements', () => {
  tester.run('element-description-length', elementDescriptionLength, {
    valid: [
      component('a'.repeat(100)),
      component('a'.repeat(250)),
      `/*** Section banner */\n${component('a'.repeat(100))}`,
      component(`${'a'.repeat(49)}\n *\n *     ${'😀'.repeat(50)}\n * @slot default - Default content.`),
      '/** @description Short description. */\nclass Helper {}',
      '/** Refers to an @element tag in prose. */\nclass Helper {}',
      '/** @element nve-test */\nfunction helper() {}'
    ],
    invalid: [
      {
        code: component('a'.repeat(99)),
        errors: [{ messageId: 'description-length', data: { min: 100, max: 250, length: 99 } }]
      },
      {
        code: component('a'.repeat(251)),
        errors: [{ messageId: 'description-length', data: { min: 100, max: 250, length: 251 } }]
      },
      {
        code: component('\n * @slot default - Default content.'),
        errors: [{ messageId: 'description-length', data: { min: 100, max: 250, length: 0 } }]
      },
      {
        code: '/** @element nve-test */\nexport default class Test extends HTMLElement {}',
        errors: [{ messageId: 'missing-description' }]
      },
      {
        code: `/**
 * @customElement nve-test
 * @description See \`@nve/foo\` and {@link Test}.
 * This continues on the next line.
 * @slot default - Default content.
 */
@decorate()
export class Test extends HTMLElement {}`,
        errors: [{ messageId: 'description-length', data: { min: 100, max: 250, length: 65 } }]
      }
    ]
  });
});
