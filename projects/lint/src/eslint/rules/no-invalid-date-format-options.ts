// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { getLiteralFormatAttribute } from '../internals/format-input.js';
import { checkFormatLocale, reportFormatOption } from '../internals/format-options.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

function checkTimeZone(context: Rule.RuleContext, node: HtmlTagNode) {
  const timeZone = getLiteralFormatAttribute(node, 'time-zone');
  // The component omits empty time zones from both preset and granular options.
  if (!timeZone?.value) return;
  try {
    new Intl.DateTimeFormat('en', { timeZone: timeZone.value });
  } catch (error) {
    reportFormatOption(context, node, {
      attribute: 'time-zone',
      reason: error instanceof Error ? error.message : String(error)
    });
  }
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-invalid-date-format-options',
      description: 'Require valid date and relative time formatting options.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-format-datetime locale="en-US" time-zone="UTC">2026-01-01</nve-format-datetime>',
        invalid: '<nve-format-datetime time-zone="Invalid/Zone">2026-01-01</nve-format-datetime>'
      }
    }),
    schema: [],
    messages: {
      ['invalid-option']: 'Invalid {{attribute}} value "{{value}}" on <{{tagName}}>: {{reason}}'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (node.name !== 'nve-format-datetime' && node.name !== 'nve-format-relative-time') return;
        checkFormatLocale(context, node);
        if (node.name === 'nve-format-datetime') checkTimeZone(context, node);
      }
    });
  }
} as const;

export default rule;
