import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import preferDirectTypedArrayIteration from './prefer-direct-typed-array-iteration.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: { allowDefaultProject: ['*.ts'] },
        tsconfigRootDir: import.meta.dirname
      }
    }
  });
});

test('defines rule metadata', () => {
  assert.equal(preferDirectTypedArrayIteration.meta.type, 'suggestion');
  assert.equal(preferDirectTypedArrayIteration.meta.name, 'prefer-direct-typed-array-iteration');
  assert.equal(preferDirectTypedArrayIteration.meta.fixable, undefined);
});

test('valid: preserves DOM collection conversion and direct typed-array iteration', () => {
  tester.run('prefer-direct-typed-array-iteration', preferDirectTypedArrayIteration, {
    valid: [
      {
        filename: 'performance-rule.ts',
        code: `
          declare const options: HTMLOptionsCollection;
          Array.from(options).some(option => option.disabled);
        `
      },
      {
        filename: 'performance-rule.ts',
        code: `
          const values = new Float32Array(4);
          values.some(value => value < 0);
          Array.from(values, value => value * 2).some(value => value < 0);
        `
      }
    ],
    invalid: []
  });
});

test('invalid: reports unnecessary typed-array copies without unsafe fixes', () => {
  tester.run('prefer-direct-typed-array-iteration', preferDirectTypedArrayIteration, {
    valid: [],
    invalid: [
      {
        filename: 'performance-rule.ts',
        code: `
          const colors = new Float32Array(4);
          Array.from(colors).some(value => value < 0);
        `,
        output: null,
        errors: [{ messageId: 'unnecessary-copy', data: { method: 'some' } }]
      },
      {
        filename: 'performance-rule.ts',
        code: `
          const values = new Float32Array([1, 2]);
          Array.from(values).some((value, index) => {
            if (index === 0) values[1] = 0;
            return value === 2;
          });
        `,
        output: null,
        errors: [{ messageId: 'unnecessary-copy', data: { method: 'some' } }]
      },
      {
        filename: 'performance-rule.ts',
        code: `
          const indices = new Uint32Array(4);
          Array.from(indices).forEach(index => void index);
        `,
        output: null,
        errors: [{ messageId: 'unnecessary-copy', data: { method: 'forEach' } }]
      },
      {
        filename: 'performance-rule.ts',
        code: `
          type Positions = Float32Array;
          declare const positions: Positions;
          Array.from(positions).some(position => position > 0);
        `,
        output: null,
        errors: [{ messageId: 'unnecessary-copy', data: { method: 'some' } }]
      },
      {
        filename: 'performance-rule.ts',
        code: `
          declare const condition: boolean;
          const first = new Float32Array(4);
          const second = new Float32Array(4);
          Array.from(condition ? first : second).some(value => value < 0);
        `,
        output: null,
        errors: [{ messageId: 'unnecessary-copy', data: { method: 'some' } }]
      },
      {
        filename: 'performance-rule.ts',
        code: `
          const values = new Float32Array(4);
          Object.defineProperty(values, Symbol.iterator, {
            value: function* () {
              yield 1;
            }
          });
          Array.from(values).some(value => value < 0);
        `,
        output: null,
        errors: [{ messageId: 'unnecessary-copy', data: { method: 'some' } }]
      }
    ]
  });
});
