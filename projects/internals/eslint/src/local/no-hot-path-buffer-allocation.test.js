import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import noHotPathBufferAllocation from './no-hot-path-buffer-allocation.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } }
  });
});

test('defines rule metadata', () => {
  assert.equal(noHotPathBufferAllocation.meta.type, 'suggestion');
  assert.equal(noHotPathBufferAllocation.meta.name, 'no-hot-path-buffer-allocation');
  assert.ok(noHotPathBufferAllocation.meta.messages['buffer-constructor']);
});

test('valid: accepts reusable buffers and allocations outside hot paths', () => {
  tester.run('no-hot-path-buffer-allocation', noHotPathBufferAllocation, {
    valid: [
      { code: `function initialize() { return new Float32Array(40); }` },
      {
        code: `
          class GeometryRenderer {
            #scratch = new Float32Array(40);
            draw() {
              this.#scratch.fill(0);
            }
          }
        `
      },
      {
        code: `
          /** @hotPath */
          function tick() {
            function initialize() {
              return new Float32Array(40);
            }
            return () => new Uint8Array(8);
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: reports buffer construction in annotated and renderer hot paths', () => {
  tester.run('no-hot-path-buffer-allocation', noHotPathBufferAllocation, {
    valid: [],
    invalid: [
      {
        code: `
          /** @hotPath */
          function tick(bytes) {
            const view = new DataView(bytes.buffer);
            return new Uint8Array(view.byteLength);
          }
        `,
        errors: [
          { messageId: 'buffer-constructor', data: { kind: 'DataView' } },
          { messageId: 'buffer-constructor', data: { kind: 'Uint8Array' } }
        ]
      },
      {
        code: `
          class MeshRenderer {
            prepare() {
              return new Float32Array(16);
            }
          }
        `,
        errors: [{ messageId: 'buffer-constructor', data: { kind: 'Float32Array' } }]
      },
      {
        code: `class LabelRenderer { draw = () => new Uint32Array(1); }`,
        errors: [{ messageId: 'buffer-constructor', data: { kind: 'Uint32Array' } }]
      },
      {
        code: `
          /** @hotPath */
          export default function tick() {
            return new Int8Array(8);
          }
        `,
        errors: [{ messageId: 'buffer-constructor', data: { kind: 'Int8Array' } }]
      },
      {
        code: `
          /** @hotPath */
          function tick() {
            class NestedRenderer {
              draw() {
                return new Float64Array(8);
              }
            }
            return NestedRenderer;
          }
        `,
        errors: [{ messageId: 'buffer-constructor', data: { kind: 'Float64Array' } }]
      }
    ]
  });
});
