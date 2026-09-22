// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { defineRuleDocumentation } from '../rule-documentation.js';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { elements } from '../internals/metadata.js';
import type { HtmlTagNode } from '../rule-types.js';

const MAX_EMPHASIS_BUTTONS = 2;
const POPOVER_ELEMENTS: ReadonlySet<string> = new Set(
  elements
    .filter(element => element.manifest?.metadata?.behavior === 'popover')
    .map(element => element.name.toLowerCase())
);

function hasPopoverAncestor(node: HtmlTagNode): boolean {
  let current = node.parent;

  while (current) {
    if (current.name && POPOVER_ELEMENTS.has(current.name.toLowerCase())) {
      return true;
    }
    current = current.parent;
  }

  return false;
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-excessive-primary-actions',
      description: 'Limit primary actions to two per page.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-page><nve-button interaction="emphasis">Save</nve-button></nve-page>',
        invalid:
          '<nve-page><nve-button interaction="emphasis">Save</nve-button><nve-button interaction="emphasis">Publish</nve-button><nve-button interaction="emphasis">Deploy</nve-button></nve-page>'
      }
    }),
    schema: [],
    messages: {
      ['excessive-primary-action']:
        'Limit primary actions to {{max}} per page. Reserve interaction="emphasis" for primary calls to action.'
    }
  },
  create(context: Rule.RuleContext) {
    let emphasisButtonCount = 0;

    return createVisitors(context, {
      Document() {
        emphasisButtonCount = 0;
      },
      Tag(node: HtmlTagNode) {
        if (node.name.toLowerCase() !== 'nve-button' || hasPopoverAncestor(node)) {
          return;
        }

        const interaction = findAttr(node, 'interaction');
        if (interaction?.value?.value !== 'emphasis') {
          return;
        }

        emphasisButtonCount += 1;
        if (emphasisButtonCount <= MAX_EMPHASIS_BUTTONS) {
          return;
        }

        context.report({
          node: interaction,
          messageId: 'excessive-primary-action',
          data: { max: String(MAX_EMPHASIS_BUTTONS) }
        });
      }
    });
  }
} as const;

export default rule;
