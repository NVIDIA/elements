import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import requireObserverDisconnect from './require-observer-disconnect.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } }
  });
});

test('defines rule metadata', () => {
  assert.equal(requireObserverDisconnect.meta.type, 'problem');
  assert.equal(requireObserverDisconnect.meta.name, 'require-observer-disconnect');
  assert.ok(requireObserverDisconnect.meta.messages['missing-observer-disconnect']);
});

test('valid: class observers and configured platform factories are disconnected', () => {
  tester.run('require-observer-disconnect', requireObserverDisconnect, {
    valid: [
      {
        code: `
          class Element {
            #observer = new ResizeObserver(() => {});
            disconnectedCallback() {
              this.#observer.disconnect();
            }
          }
        `
      },
      {
        code: `
          class Element {
            connect() {
              this.observer ??= platform.createMutationObserver(() => {});
            }
            disconnect() {
              this.observer?.disconnect();
            }
          }
        `
      },
      {
        code: `
          class Element {
            static connect() {
              this.observer = new ResizeObserver(() => {});
            }
            static {
              this.observer = new ResizeObserver(() => {});
            }
            connect() {
              function nested() {
                this.observer = new ResizeObserver(() => {});
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

test('invalid: reports retained observers without disconnect', () => {
  tester.run('require-observer-disconnect', requireObserverDisconnect, {
    valid: [],
    invalid: [
      {
        code: `
          class Element {
            #observer = new PerformanceObserver(() => {});
          }
        `,
        errors: [{ messageId: 'missing-observer-disconnect', data: { target: 'this.#observer' } }]
      },
      {
        code: `
          class Element {
            connect() {
              this.#observer = platform.createResizeObserver(() => {});
            }
          }
        `,
        errors: [{ messageId: 'missing-observer-disconnect', data: { target: 'this.#observer' } }]
      },
      {
        code: `
          class Element {
            #observer = new ResizeObserver(() => {});
            method() {
              class Nested {
                #observer;
                disconnect() {
                  this.#observer.disconnect();
                }
              }
              return Nested;
            }
          }
        `,
        errors: [{ messageId: 'missing-observer-disconnect', data: { target: 'this.#observer' } }]
      },
      {
        code: `
          class Element {
            observer = new ResizeObserver(() => {});
            disconnect() {
              function cleanup() {
                this.observer.disconnect();
              }
              return cleanup;
            }
          }
        `,
        errors: [{ messageId: 'missing-observer-disconnect', data: { target: 'this.observer' } }]
      },
      {
        code: `
          class Element {
            observer = new ResizeObserver(() => {});
            static {
              this.observer.disconnect();
            }
          }
        `,
        errors: [{ messageId: 'missing-observer-disconnect', data: { target: 'this.observer' } }]
      }
    ]
  });
});
