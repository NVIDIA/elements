import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import requireGpuResourceCleanup from './require-gpu-resource-cleanup.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } }
  });
});

test('defines rule metadata', () => {
  assert.equal(requireGpuResourceCleanup.meta.type, 'problem');
  assert.equal(requireGpuResourceCleanup.meta.name, 'require-gpu-resource-cleanup');
  assert.ok(requireGpuResourceCleanup.meta.messages['missing-gpu-cleanup']);
});

test('valid: accepts destroyed fields, local ownership transfer, and nondestroyable GPU objects', () => {
  tester.run('require-gpu-resource-cleanup', requireGpuResourceCleanup, {
    valid: [
      {
        code: `
          class Targets {
            initialize(device) {
              this.#texture = device.createTexture({});
            }
            disconnect() {
              this.#texture?.destroy?.();
            }
          }
        `
      },
      { code: `function create(device) { return device.createBuffer({}); }` },
      { code: `class PoolOwner { initialize(pool) { this.#buffer = pool.createBuffer({}); } }` },
      {
        code: `
          class Renderer {
            initialize(device) {
              this.#pipeline = device.createRenderPipeline({});
              this.#sampler = device.createSampler({});
            }
          }
        `
      },
      {
        code: `
          class Renderer {
            static initialize(device) {
              this.buffer = device.createBuffer({});
            }
            static {
              this.buffer = this.device.createBuffer({});
            }
            initialize(device) {
              function nested() {
                this.buffer = device.createBuffer({});
              }
              return nested;
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: reports retained destroyable GPU resources without cleanup', () => {
  tester.run('require-gpu-resource-cleanup', requireGpuResourceCleanup, {
    valid: [],
    invalid: [
      {
        code: `class Renderer { initialize(device) { this.#buffer = device.createBuffer({}); } }`,
        errors: [{ messageId: 'missing-gpu-cleanup', data: { target: 'this.#buffer' } }]
      },
      {
        code: `class Renderer { #texture = this.device.createTexture({}); }`,
        errors: [{ messageId: 'missing-gpu-cleanup', data: { target: 'this.#texture' } }]
      },
      {
        code: `class Renderer { initialize(device) { this.queries = device.createQuerySet({}); } }`,
        errors: [{ messageId: 'missing-gpu-cleanup', data: { target: 'this.queries' } }]
      },
      {
        code: `
          class Renderer {
            #buffer = this.device.createBuffer({});
            method() {
              return class Nested {
                #buffer;
                disconnect() {
                  this.#buffer.destroy();
                }
              };
            }
          }
        `,
        errors: [{ messageId: 'missing-gpu-cleanup', data: { target: 'this.#buffer' } }]
      },
      {
        code: `
          class Renderer {
            buffer = this.device.createBuffer({});
            disconnect() {
              function cleanup() {
                this.buffer.destroy();
              }
              return cleanup;
            }
          }
        `,
        errors: [{ messageId: 'missing-gpu-cleanup', data: { target: 'this.buffer' } }]
      },
      {
        code: `
          class Renderer {
            buffer = this.device.createBuffer({});
            static {
              this.buffer.destroy();
            }
          }
        `,
        errors: [{ messageId: 'missing-gpu-cleanup', data: { target: 'this.buffer' } }]
      }
    ]
  });
});
