// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { defineRuleDocumentation } from '../rule-documentation.js';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

const DEPRECATED_SLOTS = {
  'nve-accordion-header': {
    slots: ['title', 'subtitle', 'actions']
  },
  'nve-card-header': {
    slots: ['title', 'subtitle', 'header-action']
  },
  'nve-progress-ring': {
    slots: ['status-icon']
  }
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-deprecated-slots',
      description: 'Disallow use of deprecated slot APIs.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-accordion-header><span slot="prefix">Info</span></nve-accordion-header>',
        invalid: '<nve-accordion-header><span slot="title">Title</span></nve-accordion-header>'
      }
    }),
    schema: [],
    messages: {
      ['unexpected-deprecated-slots']: 'Unexpected use of deprecated slot "{{slot}}"'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const deprecatedSlotConfig = DEPRECATED_SLOTS[node.name as keyof typeof DEPRECATED_SLOTS];
        if (deprecatedSlotConfig && node.children) {
          node.children.forEach(child => {
            if (child.type === 'Tag') {
              const slotAttr = findAttr(child, 'slot');
              if (slotAttr && deprecatedSlotConfig.slots.includes(slotAttr.value.value)) {
                context.report({
                  node: slotAttr,
                  data: {
                    slot: slotAttr.value.value
                  },
                  messageId: 'unexpected-deprecated-slots'
                });
              }
            }
          });
        }
      }
    });
  }
} as const;

export default rule;
