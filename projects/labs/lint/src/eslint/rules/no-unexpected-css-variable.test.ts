import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import css from '@eslint/css';
import noUnexpectedCssVariable from './no-unexpected-css-variable.js';

describe('noUnexpectedCssVariable', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      language: 'css/css',
      languageOptions: {
        tolerant: true
      },
      plugins: {
        css
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noUnexpectedCssVariable.meta).toBeDefined();
    expect(noUnexpectedCssVariable.meta.type).toBe('problem');
    expect(noUnexpectedCssVariable.meta.docs).toBeDefined();
    expect(noUnexpectedCssVariable.meta.docs.description).toBe('Do not allow use of invalid CSS theme variables.');
    expect(noUnexpectedCssVariable.meta.docs.category).toBe('Best Practice');
    expect(noUnexpectedCssVariable.meta.docs.recommended).toBe(true);
    expect(noUnexpectedCssVariable.meta.docs.url).toBe('');
    expect(noUnexpectedCssVariable.meta.schema).toBeDefined();
    expect(noUnexpectedCssVariable.meta.messages).toBeDefined();
  });

  it('should report unexpected use of CSS variable - size', () => {
    tester.run(
      'should report unexpected use of CSS variable - size',
      noUnexpectedCssVariable as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { margin: var(--nve-ref-space-100); }', // valid token assignment
          ':root { gap: var(--nve-ref-space-100); }', // valid token assignment
          ':root { margin: 1000px; }', // ignore out of bounds of space scale
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { margin: var(--nve-ref-size-300); }',
            output: ':root { margin: var(--nve-ref-space-sm); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-var',
                data: { value: '--nve-ref-size-300', property: 'margin', alternate: 'var(--nve-ref-space-sm)' }
              }
            ]
          },
          {
            code: ':root { gap: var(--nve-ref-size-300); }',
            output: ':root { gap: var(--nve-ref-space-sm); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-var',
                data: { value: '--nve-ref-size-300', property: 'gap', alternate: 'var(--nve-ref-space-sm)' }
              }
            ]
          },
          {
            code: ':root { margin: var(--nve-ref-size-2000); }',
            errors: [
              // unknown value assignment (invalid token assignment)
              {
                messageId: 'unexpected-css-var',
                data: { value: '--nve-ref-size-2000', property: 'margin', alternate: 'var(--nve-ref-space-*)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS variable - space', () => {
    tester.run(
      'should report unexpected use of CSS variable - space',
      noUnexpectedCssVariable as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { width: var(--nve-ref-size-100); }', // valid token assignment
          ':root { height: var(--nve-ref-size-100); }', // valid token assignment
          ':root { width: 1000px; }', // ignore out of bounds of space scale
          ':root { height: 1000px; }', // ignore out of bounds of space scale
          ':root { color: blue; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { width: var(--nve-ref-space-md); }',
            output: ':root { width: var(--nve-ref-size-400); }',
            errors: [
              // known value assignment
              {
                messageId: 'unexpected-css-var',
                data: { value: '--nve-ref-space-md', property: 'width', alternate: 'var(--nve-ref-size-400)' }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS variable - color', () => {
    tester.run(
      'should report unexpected use of CSS variable - color',
      noUnexpectedCssVariable as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { background: var(--nve-sys-accent-primary-background); }', // valid token assignment
          ':root { width: 12px; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { background: var(--nve-sys-support-accent-color); }',
            errors: [
              {
                messageId: 'unexpected-css-var',
                data: {
                  value: '--nve-sys-support-accent-color',
                  property: 'background',
                  alternate: 'var(--nve-*-background)'
                }
              }
            ]
          }
        ]
      }
    );
  });

  it('should report unexpected use of CSS variable - background', () => {
    tester.run(
      'should report unexpected use of CSS variable - background',
      noUnexpectedCssVariable as unknown as JSRuleDefinition,
      {
        valid: [
          ':root { color: var(--nve-sys-support-accent-color); }', // valid token assignment
          ':root { width: 12px; }' // ignore irrelevant properties
        ],
        invalid: [
          {
            code: ':root { color: var(--nve-sys-accent-primary-background); }',
            errors: [
              {
                messageId: 'unexpected-css-var',
                data: {
                  value: '--nve-sys-accent-primary-background',
                  property: 'color',
                  alternate: 'var(--nve-*-color)'
                }
              }
            ]
          }
        ]
      }
    );
  });
});
