// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import type { JSRuleDefinition } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noDeprecatedSlots from './no-deprecated-slots.js';

const rule = noDeprecatedSlots as unknown as JSRuleDefinition;

describe('noDeprecatedAttributes', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      languageOptions: {
        parser: htmlParser,
        parserOptions: {
          frontmatter: true
        }
      }
    });
  });

  it('should define rule metadata', () => {
    expect(noDeprecatedSlots.meta).toBeDefined();
    expect(noDeprecatedSlots.meta.type).toBe('problem');
    expect(noDeprecatedSlots.meta.docs).toBeDefined();
    expect(noDeprecatedSlots.meta.docs.description).toBe('Disallow use of deprecated slot APIs.');
    expect(noDeprecatedSlots.meta.docs.category).toBe('Best Practice');
    expect(noDeprecatedSlots.meta.docs.recommended).toBe(true);
    expect(noDeprecatedSlots.meta.docs.url).toBe('https://NVIDIA.github.io/elements/docs/lint/');
    expect(noDeprecatedSlots.meta.schema).toBeDefined();
    expect(noDeprecatedSlots.meta.messages).toBeDefined();
    expect(noDeprecatedSlots.meta.messages['unexpected-deprecated-slots']).toBe(
      'Unexpected use of deprecated slot "{{slot}}"'
    );
  });

  it('should allow valid use of attributes', () => {
    tester.run('should allow valid use of attributes', rule, {
      valid: [
        `<nve-accordion-header>
          <div slot="prefix">prefix</div>
          <div>content</div>
          <div slot="suffix">suffix</div>
        </nve-accordion-header>`
      ],
      invalid: []
    });
  });

  it('should report unexpected use of deprecated attributes', () => {
    tester.run('unexpected use of deprecated attribute', rule, {
      valid: [],
      invalid: [
        {
          code: `
          <nve-accordion-header>
            <div slot="title">title</div>
            <div slot="subtitle">subtitle</div>
            <div slot="actions">actions</div>
          </nve-accordion-header>`,
          errors: [
            { messageId: 'unexpected-deprecated-slots', data: { slot: 'title' } },
            { messageId: 'unexpected-deprecated-slots', data: { slot: 'subtitle' } },
            { messageId: 'unexpected-deprecated-slots', data: { slot: 'actions' } }
          ]
        }
      ]
    });
  });
});
