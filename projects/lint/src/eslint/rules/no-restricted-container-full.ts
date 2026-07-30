// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

const FULL_CONTAINER_TAGS: ReadonlySet<string> = new Set(['nve-alert-group', 'nve-card', 'nve-grid', 'nve-toolbar']);
const FLAT_GRID_PARENTS: ReadonlySet<string> = new Set(['nve-card', 'nve-dialog']);

function findAncestorTag(node: HtmlTagNode, tagNames: ReadonlySet<string>): HtmlTagNode | undefined {
  let current = node.parent;
  while (current) {
    if (tagNames.has(current.name?.toLowerCase())) {
      return current;
    }
    current = current.parent;
  }
  return undefined;
}

function isTemplateRootOrPageChild(node: HtmlTagNode): boolean {
  if (node.parent?.type === 'Document') {
    return true;
  }
  return node.parent?.name?.toLowerCase() === 'nve-page';
}

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Restrict container="full" to direct children of nve-page.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['no-restricted-container-full']:
        'container="full" on <{{tag}}> requires the element to be the template root or a direct child of <nve-page>.',
      ['grid-requires-container-flat']:
        '<nve-grid> inside <{{parent}}> requires container="flat". Use container="full" only when the grid is the template root or a direct child of <nve-page>.',
      ['suggest-container-flat']: 'Replace container="full" with container="flat"'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();
        if (!FULL_CONTAINER_TAGS.has(tagName)) {
          return;
        }

        const containerAttr = findAttr(node, 'container');
        if (containerAttr?.value?.value !== 'full') {
          return;
        }

        if (isTemplateRootOrPageChild(node)) {
          return;
        }

        const flatGridParent = tagName === 'nve-grid' ? findAncestorTag(node, FLAT_GRID_PARENTS) : undefined;
        if (flatGridParent) {
          context.report({
            node: containerAttr,
            messageId: 'grid-requires-container-flat',
            data: {
              parent: flatGridParent.name
            },
            suggest: [
              {
                messageId: 'suggest-container-flat',
                fix(fixer: Rule.RuleFixer) {
                  return fixer.replaceText(
                    containerAttr as unknown as Rule.Node,
                    `container=${containerAttr.startWrapper?.value ?? '"'}flat${containerAttr.endWrapper?.value ?? '"'}`
                  );
                }
              }
            ]
          });
          return;
        }

        context.report({
          node: containerAttr,
          messageId: 'no-restricted-container-full',
          data: {
            tag: tagName
          }
        });
      }
    });
  }
} as const;

export default rule;
