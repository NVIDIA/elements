// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { hasMatchingChild, hasTemplateSyntax, hasUnslottedContent } from '../internals/utils.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

interface RequiredSlotConfig {
  required?: string[];
  requiresDefaultSlotContent?: boolean;
}

const REQUIRED_SLOTTED_ELEMENTS: Record<string, RequiredSlotConfig> = {
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
  'nve-logo': {
    requiresDefaultSlotContent: true
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
  },
  'nve-tree-node': {
    requiresDefaultSlotContent: true
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
      ['unexpected-missing-slotted-element']: 'Unexpected use of missing slotted element {{selector}}',
      ['missing-default-slot-content']: 'Element <{{tagName}}> requires default slot content.'
    }
  },
  create(context: Rule.RuleContext) {
    function getRequirements(node: HtmlTagNode): {
      required: string[];
      requiresDefaultSlotContent: boolean;
      tagName: string;
    } {
      const options = context.options[0] ?? {};
      const tagName = node.name.toLowerCase();
      const config = REQUIRED_SLOTTED_ELEMENTS[tagName];
      const required = [...(config?.required ?? []), ...(options[tagName]?.required ?? [])];
      const requiresDefaultSlotContent = config?.requiresDefaultSlotContent ?? false;
      return { required, requiresDefaultSlotContent, tagName };
    }

    function checkRequiredSelectors(node: HtmlTagNode, required: string[]) {
      for (const requiredSelector of required) {
        const selectors = requiredSelector.split(',').map((s: string) => s.trim());
        const hasRequiredElement = selectors.some((sel: string) => hasMatchingChild(node, sel));

        if (!hasRequiredElement) {
          context.report({
            node: node,
            messageId: 'unexpected-missing-slotted-element',
            data: { selector: requiredSelector }
          });
        }
      }
    }

    function checkDefaultSlotContent(node: HtmlTagNode, tagName: string) {
      if (!hasUnslottedContent(node)) {
        context.report({
          node: node,
          messageId: 'missing-default-slot-content',
          data: { tagName }
        });
      }
    }

    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const { required, requiresDefaultSlotContent, tagName } = getRequirements(node);

        if ((!required.length && !requiresDefaultSlotContent) || hasTemplateSyntax(node)) {
          return;
        }

        if (requiresDefaultSlotContent) {
          checkDefaultSlotContent(node, tagName);
        }

        checkRequiredSelectors(node, required);
      }
    });
  }
} as const;

export default rule;
