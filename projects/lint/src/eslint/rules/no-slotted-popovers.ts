// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { elements } from '../internals/metadata.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

const POPOVER_ELEMENTS: ReadonlySet<string> = new Set(
  elements.filter(element => element.manifest?.metadata?.behavior === 'popover').map(element => element.name)
);

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow the slot attribute on popover elements.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['no-slotted-popover']:
        'Unexpected slot attribute on popover element <{{tag}}>. Named slots on a popover can cause rendering issues or hide it unexpectedly. Remove the slot attribute.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (!POPOVER_ELEMENTS.has(node.name?.toLowerCase() ?? '')) return;
        const slotAttr = findAttr(node, 'slot');
        if (!slotAttr) return;
        context.report({
          node: slotAttr,
          messageId: 'no-slotted-popover',
          data: { tag: node.name }
        });
      }
    });
  }
} as const;

export default rule;
