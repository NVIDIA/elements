import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import css from '@eslint/css';
import html from '@html-eslint/eslint-plugin';
import noUnknownCssVariable from './no-unknown-css-variable.js';

const rule = noUnknownCssVariable as unknown as JSRuleDefinition;

describe('noUnknownCssVariable', () => {
  it('should define rule metadata', () => {
    expect(noUnknownCssVariable.meta).toBeDefined();
    expect(noUnknownCssVariable.meta.type).toBe('problem');
    expect(noUnknownCssVariable.meta.docs).toBeDefined();
    expect(noUnknownCssVariable.meta.docs.description).toBe('Disallow use of unknown --nve-* CSS theme variables.');
    expect(noUnknownCssVariable.meta.docs.category).toBe('Best Practice');
    expect(noUnknownCssVariable.meta.docs.recommended).toBe(true);
    expect(noUnknownCssVariable.meta.docs.url).toContain('/docs/lint/');
    expect(noUnknownCssVariable.meta.schema).toBeDefined();
    expect(noUnknownCssVariable.meta.messages).toBeDefined();
  });

  describe('css', () => {
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

    it('should allow valid theme variables', () => {
      tester.run('should allow valid theme variables', rule, {
        valid: [':root { margin: var(--nve-ref-space-md); }', ':root { color: blue; }'],
        invalid: []
      });
    });

    it('should report unknown use of CSS variable', () => {
      tester.run('should report unknown use of CSS variable', rule, {
        valid: [],
        invalid: [
          {
            code: ':root { margin: var(--nve-ref-space-300); }',
            errors: [
              {
                messageId: 'unknown-css-var',
                data: { value: '--nve-ref-space-300' }
              }
            ]
          },
          {
            code: ':root { background: var(--nve-sys-accent-primary-background-color); }',
            errors: [
              {
                messageId: 'unknown-css-var',
                data: { value: '--nve-sys-accent-primary-background-color' }
              }
            ]
          },
          {
            code: ':root { --nve-invalid-token: red; }',
            errors: [
              {
                messageId: 'unknown-css-var',
                data: { value: '--nve-invalid-token' }
              }
            ]
          }
        ]
      });
    });
  });

  describe('html', () => {
    let tester: RuleTester;

    beforeEach(() => {
      tester = new RuleTester({
        language: 'html/html',
        languageOptions: {
          tolerant: true
        },
        plugins: {
          html
        }
      });
    });

    it('should allow valid theme variables in style tags', () => {
      tester.run('should allow valid theme variables in style tags', rule, {
        valid: ['<style>:root { margin: var(--nve-ref-space-md); }</style>', '<style>:root { color: blue; }</style>'],
        invalid: []
      });
    });

    it('should allow valid theme variables in style attributes', () => {
      tester.run('should allow valid theme variables in style attributes', rule, {
        valid: [
          '<div style="margin: var(--nve-ref-space-md);"></div>',
          '<div style="color: blue;"></div>',
          '<div></div>'
        ],
        invalid: []
      });
    });

    it('should report unknown variable references in style tags', () => {
      tester.run('should report unknown variable references in style tags', rule, {
        valid: [],
        invalid: [
          {
            code: '<style>:root { margin: var(--nve-ref-space-300); }</style>',
            errors: [{ messageId: 'unknown-css-var', data: { value: '--nve-ref-space-300' } }]
          },
          {
            code: '<style>:root { background: var(--nve-sys-accent-primary-background-color); }</style>',
            errors: [{ messageId: 'unknown-css-var', data: { value: '--nve-sys-accent-primary-background-color' } }]
          }
        ]
      });
    });

    it('should report unknown variable assignments in style tags', () => {
      tester.run('should report unknown variable assignments in style tags', rule, {
        valid: [],
        invalid: [
          {
            code: '<style>:root { --nve-invalid-token: red; }</style>',
            errors: [{ messageId: 'unknown-css-var', data: { value: '--nve-invalid-token' } }]
          }
        ]
      });
    });

    it('should report unknown variable references in style attributes', () => {
      tester.run('should report unknown variable references in style attributes', rule, {
        valid: [],
        invalid: [
          {
            code: '<div style="margin: var(--nve-ref-space-300);"></div>',
            errors: [{ messageId: 'unknown-css-var', data: { value: '--nve-ref-space-300' } }]
          },
          {
            code: '<div style="background: var(--nve-sys-accent-primary-background-color);"></div>',
            errors: [{ messageId: 'unknown-css-var', data: { value: '--nve-sys-accent-primary-background-color' } }]
          }
        ]
      });
    });

    it('should report unknown variable assignments in style attributes', () => {
      tester.run('should report unknown variable assignments in style attributes', rule, {
        valid: [],
        invalid: [
          {
            code: '<div style="--nve-invalid-token: red;"></div>',
            errors: [{ messageId: 'unknown-css-var', data: { value: '--nve-invalid-token' } }]
          }
        ]
      });
    });
  });
});
