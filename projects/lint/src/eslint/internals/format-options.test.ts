// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it } from 'vitest';
import { RuleTester, type Rule } from 'eslint';
import htmlParser from '@html-eslint/parser';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import type { HtmlTagNode } from '../rule-types.js';
import { checkFormatLocale, reportFormatOption } from './format-options.js';

function rule(check: (context: Rule.RuleContext, node: HtmlTagNode) => void) {
  return {
    meta: { schema: [], messages: { 'invalid-option': '{{tagName}}: {{attribute}}={{value}} ({{reason}})' } },
    create(context: Rule.RuleContext) {
      return createVisitors(context, {
        Tag(node: HtmlTagNode) {
          check(context, node);
        }
      });
    }
  };
}

describe('checkFormatLocale', () => {
  it('reports invalid literal locales and leaves valid or dynamic locales unchecked', () => {
    const tester = new RuleTester({ languageOptions: { parser: htmlParser } });
    tester.run('locale', rule(checkFormatLocale), {
      valid: [
        '<nve-format-number></nve-format-number>',
        '<nve-format-number locale="en-US"></nve-format-number>',
        '<nve-format-number :locale="locale"></nve-format-number>',
        '<nve-format-number locale="{{locale}}"></nve-format-number>'
      ],
      invalid: ['en_US', ''].map(locale => ({
        code: `<nve-format-number locale="${locale}"></nve-format-number>`,
        errors: [{ messageId: 'invalid-option', column: 20 }]
      }))
    });
  });
});

describe('reportFormatOption', () => {
  it('reports at the option attribute or tag when absent and skips dynamic values', () => {
    const tester = new RuleTester({ languageOptions: { parser: htmlParser } });
    tester.run(
      'option',
      rule((context, node) => reportFormatOption(context, node, { attribute: 'style', reason: 'unsupported' })),
      {
        valid: ['<nve-format-number :style="style"></nve-format-number>'],
        invalid: [
          {
            code: '<nve-format-number style="unknown"></nve-format-number>',
            errors: [{ message: 'nve-format-number: style=unknown (unsupported)', column: 20 }]
          },
          {
            code: '<nve-format-number></nve-format-number>',
            errors: [{ messageId: 'invalid-option', column: 1 }]
          }
        ]
      }
    );
  });
});
