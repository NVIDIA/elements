import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import maxJsdocLength from './max-jsdoc-length.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
    }
  });
});

function error(length, maxLength = 400) {
  return { messageId: 'too-long', data: { length: String(length), maxLength: String(maxLength) } };
}

test('defines rule metadata without a destructive autofix', () => {
  assert.equal(maxJsdocLength.meta.type, 'suggestion');
  assert.equal(maxJsdocLength.meta.name, 'max-jsdoc-length');
  assert.ok(maxJsdocLength.meta.messages['too-long']);
  assert.equal(maxJsdocLength.meta.fixable, undefined);
});

test('valid: allows the boundary, formatting variations, and unrelated JSDoc', () => {
  const long = 'a'.repeat(401);
  tester.run('max-jsdoc-length', maxJsdocLength, {
    valid: [
      'class Example { value = 0; }',
      'class Example { /** */ value = 0; }',
      `class Example { /** ${'a'.repeat(400)} */ value = 0; }`,
      `class Example {\n/**\n * ${'a'.repeat(199)}\n * ${'b'.repeat(200)}\n */\nvalue = 0;\n}`,
      `class Example {\r\n/**\r\n * ${'a'.repeat(199)}\r\n * ${'b'.repeat(200)}\r\n */\r\nvalue = 0;\r\n}`,
      `class Example { /* ${long} */ value = 0; }`,
      `class Example { // ${long}\nvalue = 0; }`,
      `/** ${long} */ class Example { value = 0; }`,
      `class Example { /** ${'a'.repeat(400)} */ method() {} }`,
      `class Example { /** ${'a'.repeat(400)} */ constructor() {} }`,
      `abstract class Example { /** ${'a'.repeat(400)} */ abstract method(): void; }`,
      `class Example { /* ${long} */ method() {} }`,
      `/** ${long} */ function example() {}`,
      `const example = { /** ${long} */ value: 0 };`,
      `const example = { /** ${long} */ method() {} };`,
      `interface Example { /** ${long} */ value: number; }`,
      `interface Example { /** ${long} */ method(): void; }`,
      { code: 'class Example { /** Short. */ value = 0; }', options: [{ maxLength: 6 }] },
      { code: 'class Example { /** Short. */ method() {} }', options: [{ maxLength: 6 }] },
      {
        code: `class Example { /** ${long} */ value = 0; }`,
        options: [{ maxLength: 500 }]
      },
      {
        code: `class Example { /** ${long} */ method() {} }`,
        options: [{ maxLength: 500 }]
      },
      // A comment inside decorator configuration describes that configuration field.
      `class Example { @property({ /** ${long} */ type: String }) value = ''; }`,
      // Markdown emphasis on the first line is content, not a decoration marker.
      { code: 'class Example { /** * A */ value = 0; }', options: [{ maxLength: 3 }] }
    ],
    invalid: []
  });
});

test('invalid: reports long JSDoc on every class property form', () => {
  const long = 'a'.repeat(401);
  const properties = [
    `value = 0;`,
    `static value = 0;`,
    `#value = 0;`,
    `['value'] = 0;`,
    `value = () => {};`,
    `get value() { return 0; }`,
    `set value(next) {}`,
    `accessor value = 0;`,
    `abstract value: number;`,
    `abstract get value(): number;`,
    `abstract set value(next: number);`,
    `abstract accessor value: number;`
  ];
  tester.run('max-jsdoc-length', maxJsdocLength, {
    valid: [],
    invalid: [
      ...properties.map(property => ({
        code: `abstract class Example { /** ${long} */ ${property} }`,
        errors: [error(401)]
      })),
      {
        code: `const Example = class { /** ${long} */ value = 0; };`,
        errors: [error(401)]
      },
      {
        code: `class Example { constructor(/** ${long} */ public value: number) {} }`,
        errors: [error(401)]
      },
      {
        code: `class Example {\n  /** ${long} */\n  @property({ type: String })\n  value = '';\n}`,
        errors: [{ ...error(401), line: 2, column: 3 }]
      },
      {
        code: `class Example { @property() /** ${long} */ value = ''; }`,
        errors: [error(401)]
      },
      {
        code: `class Example { /** ${long} */ get value() { return 0; } /** ${long} */ set value(next) {} }`,
        errors: [error(401), error(401)]
      }
    ]
  });
});

test('invalid: applies the same limit to class methods, constructors, and overloads', () => {
  const long = 'a'.repeat(401);
  const methods = [
    'method() {}',
    'static method() {}',
    '#method() {}',
    "['method']() {}",
    'async method() {}',
    '*method() {}',
    'constructor() {}',
    'abstract method(): void;',
    'method(value: string): void; method(value: string) {}'
  ];
  tester.run('max-jsdoc-length', maxJsdocLength, {
    valid: [],
    invalid: [
      ...methods.map(method => ({
        code: `abstract class Example { /** ${long} */ ${method} }`,
        errors: [error(401)]
      })),
      {
        code: `class Example {\n  /** ${long} */\n  @bound()\n  method() {}\n}`,
        errors: [{ ...error(401), line: 2, column: 3 }]
      },
      {
        code: `class Example { @bound() /** ${long} */ method() {} }`,
        errors: [error(401)]
      },
      {
        code: 'class Example { /** Too long. */ method() {} }',
        options: [{ maxLength: 8 }],
        errors: [error(9, 8)]
      },
      {
        code: 'class Example { /**\n * @returns A useful value.\n */ method() {} }',
        options: [{ maxLength: 23 }],
        errors: [error(24, 23)]
      }
    ]
  });
});

test('invalid: normalizes whitespace and includes tags and markup in the configured budget', () => {
  tester.run('max-jsdoc-length', maxJsdocLength, {
    valid: [],
    invalid: [
      {
        code: 'class Example { /**\n * Hello\n * world.\n */ value = 0; }',
        options: [{ maxLength: 11 }],
        errors: [error(12, 11)]
      },
      {
        code: 'class Example { /** @description Hello. */ value = 0; }',
        options: [{ maxLength: 18 }],
        errors: [error(19, 18)]
      },
      {
        code: 'class Example { /** * A */ value = 0; }',
        options: [{ maxLength: 2 }],
        errors: [error(3, 2)]
      },
      {
        code: `class Example {\n/**\n * ${'a'.repeat(200)}\n * ${'b'.repeat(200)}\n */\nvalue = 0;\n}`,
        errors: [error(401)]
      }
    ]
  });
});
