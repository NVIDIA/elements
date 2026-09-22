// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { getAllowedSlottedElements } from '../internals/slotted-elements.js';
import { getSlotAssignment } from '../internals/slots.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

const STATIC_TAG_NAME = /^[a-z][a-z0-9.-]*$/;

interface SlottedElementContract {
  allowedElements: readonly string[];
  parentTagName: string;
}

function isMarkdownInlineCode(context: Rule.RuleContext, node: HtmlTagNode): boolean {
  if (!context.filename.endsWith('.md')) {
    return false;
  }
  return context.sourceCode.getText()[node.openStart.range[0] - 1] === '`';
}

function isDocumentedGridScroller(parentTagName: string, node: HtmlTagNode): boolean {
  return parentTagName === 'nve-grid' && Boolean(findAttr(node, 'scroller'));
}

function shouldIgnoreChild(context: Rule.RuleContext, contract: SlottedElementContract, child: HtmlTagNode): boolean {
  const childTagName = child.name.toLowerCase();
  return (
    !STATIC_TAG_NAME.test(childTagName) ||
    isMarkdownInlineCode(context, child) ||
    getSlotAssignment(child).kind !== 'default' ||
    childTagName === 'template' ||
    contract.allowedElements.includes(childTagName) ||
    isDocumentedGridScroller(contract.parentTagName, child)
  );
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow invalid direct slotted elements in Elements components.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['invalid-slotted-element']:
        'Invalid direct child <{{child}}> in <{{parent}}>. Allowed default-slot elements: {{allowed}}.'
    }
  },
  create(context: Rule.RuleContext) {
    function validateChild(contract: SlottedElementContract, child: HtmlTagNode): void {
      const childTagName = child.name.toLowerCase();
      if (shouldIgnoreChild(context, contract, child)) {
        return;
      }

      if (childTagName === 'ng-container') {
        for (const nestedChild of child.children ?? []) {
          if (nestedChild.type === 'Tag') {
            validateChild(contract, nestedChild);
          }
        }
        return;
      }

      context.report({
        node: child,
        messageId: 'invalid-slotted-element',
        data: {
          allowed: contract.allowedElements.join(', '),
          child: childTagName,
          parent: contract.parentTagName
        }
      });
    }

    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const parentTagName = node.name.toLowerCase();
        const allowedElements = getAllowedSlottedElements(parentTagName);
        if (!allowedElements || isMarkdownInlineCode(context, node)) {
          return;
        }

        const contract = { allowedElements, parentTagName };
        for (const child of node.children ?? []) {
          if (child.type === 'Tag') {
            validateChild(contract, child);
          }
        }
      }
    });
  }
} as const;

export default rule;
