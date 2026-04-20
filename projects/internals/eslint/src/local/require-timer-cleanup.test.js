import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import requireTimerCleanup from './require-timer-cleanup.js';

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
  assert.equal(requireTimerCleanup.meta.type, 'problem');
  assert.equal(requireTimerCleanup.meta.name, 'require-timer-cleanup');
  assert.ok(requireTimerCleanup.meta.messages['unstoppable-interval']);
  assert.ok(requireTimerCleanup.meta.messages['missing-timer-cleanup']);
});

test('valid: setInterval stored and cleared', () => {
  tester.run('require-timer-cleanup', requireTimerCleanup, {
    valid: [
      {
        code: `
          class Foo {
            #intervalId;
            connectedCallback() {
              this.#intervalId = setInterval(() => {}, 100);
            }
            disconnectedCallback() {
              clearInterval(this.#intervalId);
            }
          }
        `
      },
      {
        code: `
          class Foo {
            #intervalId = setInterval(() => {}, 100);
            disconnectedCallback() {
              clearInterval(this.#intervalId);
            }
          }
        `
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              this.timeoutId = setTimeout(() => {}, 100);
            }
            disconnectedCallback() {
              clearTimeout(this.timeoutId);
            }
          }
        `
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              this.#id = globalThis.setTimeout(() => {}, 100);
            }
            disconnectedCallback() {
              globalThis.clearTimeout(this.#id);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('valid: unstored setTimeout one-shot', () => {
  tester.run('require-timer-cleanup', requireTimerCleanup, {
    valid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              setTimeout(() => this.doSomething(), 0);
            }
          }
        `
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              const id = setTimeout(() => this.doSomething(), 100);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('valid: timers at module scope are not this rule', () => {
  tester.run('require-timer-cleanup', requireTimerCleanup, {
    valid: [
      {
        code: `
          setInterval(() => {}, 100);
          setTimeout(() => {}, 100);
        `
      }
    ],
    invalid: []
  });
});

test('invalid: setInterval with no stored handle inside a class', () => {
  tester.run('require-timer-cleanup', requireTimerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              setInterval(() => {}, 100);
            }
          }
        `,
        errors: [{ messageId: 'unstoppable-interval' }]
      }
    ]
  });
});

test('invalid: stored setInterval without clearInterval', () => {
  tester.run('require-timer-cleanup', requireTimerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              this.#id = setInterval(() => {}, 100);
            }
            disconnectedCallback() {}
          }
        `,
        errors: [
          {
            messageId: 'missing-timer-cleanup',
            data: { fn: 'setInterval', target: 'this.#id', clear: 'clearInterval' }
          }
        ]
      }
    ]
  });
});

test('invalid: stored setTimeout without clearTimeout', () => {
  tester.run('require-timer-cleanup', requireTimerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              this.#id = setTimeout(() => {}, 1000);
            }
          }
        `,
        errors: [
          {
            messageId: 'missing-timer-cleanup',
            data: { fn: 'setTimeout', target: 'this.#id', clear: 'clearTimeout' }
          }
        ]
      }
    ]
  });
});

test('valid: setInterval stored in a local variable is not flagged', () => {
  tester.run('require-timer-cleanup', requireTimerCleanup, {
    valid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              const id = setInterval(() => {}, 100);
              clearInterval(id);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: globalThis.setInterval stored without clearInterval', () => {
  tester.run('require-timer-cleanup', requireTimerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              this.#id = globalThis.setInterval(() => {}, 100);
            }
          }
        `,
        errors: [
          {
            messageId: 'missing-timer-cleanup',
            data: { fn: 'setInterval', target: 'this.#id', clear: 'clearInterval' }
          }
        ]
      }
    ]
  });
});

test('invalid: stored setInterval cleared with wrong handle text', () => {
  tester.run('require-timer-cleanup', requireTimerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              this.#id = setInterval(() => {}, 100);
            }
            disconnectedCallback() {
              clearInterval(this.otherId);
            }
          }
        `,
        errors: [
          {
            messageId: 'missing-timer-cleanup',
            data: { fn: 'setInterval', target: 'this.#id', clear: 'clearInterval' }
          }
        ]
      }
    ]
  });
});
