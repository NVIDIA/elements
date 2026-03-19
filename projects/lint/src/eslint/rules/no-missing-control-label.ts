// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { hasMatchingChild, hasTemplateSyntax, type HtmlNode } from '../internals/utils.js';
import type { HtmlTagNode } from '../rule-types.js';

/**
 * Form controls that require a label for accessibility.
 * Each control needs either:
 * 1. A slotted <label> element
 * 2. An aria-label attribute on the native input element
 */
const FORM_CONTROLS_REQUIRING_LABEL = [
  'nve-input',
  'nve-combobox',
  'nve-date',
  'nve-datetime',
  'nve-month',
  'nve-week',
  'nve-time',
  'nve-textarea',
  'nve-select',
  'nve-search',
  'nve-file',
  'nve-password',
  'nve-color',
  'nve-range',
  'nve-checkbox',
  'nve-radio',
  'nve-switch'
];

/**
 * Check if a node has a child with the specified attribute
 */
function hasChildWithAttribute(node: HtmlNode, tagName: string, attrName: string): boolean {
  function checkNode(n: HtmlNode): boolean {
    if (n.type === 'Tag' && n.name.toLowerCase() === tagName.toLowerCase()) {
      const attr = findAttr(n, attrName);
      if (attr && attr.value?.value) {
        return true;
      }
    }

    if (n.children && Array.isArray(n.children)) {
      return n.children.some((child: HtmlNode) => checkNode(child));
    }

    return false;
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.some((child: HtmlNode) => checkNode(child));
  }

  return false;
}

/**
 * Check if any native input element has aria-label.
 * Native inputs include: input, textarea, select
 */
function hasNativeInputWithAriaLabel(node: HtmlNode): boolean {
  const nativeInputTags = ['input', 'textarea', 'select'];

  for (const tag of nativeInputTags) {
    if (hasChildWithAttribute(node, tag, 'aria-label')) {
      return true;
    }
  }

  return false;
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Require form controls to have an accessible label.',
      category: 'Accessibility',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [
      {
        type: 'object',
        properties: {
          additionalControls: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      ['missing-control-label']:
        '<{{element}}> is missing an accessible label. Add a aria-label attribute on the native input.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const options = context.options[0] ?? {};
        const tagName = node.name.toLowerCase();

        const additionalControls = options.additionalControls ?? [];
        const allControls = [...FORM_CONTROLS_REQUIRING_LABEL, ...additionalControls];

        if (!allControls.includes(tagName)) {
          return;
        }

        if (hasTemplateSyntax(node)) {
          return;
        }

        // Check for slotted <label> element
        const hasLabel = hasMatchingChild(node, 'label');

        // Check for aria-label on native input
        const hasAriaLabel = hasNativeInputWithAriaLabel(node);

        if (!hasLabel && !hasAriaLabel) {
          context.report({
            node: node,
            messageId: 'missing-control-label',
            data: {
              element: tagName
            }
          });
        }
      }
    });
  }
} as const;

export default rule;
