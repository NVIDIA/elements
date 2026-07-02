// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { elements } from '../internals/metadata.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

const COMPACT_CONTAINERS: ReadonlySet<string> = new Set(['nve-page-header', 'nve-toolbar']);
const FORM_CONTROLS: ReadonlySet<string> = new Set(
  elements.filter(element => element.manifest?.metadata?.behavior === 'form').map(element => element.name.toLowerCase())
);

function findAncestor(node: HtmlTagNode | undefined, tags: ReadonlySet<string>): HtmlTagNode | undefined {
  let current = node;
  while (current) {
    if (current.type === 'Tag' && tags.has(current.name.toLowerCase())) {
      return current;
    }
    current = current.parent;
  }
  return undefined;
}

const rule: Rule.RuleModule & { meta: { docs: { category: string } } } = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Prefer aria-label on form controls inside toolbars and page headers.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['prefer-aria-label']:
        'Remove <label> from <{{control}}> inside <{{container}}> and use aria-label instead to preserve the compact layout.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (node.name.toLowerCase() !== 'label') {
          return;
        }

        const control = findAncestor(node.parent, FORM_CONTROLS);
        if (!control) {
          return;
        }

        const container = findAncestor(control.parent, COMPACT_CONTAINERS);
        if (!container) {
          return;
        }

        context.report({
          node,
          messageId: 'prefer-aria-label',
          data: {
            control: control.name.toLowerCase(),
            container: container.name.toLowerCase()
          }
        });
      }
    });
  }
};

export default rule;
