// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const MAX_EMPHASIS_BUTTONS = 2;

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Limit primary actions to two per page.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
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
        if (node.name.toLowerCase() !== 'nve-button') {
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
