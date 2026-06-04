// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import css from '@eslint/css';
import html from '@html-eslint/eslint-plugin';
import noDeprecatedCssVariable from './no-deprecated-css-variable.js';

const rule = noDeprecatedCssVariable as unknown as JSRuleDefinition;

describe('noDeprecatedCssVariable', () => {
  it('should define rule metadata', () => {
    expect(noDeprecatedCssVariable.meta).toBeDefined();
    expect(noDeprecatedCssVariable.meta.type).toBe('problem');
    expect(noDeprecatedCssVariable.meta.docs).toBeDefined();
    expect(noDeprecatedCssVariable.meta.docs.description).toBe('Disallow use of deprecated CSS custom properties.');
    expect(noDeprecatedCssVariable.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedCssVariable.meta.docs.recommended).toBe(true);
    expect(noDeprecatedCssVariable.meta.docs.url).toContain('/docs/lint/');
    expect(noDeprecatedCssVariable.meta.schema).toBeDefined();
    expect(noDeprecatedCssVariable.meta.messages).toBeDefined();
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

    it('should allow valid use of CSS custom properties', () => {
      tester.run('should allow valid use of CSS custom properties', rule, {
        valid: [
          ':root { margin: var(--nve-ref-space-md); }',
          ':root { gap: var(--nve-ref-space-md); }',
          ':root { color: var(--ui-color-primary); }',
          ':root { color: var(--mlv-custom-color-primary); }',
          ':root { margin: 1000px; }',
          ':root { color: blue; }',
          'nve-menu-item { --border-background: red; }',
          '.custom { --border-background: red; }'
        ],
        invalid: []
      });
    });

    it('should not allow deprecated theme custom properties', () => {
      tester.run('should not allow deprecated theme custom properties', rule, {
        valid: [],
        invalid: [
          {
            code: ':root { margin: var(--mlv-ref-space-md); }',
            output: ':root { margin: var(--nve-ref-space-md); }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--mlv-ref-space-md', alternative: '--nve-ref-space-md' }
              }
            ]
          }
        ]
      });
    });

    it('should not allow deprecated breadcrumb custom properties', () => {
      tester.run('should not allow deprecated breadcrumb custom properties', rule, {
        valid: [],
        invalid: [
          {
            code: 'nve-breadcrumb { --breadcrumb-height: 32px; color: var(--item-color); }',
            output: 'nve-breadcrumb { --height: 32px; color: var(--color); }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--breadcrumb-height', alternative: '--height' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-color', alternative: '--color' }
              }
            ]
          },
          {
            code: 'nve-breadcrumb { --item-active-color: red; --item-active-font-weight: 700; }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-active-color', alternative: 'active breadcrumb item styles' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--item-active-font-weight', alternative: 'active breadcrumb item styles' }
              }
            ]
          }
        ]
      });
    });

    it('should not allow deprecated tabs indicator custom properties', () => {
      tester.run('should not allow deprecated tabs indicator custom properties', rule, {
        valid: [],
        invalid: [
          {
            code: 'nve-tabs-item { --border-background: red; --border-height: 4px; --border-width: 100%; --border-top: 0; }',
            output:
              'nve-tabs-item { --indicator-background: red; --indicator-height: 4px; --border-width: 100%; --border-top: 0; }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-background', alternative: '--indicator-background' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-height', alternative: '--indicator-height' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-width', alternative: 'the nve-tabs selected indicator' }
              },
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-top', alternative: 'the nve-tabs selected indicator' }
              }
            ]
          },
          {
            code: 'nve-tabs { color: var(--border-background); }',
            output: 'nve-tabs { color: var(--indicator-background); }',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-background', alternative: '--indicator-background' }
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

    it('should allow valid inline custom properties', () => {
      tester.run('should allow valid inline custom properties', rule, {
        valid: [
          '<nve-breadcrumb style="--height: 32px;"></nve-breadcrumb>',
          '<nve-tabs style="--indicator-background: red;"></nve-tabs>',
          '<nve-menu-item style="--border-background: red;"></nve-menu-item>'
        ],
        invalid: []
      });
    });

    it('should not allow deprecated inline custom properties', () => {
      tester.run('should not allow deprecated inline custom properties', rule, {
        valid: [],
        invalid: [
          {
            code: '<nve-breadcrumb style="--breadcrumb-height: 32px;"></nve-breadcrumb>',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--breadcrumb-height', alternative: '--height' }
              }
            ]
          },
          {
            code: '<nve-tabs-item style="--border-background: red;"></nve-tabs-item>',
            errors: [
              {
                messageId: 'deprecated-css-var',
                data: { value: '--border-background', alternative: '--indicator-background' }
              }
            ]
          }
        ]
      });
    });
  });
});
