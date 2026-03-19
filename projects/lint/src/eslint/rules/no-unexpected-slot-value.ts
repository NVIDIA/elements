// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { getRecommendedSlotName, hasDefaultSlot, isKnownElement, hasSlot } from '../internals/slots.js';
import { hasTemplateSyntax, isNVElement } from '../internals/utils.js';
import type { HtmlTagNode } from '../rule-types.js';

/**
 * Check if a node has child content that projects into the default slot.
 * This includes non-whitespace text nodes and element nodes without a slot attribute.
 */
function hasUnslottedContent(node: HtmlTagNode): boolean {
  if (!node.children || !Array.isArray(node.children)) {
    return false;
  }

  return node.children.some(child => {
    if (child.type === 'Text' && child.value?.trim()) {
      return true;
    }

    if (child.type === 'Tag' && !findAttr(child, 'slot')) {
      return true;
    }

    return false;
  });
}

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Disallow use of invalid slot values in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-slot-value']: 'Unexpected slot "{{slotName}}" on "{{tagName}}" for element "{{parentTagName}}"',
      ['suggest-replace-slot-value']: 'Replace "{{slotName}}" with "{{alternative}}"',
      ['suggest-remove-slot-value']: 'Remove "{{slotName}}"',
      ['no-default-slot']:
        'Element <{{tagName}}> does not have a default slot. Remove the child content or use a named slot if available.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name;

        // Check for invalid slot attribute values on children of nve-* elements
        const slotAttr = findAttr(node, 'slot');
        const slotName = slotAttr?.value?.value ?? '';
        const parentTagName = node.parent?.name;

        if (slotAttr && parentTagName && isNVElement(parentTagName) && !hasSlot(parentTagName, slotName)) {
          const alternative = getRecommendedSlotName(slotName, parentTagName);
          let suggest = [];

          if (alternative === '') {
            suggest.push({
              messageId: 'suggest-remove-slot-value',
              data: {
                slotName,
                alternative
              },
              fix: (fixer: Rule.RuleFixer) => {
                return fixer.replaceText(slotAttr as unknown as Rule.Node, '');
              }
            });
          } else if (alternative) {
            suggest.push({
              messageId: 'suggest-replace-slot-value',
              data: {
                slotName,
                alternative
              },
              fix: (fixer: Rule.RuleFixer) => {
                return fixer.replaceText(
                  slotAttr as unknown as Rule.Node,
                  `slot=${slotAttr.startWrapper?.value ?? '"'}${alternative}${slotAttr.endWrapper?.value ?? '"'}`
                );
              }
            });
          }

          context.report({
            node: slotAttr,
            data: {
              slotName,
              tagName,
              parentTagName
            },
            messageId: 'unexpected-slot-value',
            suggest
          });
        }

        // Check for unslotted child content on nve-* elements without a default slot
        if (isNVElement(tagName) && isKnownElement(tagName) && !hasDefaultSlot(tagName)) {
          if (!hasTemplateSyntax(node) && hasUnslottedContent(node)) {
            context.report({
              node,
              data: { tagName },
              messageId: 'no-default-slot'
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
