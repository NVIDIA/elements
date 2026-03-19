// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import css from '@eslint/css';
import noDeprecatedCssImports from './no-deprecated-css-imports.js';

const rule = noDeprecatedCssImports as unknown as JSRuleDefinition;

describe('noDeprecatedCssImports', () => {
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
    expect(noDeprecatedCssImports.meta).toBeDefined();
    expect(noDeprecatedCssImports.meta.type).toBe('problem');
    expect(noDeprecatedCssImports.meta.docs).toBeDefined();
    expect(noDeprecatedCssImports.meta.docs.description).toBe('Disallow use of deprecated CSS import paths.');
    expect(noDeprecatedCssImports.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedCssImports.meta.docs.recommended).toBe(true);
    expect(noDeprecatedCssImports.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noDeprecatedCssImports.meta.schema).toBeDefined();
    expect(noDeprecatedCssImports.meta.messages).toBeDefined();
  });

  it('should allow valid use of CSS import paths', () => {
    tester.run('should allow valid use of CSS import paths', rule, {
      valid: [
        `@import '@nvidia-elements/themes/fonts/inter.css';`,
        `@import '@nvidia-elements/themes/index.css';`,
        `@import '@nvidia-elements/themes/high-contrast.css';`,
        `@import '@nvidia-elements/themes/reduced-motion.css';`,
        `@import '@nvidia-elements/themes/compact.css';`,
        `@import '@nvidia-elements/themes/dark.css';`,
        `@import '@nvidia-elements/themes/debug.css';`,
        `@import '@nvidia-elements/styles/typography.css';`,
        `@import '@nvidia-elements/styles/layout.css';`,
        `@import '@nvidia-elements/styles/view-transitions.css';`
      ],
      invalid: []
    });
  });

  it('should not allow use of deprecated CSS import paths', () => {
    tester.run('should not allow use of deprecated CSS import paths', rule, {
      valid: [],
      invalid: [
        {
          code: `@import '@maglev/elements/index.css';`,
          output: `@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';`,
          errors: [
            {
              messageId: 'deprecated-css-import',
              data: {
                value: '@maglev/elements/index.css',
                alternative: `
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';`.trim()
              }
            }
          ]
        },
        {
          code: `@import '@maglev/elements/css/module.layout.css';`,
          output: `@import '@nvidia-elements/styles/layout.css';`,
          errors: [
            {
              messageId: 'deprecated-css-import',
              data: {
                value: '@maglev/elements/css/module.layout.css',
                alternative: `@import '@nvidia-elements/styles/layout.css';`.trim()
              }
            }
          ]
        },
        {
          code: `@import '@maglev/elements/css/module.typography.css';`,
          output: `@import '@nvidia-elements/styles/typography.css';`,
          errors: [
            {
              messageId: 'deprecated-css-import',
              data: {
                value: '@maglev/elements/css/module.typography.css',
                alternative: `@import '@nvidia-elements/styles/typography.css';`.trim()
              }
            }
          ]
        }
      ]
    });
  });

  it('should fix deprecated imports while preserving valid imports', () => {
    tester.run('should fix deprecated imports while preserving valid imports', rule, {
      valid: [],
      invalid: [
        {
          code: `@import '@nvidia-elements/themes/fonts/inter.css';
@import '@maglev/elements/css/module.layout.css';
@import '@nvidia-elements/themes/dark.css';`,
          output: `@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/themes/dark.css';`,
          errors: [
            {
              messageId: 'deprecated-css-import',
              data: {
                value: '@maglev/elements/css/module.layout.css',
                alternative: `@import '@nvidia-elements/styles/layout.css';`.trim()
              }
            }
          ]
        }
      ]
    });
  });
});
