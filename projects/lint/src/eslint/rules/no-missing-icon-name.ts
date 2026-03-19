// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';
import type { HtmlNode } from '../internals/utils.js';

const DATA_BINDING_PATTERNS = [/\$\{[^}]*\}/, /\{\{[^}]*\}\}/, /^\{[^}]+\}$/];

function hasDataBinding(value: string | undefined): boolean {
  if (!value) return false;
  return DATA_BINDING_PATTERNS.some(pattern => pattern.test(value));
}

function hasMeaningfulChildren(node: HtmlNode): boolean {
  if (!node.children || !Array.isArray(node.children)) return false;
  return node.children.some((child: HtmlNode) => {
    if (child.type === 'Tag') return true;
    if (child.type === 'Text' && child.value && child.value.trim()) return true;
    return false;
  });
}

function hasAttrWithBinding(node: HtmlNode, attrName: string, propertyName: string): boolean {
  const attr = findAttr(node, attrName);
  if (attr) {
    if (attr.value?.value && !hasDataBinding(attr.value.value)) return true;
    if (hasDataBinding(attr.value?.value)) return true;
  }

  if (findAttr(node, `[${attrName}]`) || findAttr(node, `[${propertyName}]`)) return true;
  if (findAttr(node, `.${propertyName}`)) return true;

  return false;
}

const ICON_ELEMENTS: Record<string, { attr: string; property: string; requiresChildren: boolean }> = {
  'nve-icon': { attr: 'name', property: 'name', requiresChildren: false },
  'nve-icon-button': { attr: 'icon-name', property: 'iconName', requiresChildren: true }
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Require icon elements to have an icon name attribute.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['missing-icon-name']:
        '<{{element}}> is missing an icon name. Add a {{attribute}} attribute to specify which icon to display.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();
        const config = ICON_ELEMENTS[tagName];

        if (!config) return;

        if (config.requiresChildren && hasMeaningfulChildren(node)) return;

        if (hasAttrWithBinding(node, config.attr, config.property)) return;

        context.report({
          node,
          messageId: 'missing-icon-name',
          data: {
            element: tagName,
            attribute: config.attr
          }
        });
      }
    });
  }
} as const;

export default rule;
