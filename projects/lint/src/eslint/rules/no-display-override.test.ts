// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import css from '@eslint/css';
import noDisplayOverride from './no-display-override.js';

describe('noDisplayOverride', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      language: 'css/css',
      languageOptions: { tolerant: true },
      plugins: { css }
    });
  });

  it('should define rule metadata', () => {
    expect(noDisplayOverride.meta.docs.description).toBe('Disallow display overrides on Elements components.');
    expect(noDisplayOverride.meta.docs.recommended).toBe(true);
  });

  it('should disallow display overrides on Elements components', () => {
    tester.run('no-display-override', noDisplayOverride as unknown as JSRuleDefinition, {
      valid: [
        '.layout { display: grid; }',
        '.layout:has(nve-grid) { display: grid; }',
        ':not(nve-card) { display: grid; }',
        ':is(nve-card, .card) > input { display: grid; }',
        'nve-card { display: none; }',
        'nve-card::part(header) { display: flex; }',
        'nve-card { & > input { display: block; } }'
      ],
      invalid: [
        {
          code: 'nve-card { display: flex; }',
          errors: [{ messageId: 'display-override', data: { value: 'flex' } }]
        },
        {
          code: '.layout > nve-grid { display: block; }',
          errors: [{ messageId: 'display-override', data: { value: 'block' } }]
        },
        {
          code: ':is(nve-card, nve-grid) { display: flex; }',
          errors: [{ messageId: 'display-override', data: { value: 'flex' } }]
        },
        {
          code: ':where(nve-card, .card) { display: grid; }',
          errors: [{ messageId: 'display-override', data: { value: 'grid' } }]
        },
        {
          code: 'nve-card { &:hover { display: grid; } }',
          errors: [{ messageId: 'display-override', data: { value: 'grid' } }]
        }
      ]
    });
  });
});
