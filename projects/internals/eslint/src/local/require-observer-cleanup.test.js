import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import requireObserverCleanup from './require-observer-cleanup.js';

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
  assert.equal(requireObserverCleanup.meta.type, 'problem');
  assert.equal(requireObserverCleanup.meta.name, 'require-observer-cleanup');
  assert.ok(requireObserverCleanup.meta.messages['inline-observer-leak']);
});

test('valid: observer stored on a class field', () => {
  tester.run('require-observer-cleanup', requireObserverCleanup, {
    valid: [
      {
        code: `
          class Foo {
            #ro;
            connectedCallback() {
              this.#ro = new ResizeObserver(() => {});
              this.#ro.observe(this);
            }
            disconnectedCallback() {
              this.#ro.disconnect();
            }
          }
        `
      },
      {
        code: `
          class Foo {
            #ro = new ResizeObserver(() => {});
          }
        `
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              const obs = new MutationObserver(() => {});
              obs.observe(this);
              this.observers.push(obs);
            }
          }
        `
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              this.observers.push(new IntersectionObserver(() => {}));
            }
          }
        `
      },
      {
        code: `
          class Foo {
            createObserver() {
              return new PerformanceObserver(() => {});
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('valid: observer created at module scope is not this rule', () => {
  tester.run('require-observer-cleanup', requireObserverCleanup, {
    valid: [
      {
        code: `
          const ro = new ResizeObserver(() => {});
          ro.observe(document.body);
        `
      },
      {
        code: `
          new ResizeObserver(() => {}).observe(document.body);
        `
      }
    ],
    invalid: []
  });
});

test('invalid: inline observer with chained observe()', () => {
  tester.run('require-observer-cleanup', requireObserverCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              new ResizeObserver(() => {}).observe(this);
            }
          }
        `,
        errors: [{ messageId: 'inline-observer-leak', data: { kind: 'ResizeObserver' } }]
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              new MutationObserver(() => {}).observe(this, { childList: true });
            }
          }
        `,
        errors: [{ messageId: 'inline-observer-leak', data: { kind: 'MutationObserver' } }]
      }
    ]
  });
});

test('invalid: assignment target is the observer method chain, not the observer itself', () => {
  tester.run('require-observer-cleanup', requireObserverCleanup, {
    valid: [],
    invalid: [
      {
        // `new ResizeObserver(fn).observe(this)` evaluates to `undefined` and
        // assigns undefined to #ro — the observer itself is never stored.
        code: `
          class Foo {
            #ro;
            connectedCallback() {
              this.#ro = new ResizeObserver(() => {}).observe(this);
            }
          }
        `,
        errors: [{ messageId: 'inline-observer-leak', data: { kind: 'ResizeObserver' } }]
      }
    ]
  });
});

test('invalid: inline observer with no use at all', () => {
  tester.run('require-observer-cleanup', requireObserverCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              new IntersectionObserver(() => {});
            }
          }
        `,
        errors: [{ messageId: 'inline-observer-leak', data: { kind: 'IntersectionObserver' } }]
      }
    ]
  });
});
