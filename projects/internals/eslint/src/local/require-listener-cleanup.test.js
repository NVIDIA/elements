import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import requireListenerCleanup from './require-listener-cleanup.js';

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
  assert.equal(requireListenerCleanup.meta.type, 'problem');
  assert.equal(requireListenerCleanup.meta.name, 'require-listener-cleanup');
  assert.ok(requireListenerCleanup.meta.messages['missing-cleanup']);
  assert.ok(requireListenerCleanup.meta.messages['missing-disconnected']);
  assert.ok(requireListenerCleanup.meta.messages['listener-in-constructor']);
});

test('invalid: addEventListener in the constructor', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            constructor() {
              super();
              this.shadowRoot?.addEventListener('input', this.#handler);
              this.shadowRoot?.addEventListener('change', this.#handler);
            }
          }
        `,
        errors: [
          { messageId: 'listener-in-constructor', data: { target: 'this.shadowRoot', event: "'input'" } },
          { messageId: 'listener-in-constructor', data: { target: 'this.shadowRoot', event: "'change'" } }
        ]
      }
    ]
  });
});

test('valid: add and remove paired with same target and event', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              document.addEventListener('change', this.#handler);
            }
            disconnectedCallback() {
              document.removeEventListener('change', this.#handler);
            }
          }
        `
      },
      {
        code: `
          class Foo {
            handler = () => {};
            connectedCallback() {
              this.shadowRoot?.addEventListener('input', this.handler);
              this.shadowRoot?.addEventListener('change', this.handler);
            }
            disconnectedCallback() {
              this.shadowRoot?.removeEventListener('input', this.handler);
              this.shadowRoot?.removeEventListener('change', this.handler);
            }
          }
        `
      },
      {
        code: `
          class Foo {
            render() {}
          }
        `
      },
      {
        code: `
          class Foo {
            connectedCallback() {
              this.setAttribute('nve-control', '');
            }
          }
        `
      },
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              if (this.enabled) {
                window.addEventListener('resize', this.#handler);
              }
            }
            disconnectedCallback() {
              window.removeEventListener('resize', this.#handler);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: connectedCallback adds listener with no disconnectedCallback', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              this.shadowRoot?.addEventListener('input', this.#handler);
              this.shadowRoot?.addEventListener('change', this.#handler);
            }
          }
        `,
        errors: [{ messageId: 'missing-disconnected' }]
      }
    ]
  });
});

test('invalid: only some events are removed', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              this.shadowRoot?.addEventListener('input', this.#handler);
              this.shadowRoot?.addEventListener('change', this.#handler);
            }
            disconnectedCallback() {
              this.shadowRoot?.removeEventListener('change', this.#handler);
            }
          }
        `,
        errors: [{ messageId: 'missing-cleanup', data: { target: 'this.shadowRoot', event: "'input'" } }]
      }
    ]
  });
});

test('valid: add and remove attached through private helper methods (depth-1 follow-through)', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              super.connectedCallback();
              this.#setup();
            }
            disconnectedCallback() {
              super.disconnectedCallback();
              this.#teardown();
            }
            #setup() {
              this.shadowRoot.addEventListener('slotchange', this.#handler);
            }
            #teardown() {
              this.shadowRoot.removeEventListener('slotchange', this.#handler);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: private helper adds a listener but disconnectedCallback does not remove it', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              super.connectedCallback();
              this.#setup();
            }
            disconnectedCallback() {
              super.disconnectedCallback();
            }
            #setup() {
              this.shadowRoot.addEventListener('slotchange', this.#handler);
            }
          }
        `,
        errors: [{ messageId: 'missing-cleanup', data: { target: 'this.shadowRoot', event: "'slotchange'" } }]
      }
    ]
  });
});

test('invalid: add in private helper, remove only for one of multiple listeners (control.ts regression)', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              super.connectedCallback();
              this.shadowRoot.addEventListener('slotchange', this.#handler);
              this.#setupInput();
            }
            disconnectedCallback() {
              super.disconnectedCallback();
              this.shadowRoot.removeEventListener('slotchange', this.#handler);
            }
            #setupInput() {
              this.input.addEventListener('input', this.#handler);
            }
          }
        `,
        errors: [{ messageId: 'missing-cleanup', data: { target: 'this.input', event: "'input'" } }]
      }
    ]
  });
});

test('invalid: addEventListener in a private helper called from the constructor', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            constructor() {
              super();
              this.#attach();
            }
            #attach() {
              this.shadowRoot?.addEventListener('input', this.#handler);
            }
          }
        `,
        errors: [{ messageId: 'listener-in-constructor', data: { target: 'this.shadowRoot', event: "'input'" } }]
      }
    ]
  });
});

test('valid: does not follow through non-private (regular) method calls', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              super.connectedCallback();
              this.publicHelper();
            }
            publicHelper() {
              document.addEventListener('scroll', this.#handler);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('valid: remove delegated to a private helper in disconnectedCallback', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              super.connectedCallback();
              this.shadowRoot.addEventListener('slotchange', this.#handler);
            }
            disconnectedCallback() {
              super.disconnectedCallback();
              this.#teardown();
            }
            #teardown() {
              this.shadowRoot.removeEventListener('slotchange', this.#handler);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('valid: does not follow TypeScript-private (non-#) methods', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [
      {
        code: `
          class Foo {
            handler = () => {};
            connectedCallback() {
              super.connectedCallback();
              this.setup();
            }
            private setup() {
              document.addEventListener('scroll', this.handler);
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('valid: mutually recursive private helpers do not cause infinite recursion', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [
      {
        code: `
          class Foo {
            connectedCallback() {
              super.connectedCallback();
              this.#a();
            }
            #a() { this.#b(); }
            #b() { this.#a(); }
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: target mismatch between add and remove', () => {
  tester.run('require-listener-cleanup', requireListenerCleanup, {
    valid: [],
    invalid: [
      {
        code: `
          class Foo {
            #handler = () => {};
            connectedCallback() {
              document.addEventListener('click', this.#handler);
            }
            disconnectedCallback() {
              window.removeEventListener('click', this.#handler);
            }
          }
        `,
        errors: [{ messageId: 'missing-cleanup', data: { target: 'document', event: "'click'" } }]
      }
    ]
  });
});
