// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

const TYPOGRAPHY_ELEMENTS: Record<string, string> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading',
  p: 'body',
  ul: 'list',
  ol: 'list',
  code: 'code'
};

const STYLING_ATTRIBUTES = ['nve-text', 'class', 'style'];

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Require typography elements to have nve-text styling applied.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unstyled-typography']:
        '<{{element}}> is missing text styling. Add nve-text="{{nveTextValue}}" or a class attribute.',
      ['suggest-add-nve-text']: 'Add nve-text="{{nveTextValue}}" to the element'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();
        const nveTextValue = TYPOGRAPHY_ELEMENTS[tagName];
        if (!nveTextValue) return;

        const hasStyleAttr = STYLING_ATTRIBUTES.some(attr => findAttr(node, attr));
        if (hasStyleAttr) return;

        context.report({
          node,
          messageId: 'unstyled-typography',
          data: { element: tagName, nveTextValue },
          suggest: [
            {
              messageId: 'suggest-add-nve-text',
              data: { nveTextValue },
              fix: fixer => {
                const openTag = node.openStart;
                return fixer.insertTextAfterRange([openTag.range[0], openTag.range[1]], ` nve-text="${nveTextValue}"`);
              }
            }
          ]
        });
      }
    });
  }
} as const;

export default rule;
