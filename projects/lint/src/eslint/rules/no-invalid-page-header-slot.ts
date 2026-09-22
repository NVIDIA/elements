// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { getSlotAssignment, type SlotAssignment } from '../internals/slots.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

function fixSlotAssignment(
  fixer: Rule.RuleFixer,
  node: HtmlTagNode,
  slotAssignment: Extract<SlotAssignment, { kind: 'default' | 'named' }>
): Rule.Fix {
  const slotAttribute = slotAssignment.attribute;
  if (!slotAttribute) {
    return fixer.insertTextAfterRange(node.openStart.range, ' slot="header"');
  }

  const startWrapper = slotAttribute.startWrapper?.value ?? '"';
  const endWrapper = slotAttribute.endWrapper?.value ?? '"';
  return fixer.replaceText(slotAttribute as unknown as Rule.Node, `slot=${startWrapper}header${endWrapper}`);
}

const rule = {
  meta: {
    type: 'problem' as const,
    fixable: 'code' as const,
    docs: defineRuleDocumentation({
      name: 'no-invalid-page-header-slot',
      description: 'Require direct nve-page-header children of nve-page to use slot="header".',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-page><nve-page-header slot="header"></nve-page-header></nve-page>',
        invalid: '<nve-page><nve-page-header></nve-page-header></nve-page>'
      }
    }),
    schema: [],
    messages: {
      ['invalid-page-header-slot']: '<nve-page-header> must use slot="header" when it is a direct child of <nve-page>.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (node.name.toLowerCase() !== 'nve-page-header' || node.parent?.name?.toLowerCase() !== 'nve-page') {
          return;
        }

        const slotAssignment = getSlotAssignment(node);
        if (
          slotAssignment.kind === 'dynamic' ||
          (slotAssignment.kind === 'named' && slotAssignment.name === 'header')
        ) {
          return;
        }

        context.report({
          node: slotAssignment.attribute ?? node,
          messageId: 'invalid-page-header-slot',
          fix: (fixer: Rule.RuleFixer) => fixSlotAssignment(fixer, node, slotAssignment)
        });
      }
    });
  }
} as const;

export default rule;
