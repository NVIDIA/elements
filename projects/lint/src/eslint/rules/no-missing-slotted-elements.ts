// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { hasMatchingChild, hasTemplateSyntax } from '../internals/utils.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const REQUIRED_SLOTTED_ELEMENTS = {
  'nve-input': {
    required: ['input']
  },
  'nve-combobox': {
    required: ['input[type="search"]', 'datalist, select']
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
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [{ type: 'object' }],
    messages: {
      ['unexpected-missing-slotted-element']: 'Unexpected use of missing slotted element {{selector}}'
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

        // Check each required selector
        for (const requiredSelector of required) {
          const selectors = requiredSelector.split(',').map((s: string) => s.trim());
          const hasRequiredElement = selectors.some((sel: string) => hasMatchingChild(node, sel));

          if (!hasRequiredElement) {
            context.report({
              node: node,
              messageId: 'unexpected-missing-slotted-element',
              data: {
                selector: requiredSelector
              }
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
