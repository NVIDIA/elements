// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import css from '@eslint/css';
import noDeprecatedCssVariable from './no-deprecated-css-variable.js';

const rule = noDeprecatedCssVariable as unknown as JSRuleDefinition;

describe('noDeprecatedCssVariable', () => {
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
    expect(noDeprecatedCssVariable.meta).toBeDefined();
    expect(noDeprecatedCssVariable.meta.type).toBe('problem');
    expect(noDeprecatedCssVariable.meta.docs).toBeDefined();
    expect(noDeprecatedCssVariable.meta.docs.description).toBe(
      'Disallow use of deprecated --mlv-* CSS theme variables.'
    );
    expect(noDeprecatedCssVariable.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedCssVariable.meta.docs.recommended).toBe(true);
    expect(noDeprecatedCssVariable.meta.docs.url).toContain('/docs/lint/');
    expect(noDeprecatedCssVariable.meta.schema).toBeDefined();
    expect(noDeprecatedCssVariable.meta.messages).toBeDefined();
  });

  it('should allow valid use of CSS custom properties', () => {
    tester.run('should allow valid use of CSS custom properties', rule, {
      valid: [
        ':root { margin: var(--nve-ref-space-md); }',
        ':root { gap: var(--nve-ref-space-md); }',
        ':root { color: var(--ui-color-primary); }',
        ':root { color: var(--mlv-custom-color-primary); }',
        ':root { margin: 1000px; }',
        ':root { color: blue; }'
      ],
      invalid: []
    });
  });

  it('should not allow use of deprecated CSS custom properties', () => {
    tester.run('should not allow use of deprecated CSS custom properties', rule, {
      valid: [],
      invalid: [
        {
          code: ':root { margin: var(--mlv-ref-space-md); }',
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
});
