// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { hasMatchingChild, hasTemplateSyntax, type HtmlNode } from '../internals/utils.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
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

/**
 * Check whether any slotted native control ID matches an external <label for="...">.
 * External means the label node is outside the current component subtree.
 */
function hasExternalLabelForAssociation(node: HtmlTagNode): boolean {
  const nativeInputTags = new Set(['input', 'textarea', 'select']);
  const controlIds = new Set<string>();

  function collectControlIds(current: HtmlNode): void {
    if (current.type === 'Tag' && nativeInputTags.has(current.name.toLowerCase())) {
      const idAttr = findAttr(current, 'id');
      const idValue = idAttr?.value?.value;
      if (idValue) {
        controlIds.add(idValue);
      }
    }

    if (current.children && Array.isArray(current.children)) {
      for (const child of current.children) {
        collectControlIds(child);
      }
    }
  }

  collectControlIds(node);

  if (controlIds.size === 0) {
    return false;
  }

  function subtreeContainsNode(current: HtmlNode, target: HtmlNode): boolean {
    if (current === target) {
      return true;
    }

    if (!current.children || !Array.isArray(current.children)) {
      return false;
    }

    return current.children.some((child: HtmlNode) => subtreeContainsNode(child, target));
  }

  function hasMatchingLabelInSubtree(current: HtmlNode): boolean {
    if (current.type === 'Tag' && current.name.toLowerCase() === 'label') {
      const forAttr = findAttr(current, 'for');
      const forValue = forAttr?.value?.value;

      if (forValue && controlIds.has(forValue)) {
        return true;
      }
    }

    if (current.children && Array.isArray(current.children)) {
      return current.children.some((child: HtmlNode) => hasMatchingLabelInSubtree(child));
    }

    return false;
  }

  function ancestorHasExternalLabel(ancestor: HtmlNode): boolean {
    if (!ancestor.children || !Array.isArray(ancestor.children)) {
      return false;
    }
    return ancestor.children.some(
      siblingSubtree => !subtreeContainsNode(siblingSubtree, node) && hasMatchingLabelInSubtree(siblingSubtree)
    );
  }

  let ancestor = node.parent;

  while (ancestor) {
    if (ancestorHasExternalLabel(ancestor)) {
      return true;
    }
    ancestor = ancestor.parent;
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
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
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
        '<{{element}}> is missing an accessible label. Add a aria-label attribute on the native input.',
      ['external-control-label']:
        '<{{element}}> associates its slotted control with an external <label for>. Slot the <label> inside <{{element}}> instead.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const options = context.options[0] ?? {};
        const tagName = node.name.toLowerCase();

        const allControls = [...FORM_CONTROLS_REQUIRING_LABEL, ...(options.additionalControls ?? [])];

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

        // Check for anti-pattern: external <label for="..."> tied to slotted control id
        const hasExternalLabelFor = hasExternalLabelForAssociation(node);

        if (hasExternalLabelFor) {
          context.report({
            node: node,
            messageId: 'external-control-label',
            data: {
              element: tagName
            }
          });
          return;
        }

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
