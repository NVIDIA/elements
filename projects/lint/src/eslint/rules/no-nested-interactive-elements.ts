// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { BUTTON_TYPE_ELEMENTS } from '../internals/button-elements.js';
import { INTERACTIVE_ELEMENTS } from '../internals/interactive-elements.js';
import { VALUE_BINDINGS } from '../internals/attributes.js';
import { getSlotAssignment } from '../internals/slots.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

function isDecorativeTag(node: HtmlTagNode): boolean {
  if (node.name.toLowerCase() !== 'nve-tag') return false;
  const readOnly = findAttr(node, 'readonly');
  if (!readOnly || VALUE_BINDINGS.some(binding => readOnly.value?.value.includes(binding))) return false;

  const interactiveAttributes = [
    'closable',
    '?closable',
    '.closable',
    ':closable',
    '[closable]',
    '[attr.closable]',
    'role',
    '.role',
    ':role',
    '[role]',
    '[attr.role]'
  ];
  return !interactiveAttributes.some(name => findAttr(node, name));
}

function isKnownInteractiveElement(node: HtmlTagNode): boolean {
  const tagName = node.name.toLowerCase();
  if (isDecorativeTag(node)) return false;
  if (tagName === 'input' && findAttr(node, 'type')?.value?.value.toLowerCase() === 'hidden') return false;
  if (INTERACTIVE_ELEMENTS.has(tagName)) return true;
  if (['audio', 'video'].includes(tagName)) return Boolean(findAttr(node, 'controls'));
  return ['a', 'area'].includes(tagName) && Boolean(findAttr(node, 'href'));
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-nested-interactive-elements',
      description: 'Disallow interactive controls nested inside other interactive elements.',
      category: 'Accessibility',
      recommended: true,
      examples: {
        language: 'html',
        valid:
          '<nve-tabs-item-group><nve-tabs-item>Tab</nve-tabs-item><nve-icon-button slot="suffix" icon-name="cancel" aria-label="Close tab"></nve-icon-button></nve-tabs-item-group>',
        invalid: '<nve-tag>Tag<nve-icon-button icon-name="cancel" aria-label="Remove"></nve-icon-button></nve-tag>'
      }
    }),
    schema: [
      {
        type: 'object',
        properties: { elements: { type: 'array', items: { type: 'string' }, uniqueItems: true } },
        additionalProperties: false
      }
    ],
    messages: {
      'nested-interactive-element': 'Interactive <{{element}}> must not be nested inside <{{parent}}>.'
    }
  },
  create(context: Rule.RuleContext) {
    const options: { elements?: string[] } = context.options[0] ?? {};
    const elements = new Set((options.elements ?? BUTTON_TYPE_ELEMENTS).map(element => element.toLowerCase()));

    function getLabelAnchor(parent: HtmlTagNode): HtmlTagNode | undefined {
      if (!BUTTON_TYPE_ELEMENTS.some(element => element === parent.name.toLowerCase())) return;
      return parent.children?.find(child => {
        if (child.type !== 'Tag' || child.name.toLowerCase() !== 'a') return false;
        return getSlotAssignment(child).kind === 'default';
      });
    }

    function validateDescendant(node: HtmlTagNode, parent: HtmlTagNode, labelAnchor?: HtmlTagNode): void {
      const isInlineCode = isMarkdownInlineCode(node);
      if (node.name.toLowerCase() === 'template' && !isInlineCode) return;
      const isLabelAnchor = node === labelAnchor;
      if (!isInlineCode && isKnownInteractiveElement(node) && !isLabelAnchor) {
        context.report({
          node,
          messageId: 'nested-interactive-element',
          data: { element: node.name, parent: parent.name }
        });
        return;
      }
      for (const child of node.children ?? []) {
        if (child.type === 'Tag') validateDescendant(child, parent, labelAnchor);
      }
    }

    function isInertTemplate(node: HtmlTagNode): boolean {
      let ancestor = node.parent;
      while (ancestor) {
        if (ancestor.name?.toLowerCase() === 'template' && !isMarkdownInlineCode(ancestor)) {
          const mode = findAttr(ancestor, 'shadowrootmode')?.value?.value.toLowerCase();
          if (mode !== 'open' && mode !== 'closed') return true;
        }
        ancestor = ancestor.parent;
      }
      return false;
    }

    function isMarkdownInlineCode(node: HtmlTagNode): boolean {
      if (!context.filename.endsWith('.md')) return false;
      const source = context.sourceCode.getText();
      const position = node.openStart.range[0];
      let ancestor: HtmlTagNode | undefined = node;
      while (ancestor) {
        const start = ancestor.openStart?.range[0];
        if (start !== undefined && source[start - 1] === '`' && position < source.indexOf('`', start)) return true;
        ancestor = ancestor.parent;
      }
      return false;
    }

    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (!elements.has(node.name.toLowerCase()) || isDecorativeTag(node) || isInertTemplate(node)) return;
        if (isMarkdownInlineCode(node)) return;
        const labelAnchor = getLabelAnchor(node);
        for (const child of node.children ?? []) {
          if (child.type === 'Tag') validateDescendant(child, node, labelAnchor);
        }
      }
    });
  }
} as const;

export default rule;
