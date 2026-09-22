// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { defineRuleDocumentation } from '../rule-documentation.js';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

const POPOVER_API_REPLACEMENT = 'native HTML popover API';
const DEPRECATED_POPOVER_ATTRIBUTES: Record<string, Record<string, string>> = {
  'nve-dialog': {
    trigger: POPOVER_API_REPLACEMENT,
    'behavior-trigger': POPOVER_API_REPLACEMENT
  },
  'nve-tooltip': {
    trigger: POPOVER_API_REPLACEMENT,
    'behavior-trigger': POPOVER_API_REPLACEMENT,
    'open-delay': '`interest-delay-start` CSS property'
  },
  'nve-toggletip': {
    trigger: POPOVER_API_REPLACEMENT,
    'behavior-trigger': POPOVER_API_REPLACEMENT
  },
  'nve-toast': {
    trigger: POPOVER_API_REPLACEMENT,
    'behavior-trigger': POPOVER_API_REPLACEMENT
  },
  'nve-drawer': {
    trigger: POPOVER_API_REPLACEMENT,
    'behavior-trigger': POPOVER_API_REPLACEMENT
  },
  'nve-dropdown': {
    trigger: POPOVER_API_REPLACEMENT,
    'behavior-trigger': POPOVER_API_REPLACEMENT
  },
  'nve-notification': {
    trigger: POPOVER_API_REPLACEMENT,
    'behavior-trigger': POPOVER_API_REPLACEMENT
  }
} as const;

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-deprecated-popover-attributes',
      description: 'Disallow use of deprecated popover attributes.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-dialog id="dialog"></nve-dialog>',
        invalid: '<nve-dialog trigger></nve-dialog>'
      }
    }),
    schema: [],
    messages: {
      ['unexpected-deprecated-popover-attribute']:
        'Unexpected use of deprecated popover attribute {{attribute}}. Use {{replacement}} instead.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        Object.entries(DEPRECATED_POPOVER_ATTRIBUTES).forEach(([tag, attributes]) => {
          if (node.name === tag) {
            Object.entries(attributes).forEach(([attribute, replacement]) => {
              const attr = findAttr(node, attribute);
              if (attr) {
                context.report({
                  node: attr,
                  data: {
                    attribute,
                    replacement
                  },
                  messageId: 'unexpected-deprecated-popover-attribute'
                });
              }
            });
          }
        });
      }
    });
  }
} as const;

export default rule;
