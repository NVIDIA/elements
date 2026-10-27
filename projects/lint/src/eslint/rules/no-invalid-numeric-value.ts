// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { getLiteralFormatInput } from '../internals/format-input.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

const NUMERIC_ATTRIBUTES = new Map([
  ['nve-format-number', 'number'],
  ['nve-format-bytes', 'value']
]);

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-invalid-numeric-value',
      description: 'Require finite numeric input for number and byte formatting elements.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-format-number>1234.56</nve-format-number>',
        invalid: '<nve-format-number>not-a-number</nve-format-number>'
      }
    }),
    schema: [],
    messages: {
      ['invalid-numeric-value']: 'Invalid numeric value "{{value}}" for <{{tagName}}>. Use a finite number.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();
        const attributeName = NUMERIC_ATTRIBUTES.get(tagName);
        if (!attributeName) return;
        const input = getLiteralFormatInput(node, attributeName);
        if (!input || Number.isFinite(Number(input.value))) return;

        context.report({
          node: input.node,
          messageId: 'invalid-numeric-value',
          data: { tagName, value: input.value }
        });
      }
    });
  }
} as const;

export default rule;
