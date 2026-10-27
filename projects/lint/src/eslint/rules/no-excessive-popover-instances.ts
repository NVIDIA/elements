// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { getInstanceContext } from '../internals/instance-context.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

const MAX_INSTANCES = 50;
const POPOVERS = new Set(['nve-tooltip', 'nve-toggletip', 'nve-dropdown', 'nve-dialog', 'nve-toast']);

const rule = {
  meta: {
    type: 'suggestion' as const,
    docs: defineRuleDocumentation({
      name: 'no-excessive-popover-instances',
      description: 'Warn about excessive or repeated popover instances.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-tooltip id="shared">Details</nve-tooltip>',
        invalid: '<div v-for="row in rows"><nve-tooltip>Details</nve-tooltip></div>'
      }
    }),
    schema: [],
    messages: {
      ['repeated-popover']:
        '<{{element}}> is created in repeated content. Consider sharing one popover across triggers to reduce instance overhead.',
      ['excessive-popovers']:
        'This template declares {{count}} <{{element}}> instances (advisory limit {{max}}). Consider sharing or creating popovers on demand.'
    }
  },
  create(context: Rule.RuleContext) {
    const scopes = new Map<object | string, Map<string, HtmlTagNode[]>>();
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();
        if (!POPOVERS.has(tagName)) return;
        const { scope, repeated } = getInstanceContext(context, node);
        if (repeated) {
          context.report({ node, messageId: 'repeated-popover', data: { element: tagName } });
          return;
        }
        if (!scope) return;
        const counts = scopes.get(scope) ?? new Map<string, HtmlTagNode[]>();
        const nodes = counts.get(tagName) ?? [];
        nodes.push(node);
        counts.set(tagName, nodes);
        scopes.set(scope, counts);
      },
      'Program:exit'() {
        for (const counts of scopes.values()) {
          for (const [tagName, nodes] of counts) {
            const node = nodes[MAX_INSTANCES];
            if (!node) continue;
            context.report({
              node,
              messageId: 'excessive-popovers',
              data: { element: tagName, count: String(nodes.length), max: String(MAX_INSTANCES) }
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
