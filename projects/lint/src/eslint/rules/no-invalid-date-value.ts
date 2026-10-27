// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { getLiteralFormatInput } from '../internals/format-input.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

const DATE_ELEMENTS = new Set(['nve-format-datetime', 'nve-format-relative-time']);

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-invalid-date-value',
      description: 'Require valid date input for date formatting elements.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-format-datetime>2026-10-26T12:30:00Z</nve-format-datetime>',
        invalid: '<nve-format-datetime>not-a-date</nve-format-datetime>'
      }
    }),
    schema: [],
    messages: {
      ['invalid-date-value']: 'Invalid date value "{{value}}" for <{{tagName}}>. Use a valid date string.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();
        if (!DATE_ELEMENTS.has(tagName)) return;

        const input = getLiteralFormatInput(node, 'date');
        if (!input || input.value === '' || !Number.isNaN(Date.parse(input.value))) return;

        context.report({
          node: input.node,
          messageId: 'invalid-date-value',
          data: { tagName, value: input.value }
        });
      }
    });
  }
} as const;

export default rule;
