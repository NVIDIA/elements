import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import css from '@eslint/css';
import noUnknownCssVariable from './no-unknown-css-variable.js';

const rule = noUnknownCssVariable as unknown as JSRuleDefinition;

describe('noUnknownCssVariable', () => {
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
    expect(noUnknownCssVariable.meta).toBeDefined();
    expect(noUnknownCssVariable.meta.type).toBe('problem');
    expect(noUnknownCssVariable.meta.docs).toBeDefined();
    expect(noUnknownCssVariable.meta.docs.description).toBe('Disallow use of unknown --nve-* CSS theme variables.');
    expect(noUnknownCssVariable.meta.docs.category).toBe('Best Practice');
    expect(noUnknownCssVariable.meta.docs.recommended).toBe(true);
    expect(noUnknownCssVariable.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noUnknownCssVariable.meta.schema).toBeDefined();
    expect(noUnknownCssVariable.meta.messages).toBeDefined();
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
        }
      ]
    });
  });
});
