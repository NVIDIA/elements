// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const restrictedProperties = ['height', 'min-height', 'max-height', 'width', 'min-width', 'max-width'];

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow custom height or width styles on nve-page.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['no-restricted-page-sizing']:
        'Unexpected "{{property}}" style on <nve-page>. The page component manages its own sizing. Use the "document-scroll" attribute for document-level scrolling.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (node.name !== 'nve-page') {
          return;
        }

        const styleAttr = findAttr(node, 'style');
        if (!styleAttr?.value?.value) {
          return;
        }

        const styleValue = styleAttr.value.value;
        for (const prop of restrictedProperties) {
          const pattern = new RegExp(`(^|;|\\s)${prop}\\s*:`);
          if (pattern.test(styleValue)) {
            context.report({
              node: styleAttr,
              messageId: 'no-restricted-page-sizing',
              data: { property: prop }
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
