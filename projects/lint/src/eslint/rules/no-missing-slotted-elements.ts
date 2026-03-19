// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { hasMatchingChild, hasTemplateSyntax } from '../internals/utils.js';
import type { HtmlTagNode } from '../rule-types.js';

const REQUIRED_SLOTTED_ELEMENTS = {
  'nve-input': {
    required: ['input']
  },
  'nve-combobox': {
    required: ['input[type="search"]', 'option']
  },
  'nve-date': {
    required: ['input[type="date"]']
  },
  'nve-datetime': {
    required: ['input[type="datetime-local"]']
  },
  'nve-month': {
    required: ['input[type="month"]']
  },
  'nve-week': {
    required: ['input[type="week"]']
  },
  'nve-time': {
    required: ['input[type="time"]']
  },
  'nve-textarea': {
    required: ['textarea']
  },
  'nve-select': {
    required: ['select']
  },
  'nve-search': {
    required: ['input[type="search"]']
  },
  'nve-file': {
    required: ['input[type="file"]']
  },
  'nve-password': {
    required: ['input[type="password"]']
  },
  'nve-color': {
    required: ['input[type="color"]']
  },
  'nve-radio': {
    required: ['input[type="radio"]']
  },
  'nve-radio-group': {
    required: ['nve-radio']
  },
  'nve-checkbox': {
    required: ['input[type="checkbox"]']
  },
  'nve-checkbox-group': {
    required: ['nve-checkbox']
  },
  'nve-range': {
    required: ['input[type="range"]']
  },
  'nve-switch': {
    required: ['input[type="checkbox"]']
  },
  'nve-switch-group': {
    required: ['nve-switch']
  }
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of missing slotted elements.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [{ type: 'object' }],
    messages: {
      ['unexpected-missing-slotted-element']: 'Unexpected use of missing slotted element <{{element}}>'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const options = context.options[0] ?? {};
        const tagName = node.name.toLowerCase();

        const additionalRequirements = options[tagName]?.required ?? [];
        const required = [
          ...(REQUIRED_SLOTTED_ELEMENTS[tagName as keyof typeof REQUIRED_SLOTTED_ELEMENTS]?.required ?? []),
          ...additionalRequirements
        ];

        if (!required.length) {
          return;
        }

        if (hasTemplateSyntax(node)) {
          return;
        }

        // Check each required element
        for (const requiredSelector of required) {
          const hasRequiredElement = hasMatchingChild(node, requiredSelector);

          if (!hasRequiredElement) {
            context.report({
              node: node,
              messageId: 'unexpected-missing-slotted-element',
              data: {
                element: requiredSelector
              }
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
