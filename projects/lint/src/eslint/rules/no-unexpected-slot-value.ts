// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { getRecommendedSlotName, hasDefaultSlot, isKnownElement, hasSlot } from '../internals/slots.js';
import { hasTemplateSyntax, isNVElement } from '../internals/utils.js';
import type { HtmlAttribute, HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
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
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
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
    function buildSlotSuggestion(slotAttr: HtmlAttribute, slotName: string, alternative: string | undefined) {
      if (alternative === '') {
        return [
          {
            messageId: 'suggest-remove-slot-value',
            data: { slotName, alternative },
            fix: (fixer: Rule.RuleFixer) => fixer.replaceText(slotAttr as unknown as Rule.Node, '')
          }
        ];
      }
      if (alternative) {
        return [
          {
            messageId: 'suggest-replace-slot-value',
            data: { slotName, alternative },
            fix: (fixer: Rule.RuleFixer) =>
              fixer.replaceText(
                slotAttr as unknown as Rule.Node,
                `slot=${slotAttr.startWrapper?.value ?? '"'}${alternative}${slotAttr.endWrapper?.value ?? '"'}`
              )
          }
        ];
      }
      return [];
    }

    function checkInvalidSlotValue(node: HtmlTagNode) {
      const slotAttr = findAttr(node, 'slot');
      const slotName = slotAttr?.value?.value ?? '';
      const parentTagName = node.parent?.name;
      if (!slotAttr || !parentTagName || !isNVElement(parentTagName) || hasSlot(parentTagName, slotName)) return;
      const alternative = getRecommendedSlotName(slotName, parentTagName);
      context.report({
        node: slotAttr,
        data: { slotName, tagName: node.name, parentTagName },
        messageId: 'unexpected-slot-value',
        suggest: buildSlotSuggestion(slotAttr as unknown as HtmlAttribute, slotName, alternative)
      });
    }

    function checkMissingDefaultSlot(node: HtmlTagNode) {
      if (!isNVElement(node.name) || !isKnownElement(node.name) || hasDefaultSlot(node.name)) return;
      if (hasTemplateSyntax(node) || !hasUnslottedContent(node)) return;
      context.report({ node, data: { tagName: node.name }, messageId: 'no-default-slot' });
    }

    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        checkInvalidSlotValue(node);
        checkMissingDefaultSlot(node);
      }
    });
  }
} as const;

export default rule;
