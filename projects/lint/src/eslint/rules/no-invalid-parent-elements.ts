// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { PARENT_ELEMENT_CONTRACTS } from '../internals/parent-elements.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

const STATIC_TAG_NAME = /^[a-z][a-z0-9.-]*$/;
const OPAQUE_PARENTS = new Set(['template', 'ng-template', 'slot', 'component']);
const DISALLOWED_ANCESTORS: Readonly<Record<string, readonly string[]>> = {
  'nve-grid': ['nve-grid']
};

function isMarkdownInlineCode(context: Rule.RuleContext, node: HtmlTagNode): boolean {
  if (!context.filename.endsWith('.md')) return false;
  let current: HtmlTagNode | undefined = node;
  while (current?.type === 'Tag') {
    if (context.sourceCode.text[current.openStart.range[0] - 1] === '`') return true;
    current = current.parent;
  }
  return false;
}

function getRenderedParent(node: HtmlTagNode, source: string): HtmlTagNode | undefined {
  let parent = node.parent;
  while (parent?.name === 'ng-container') parent = parent.parent;
  if (!parent || parent.type !== 'Tag') return;
  const originalName = source.slice(parent.openStart.range[0] + 1, parent.openStart.range[1]);
  if (!STATIC_TAG_NAME.test(originalName)) return;
  const tagName = parent.name.toLowerCase();
  if (OPAQUE_PARENTS.has(tagName) || (tagName.includes('-') && !tagName.startsWith('nve-'))) return;
  return parent;
}

function getInvalidAncestor(node: HtmlTagNode, disallowed: readonly string[]): HtmlTagNode | undefined {
  let ancestor = node.parent;
  while (ancestor?.type === 'Tag') {
    const name = ancestor.name.toLowerCase();
    if (name === 'template' || name === 'ng-template') return;
    if (disallowed.includes(name)) return ancestor;
    ancestor = ancestor.parent;
  }
  return undefined;
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-invalid-parent-elements',
      description: 'Require supported parents and ancestors for Elements components.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-menu><nve-menu-item>Item</nve-menu-item></nve-menu>',
        invalid: '<div><nve-menu-item>Item</nve-menu-item></div>'
      }
    }),
    schema: [],
    messages: {
      ['invalid-parent-element']: '<{{element}}> requires a direct parent of {{parents}}. Found <{{parent}}>.',
      'invalid-ancestor-element': '<{{element}}> must not be nested inside <{{ancestor}}>.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (isMarkdownInlineCode(context, node)) return;
        const tagName = node.name.toLowerCase();
        const disallowed = DISALLOWED_ANCESTORS[tagName];
        const ancestor = disallowed && getInvalidAncestor(node, disallowed);
        if (ancestor) {
          context.report({
            node,
            messageId: 'invalid-ancestor-element',
            data: { element: tagName, ancestor: ancestor.name.toLowerCase() }
          });
          return;
        }
        const parents = PARENT_ELEMENT_CONTRACTS[tagName];
        if (!parents) return;
        const parent = getRenderedParent(node, context.sourceCode.text);
        if (!parent || parents.includes(parent.name.toLowerCase())) return;
        context.report({
          node,
          messageId: 'invalid-parent-element',
          data: {
            element: tagName,
            parent: parent.name.toLowerCase(),
            parents: parents.map(name => `<${name}>`).join(' or ')
          }
        });
      }
    });
  }
} as const;

export default rule;
