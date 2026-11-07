// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import { VALUE_BINDINGS } from '../internals/attributes.js';
import type { HtmlTagNode } from '../rule-types.js';

function isMarkdownInlineCode(context: Rule.RuleContext, node: HtmlTagNode): boolean {
  if (!context.filename.endsWith('.md')) return false;
  let current: HtmlTagNode | undefined = node;
  while (current?.type === 'Tag') {
    if (context.sourceCode.text[current.openStart.range[0] - 1] === '`') return true;
    current = current.parent;
  }
  return false;
}

function configuration(node: HtmlTagNode, name: 'count' | 'height') {
  const attribute = `item-${name}`;
  const property = `item${name}`;
  const names = [
    attribute,
    property,
    `.${property}`,
    `[${property}]`,
    `[attr.${attribute}]`,
    `:${attribute}`,
    `:${property}`,
    `v-bind:${attribute}`
  ];
  const attr = node.attributes?.find(candidate => {
    const key = candidate.key?.value.toLowerCase() ?? '';
    // The HTML parser can split unquoted framework expressions at whitespace.
    const expressionBinding = !candidate.startWrapper && (candidate.value?.value ?? '').startsWith('{');
    return names.includes(key) && (key !== property || expressionBinding);
  });
  if (!attr) return { present: false, valid: false };
  const value = attr.value?.value ?? '';
  const binding =
    ![attribute, property].includes(attr.key!.value.toLowerCase()) ||
    VALUE_BINDINGS.some(pattern => value.includes(pattern));
  return { present: true, valid: binding || validNumber(value, name), literal: binding ? undefined : Number(value) };
}

function validNumber(value: string, name: 'count' | 'height') {
  if (!value.trim()) return false;
  const number = Number(value);
  return name === 'count' ? Number.isSafeInteger(number) && number >= 0 : Number.isFinite(number) && number > 0;
}

function exceedsExtent(count: ReturnType<typeof configuration>, height: ReturnType<typeof configuration>) {
  return (
    count.valid &&
    height.valid &&
    count.literal !== undefined &&
    height.literal !== undefined &&
    count.literal * height.literal > 16_000_000
  );
}

function renderedChildren(node: HtmlTagNode): HtmlTagNode[] {
  return (node.children ?? [])
    .filter(child => child.type === 'Tag')
    .flatMap(child => (child.name === 'ng-container' ? renderedChildren(child) : [child]));
}

function getAttributeValue(node: HtmlTagNode, name: string) {
  return node.attributes?.find(candidate => candidate.key?.value === name)?.value?.value;
}

// Match the existing RowGroups and PanelDetail examples rather than inventing group tags.
function isRowDisclosure(node: HtmlTagNode) {
  if (node.name !== 'nve-icon-button') return false;
  const icon = getAttributeValue(node, 'icon-name');
  if (icon === 'expand-details') return true;
  if (!isFirstRowCell(node.parent)) return false;
  return icon === 'caret' && ['right', 'down'].includes(getAttributeValue(node, 'direction') ?? '');
}

function isFirstRowCell(cell: HtmlTagNode | undefined) {
  const row = cell?.parent;
  return (
    cell?.name === 'nve-grid-cell' &&
    row?.name === 'nve-grid-row' &&
    cell === row.children?.find(child => child.type === 'Tag')
  );
}

function unsupportedChildren(node: HtmlTagNode): HtmlTagNode[] {
  return (node.children ?? [])
    .filter(child => child.type === 'Tag')
    .flatMap(child => {
      if (child.name === 'nve-grid') return [];
      if (unsupported(child)) return [child];
      return unsupportedChildren(child);
    });
}

function unsupported(node: HtmlTagNode) {
  return (
    getAttributeValue(node, 'role') === 'rowgroup' ||
    ['nve-page-panel', 'nve-panel'].includes(node.name) ||
    (node.name === 'nve-grid-row' && getAttributeValue(node, 'aria-expanded') !== undefined) ||
    isRowDisclosure(node)
  );
}

function validateGridChildren(context: Rule.RuleContext, node: HtmlTagNode) {
  let parent = node.parent;
  while (parent?.name === 'ng-container') parent = parent.parent;
  if (parent?.name !== 'nve-grid') return;
  const unsupportedNodes = unsupportedChildren(node);
  for (const child of unsupportedNodes) context.report({ node: child, messageId: 'composition' });
  for (const child of renderedChildren(node)) {
    if (child.name !== 'nve-grid-row' && !unsupportedNodes.includes(child))
      context.report({ node: child, messageId: 'rows' });
  }
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-invalid-virtual-list',
      description: 'Require virtual list geometry and reject unsupported virtual grid compositions.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-virtual-list item-count="100" item-height="40"></nve-virtual-list>',
        invalid: '<nve-virtual-list></nve-virtual-list>'
      }
    }),
    schema: [],
    messages: {
      geometry:
        '<nve-virtual-list> requires valid {{attribute}} configuration. Use an attribute or framework property binding; runtime validation remains authoritative.',
      composition: 'Virtual grid rows cannot contain row groups or detail panels.',
      rows: 'Virtual grid lists must contain only <nve-grid-row> elements.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (node.name !== 'nve-virtual-list') return;
        if (isMarkdownInlineCode(context, node)) return;
        const count = configuration(node, 'count');
        const height = configuration(node, 'height');
        for (const [name, config] of [
          ['count', count],
          ['height', height]
        ] as const) {
          if (!config.valid) context.report({ node, messageId: 'geometry', data: { attribute: `item-${name}` } });
        }
        if (exceedsExtent(count, height))
          context.report({
            node,
            messageId: 'geometry',
            data: { attribute: 'item-count × item-height (maximum 16,000,000 pixels)' }
          });
        validateGridChildren(context, node);
      }
    });
  }
} as const;
export default rule;
