import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import requireAnimationFrameCleanup from './require-animation-frame-cleanup.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } }
  });
});

test('defines rule metadata', () => {
  assert.equal(requireAnimationFrameCleanup.meta.type, 'problem');
  assert.equal(requireAnimationFrameCleanup.meta.name, 'require-animation-frame-cleanup');
  assert.ok(requireAnimationFrameCleanup.meta.messages['missing-frame-cleanup']);
});

test('valid: stored animation frames are canceled and one-shots may be unstored', () => {
  tester.run('require-animation-frame-cleanup', requireAnimationFrameCleanup, {
    valid: [
      {
        code: `
          class Scene {
            schedule() {
              this.#frame = scenePlatform.requestAnimationFrame(() => this.draw());
            }
            disconnect() {
              scenePlatform.cancelAnimationFrame(this.#frame);
            }
          }
        `
      },
      {
        code: `requestAnimationFrame(() => draw());`
      },
      {
        code: `
          class Scene {
            [frameKey] = requestAnimationFrame(() => this.draw());
            disconnect() {
              cancelAnimationFrame(this [frameKey]);
            }
          }
        `
      },
      {
        code: `
          class Scene {
            static schedule() {
              this.frame = requestAnimationFrame(() => draw());
            }
            static {
              this.frame = requestAnimationFrame(() => draw());
            }
            schedule() {
              function nested() {
                this.frame = requestAnimationFrame(() => draw());
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

test('invalid: reports stored animation frames without cancellation', () => {
  tester.run('require-animation-frame-cleanup', requireAnimationFrameCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Scene {
            schedule() {
              this.#frame = requestAnimationFrame(() => this.draw());
            }
          }
        `,
        errors: [{ messageId: 'missing-frame-cleanup', data: { target: 'this.#frame' } }]
      },
      {
        code: `
          class Scene {
            #frame = globalThis.requestAnimationFrame(() => this.draw());
          }
        `,
        errors: [{ messageId: 'missing-frame-cleanup', data: { target: 'this.#frame' } }]
      },
      {
        code: `
          class Scene {
            #frame = requestAnimationFrame(() => this.draw());
            method() {
              class Nested {
                #frame;
                disconnect() {
                  cancelAnimationFrame(this.#frame);
                }
              }
              return Nested;
            }
          }
        `,
        errors: [{ messageId: 'missing-frame-cleanup', data: { target: 'this.#frame' } }]
      },
      {
        code: `
          class Scene {
            frame = requestAnimationFrame(() => this.draw());
            disconnect() {
              function cancel() {
                cancelAnimationFrame(this.frame);
              }
              return cancel;
            }
          }
        `,
        errors: [{ messageId: 'missing-frame-cleanup', data: { target: 'this.frame' } }]
      },
      {
        code: `
          class Scene {
            frame = requestAnimationFrame(() => this.draw());
            static {
              cancelAnimationFrame(this.frame);
            }
          }
        `,
        errors: [{ messageId: 'missing-frame-cleanup', data: { target: 'this.frame' } }]
      }
    ]
  });
});
