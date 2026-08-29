import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import noHotPathCollectionAllocation from './no-hot-path-collection-allocation.js';

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
  assert.equal(noHotPathCollectionAllocation.meta.type, 'suggestion');
  assert.equal(noHotPathCollectionAllocation.meta.name, 'no-hot-path-collection-allocation');
  assert.ok(noHotPathCollectionAllocation.meta.messages['allocating-method']);
  assert.ok(noHotPathCollectionAllocation.meta.messages['collection-constructor']);
});

test('valid: ignores unannotated functions and allocation-free hot paths', () => {
  tester.run('no-hot-path-collection-allocation', noHotPathCollectionAllocation, {
    valid: [
      { filename: 'performance-rule.ts', code: `function collect(items: number[]) { return items.filter(Boolean); }` },
      {
        filename: 'performance-rule.ts',
        code: `
          /** @hotPath */
          function draw(items: number[]) {
            for (const item of items) consume(item);
          }
        `
      },
      {
        filename: 'performance-rule.ts',
        code: `
          class SceneRenderer {
            draw(items: number[]) {
              const cache = new WeakMap();
              for (const item of items) consume(item);
              return cache;
            }
          }
        `
      },
      {
        filename: 'performance-rule.ts',
        code: `
          /** @hotPath */
          function draw(items: number[]) {
            function collect() {
              return new Set(items);
            }
            return () => items.filter(Boolean);
          }
        `
      },
      {
        filename: 'performance-rule.ts',
        code: `
          class PointRenderer {
            map(point: number) {
              return point;
            }
            draw(point: number) {
              return this.map(point);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: reports collection allocations in annotated functions and methods', () => {
  tester.run('no-hot-path-collection-allocation', noHotPathCollectionAllocation, {
    valid: [],
    invalid: [
      {
        filename: 'performance-rule.ts',
        code: `
          /** @hotPath */
          function draw(items: number[]) {
            const visible = items.filter(Boolean);
            const copy = Array.from(items);
            return [...visible, ...copy];
          }
        `,
        errors: [
          { messageId: 'allocating-method', data: { method: 'filter' } },
          { messageId: 'array-copy' },
          { messageId: 'array-spread' }
        ]
      },
      {
        filename: 'performance-rule.ts',
        code: `
          class Renderer {
            draw(items: Array<{ id: number }>) {
              const active = new Set(items);
              return items.map(item => item.id + active.size);
            }
          }
        `,
        errors: [
          { messageId: 'collection-constructor', data: { kind: 'Set' } },
          { messageId: 'allocating-method', data: { method: 'map' } }
        ]
      },
      {
        filename: 'performance-rule.ts',
        code: `
          /** @hotPath */
          export const draw = (items: number[]) => items.slice();
        `,
        errors: [{ messageId: 'allocating-method', data: { method: 'slice' } }]
      },
      {
        filename: 'performance-rule.ts',
        code: `
          class Renderer {
            /** @hotPath */
            draw = (items: number[]) => items.toSorted();
          }
        `,
        errors: [{ messageId: 'allocating-method', data: { method: 'toSorted' } }]
      },
      {
        filename: 'performance-rule.ts',
        code: `
          /** @hotPath */
          function draw() {
            class NestedRenderer {
              prepare(items: number[]) {
                return Array.from(items);
              }
            }
            return NestedRenderer;
          }
        `,
        errors: [{ messageId: 'array-copy' }]
      }
    ]
  });
});
