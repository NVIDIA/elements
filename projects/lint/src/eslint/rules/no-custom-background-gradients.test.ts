// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import css from '@eslint/css';
import noCustomBackgroundGradients from './no-custom-background-gradients.js';

describe('noCustomBackgroundGradients', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      language: 'css/css',
      languageOptions: { tolerant: true },
      plugins: { css }
    });
  });

  it('should define rule metadata', () => {
    expect(noCustomBackgroundGradients.meta.docs.description).toBe('Disallow custom gradients in CSS backgrounds.');
    expect(noCustomBackgroundGradients.meta.docs.recommended).toBe(false);
  });

  it('should disallow gradients in background declarations', () => {
    tester.run('no-custom-background-gradients', noCustomBackgroundGradients as unknown as JSRuleDefinition, {
      valid: [
        '.surface { background: var(--nve-sys-background); }',
        '.surface { background-image: url("linear-gradient(icon).svg"); }',
        '.surface { --background: url("linear-gradient(icon).svg"); }',
        '.surface { mask-image: linear-gradient(black, transparent); }'
      ],
      invalid: [
        {
          code: '.surface { background: linear-gradient(#000, #fff); }',
          errors: [{ messageId: 'custom-background-gradient' }]
        },
        {
          code: '.surface { background-image: radial-gradient(#000, #fff); }',
          errors: [{ messageId: 'custom-background-gradient' }]
        },
        {
          code: '.surface { background: repeating-conic-gradient(#000, #fff); }',
          errors: [{ messageId: 'custom-background-gradient' }]
        },
        {
          code: '.surface { --background: linear-gradient(#000, #fff); }',
          errors: [{ messageId: 'custom-background-gradient' }]
        }
      ]
    });
  });
});
