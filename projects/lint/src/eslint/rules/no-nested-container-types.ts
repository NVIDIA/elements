// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { VALUE_BINDINGS } from '../internals/attributes.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const CONTAINER_RELATIONSHIPS: Record<string, string[]> = {
  'nve-card-content': ['nve-grid', 'nve-accordion', 'nve-accordion-group'],
  'nve-grid-cell': ['nve-badge', 'nve-icon-button'],
  'nve-page-panel': ['nve-grid'],
  'nve-dialog': ['nve-grid'],
  'nve-drawer': ['nve-grid'],
  'nve-card': ['nve-grid', 'nve-accordion', 'nve-accordion-group']
};

/** Reverse lookup: child tag → list of parent tags that require container="flat" */
const CHILD_TO_PARENTS = new Map<string, string[]>();
for (const [parent, children] of Object.entries(CONTAINER_RELATIONSHIPS)) {
  for (const child of children) {
    const parents = CHILD_TO_PARENTS.get(child) ?? [];
    parents.push(parent);
    CHILD_TO_PARENTS.set(child, parents);
  }
}

function findAncestor(node: HtmlTagNode, parentTags: string[]): HtmlTagNode | undefined {
  let current = node.parent;
  while (current) {
    if (parentTags.includes(current.name)) {
      return current;
    }
    current = current.parent;
  }
  return undefined;
}

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Disallow nesting container components without container="flat".',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      'no-nested-container-types':
        '<{{child}}> nested inside <{{parent}}> should use container="flat" to avoid visual nesting issues.',
      'suggest-add-container-flat': 'Add container="flat" to <{{child}}>'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const parentTags = CHILD_TO_PARENTS.get(node.name);
        if (!parentTags) {
          return;
        }

        const ancestor = findAncestor(node, parentTags);
        if (!ancestor) {
          return;
        }

        const containerAttr = findAttr(node, 'container');
        const containerValue = containerAttr?.value?.value ?? '';

        // Skip template syntax bindings
        if (containerValue && VALUE_BINDINGS.some(binding => containerValue.includes(binding))) {
          return;
        }

        if (containerValue === 'flat') {
          return;
        }

        context.report({
          node,
          data: {
            child: node.name,
            parent: ancestor.name
          },
          messageId: 'no-nested-container-types',
          suggest: [
            {
              messageId: 'suggest-add-container-flat',
              data: { child: node.name },
              fix(fixer: Rule.RuleFixer) {
                if (containerAttr) {
                  return fixer.replaceText(
                    containerAttr as unknown as Rule.Node,
                    `container=${containerAttr.startWrapper?.value ?? '"'}flat${containerAttr.endWrapper?.value ?? '"'}`
                  );
                }
                // Insert after the tag name opening
                return fixer.insertTextAfterRange(node.openStart.range, ' container="flat"');
              }
            }
          ]
        });
      }
    });
  }
} as const;

export default rule;
