// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

const svgElements = [
  'svg',
  'path',
  'g',
  'defs',
  'linearGradient',
  'stop',
  'circle',
  'text',
  'line',
  'ellipse',
  'rect',
  'polygon',
  'polyline',
  'pattern'
];

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of style customization in Elements playground template.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-style-attribute-customization']:
        'Unexpected use of style attribute in template. Avoid custom CSS styles.',
      ['unexpected-style-tag-customization']: 'Unexpected use of style tag in template. Avoid custom CSS styles.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      StyleTag(node: HtmlTagNode) {
        context.report({
          node,
          messageId: 'unexpected-style-tag-customization'
        });
      },
      Tag(node: HtmlTagNode) {
        const match = findAttr(node, 'style');

        // only allow style attribute on svg elements
        if (match && !svgElements.includes(node.name)) {
          context.report({
            node,
            messageId: 'unexpected-style-attribute-customization'
          });
        }
      }
    });
  }
} as const;

export default rule;
