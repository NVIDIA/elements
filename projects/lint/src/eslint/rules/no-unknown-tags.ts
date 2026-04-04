// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import type { HtmlTagNode } from '../rule-types.js';
import { elements } from '../internals/metadata.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of unknown <nve-*> tags.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['unknown-tag']: 'Unexpected use of unknown tag <{{tag}}>'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (!node.name.startsWith('nve-')) {
          return;
        }

        const match = elements.find(e => e.name === node.name);
        if (!match) {
          context.report({
            node,
            data: {
              tag: node.name
            },
            messageId: 'unknown-tag'
          });
        }
      }
    });
  }
} as const;

export default rule;
