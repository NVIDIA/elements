// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { getLiteralFormatAttribute } from '../internals/format-input.js';
import { VALUE_BINDINGS } from '../internals/attributes.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

function isMarkdownInlineCode(context: Rule.RuleContext, node: HtmlTagNode) {
  if (!context.filename.endsWith('.md')) return false;
  for (let ancestor: HtmlTagNode | undefined = node; ancestor?.type === 'Tag'; ancestor = ancestor.parent) {
    if (context.sourceCode.text[ancestor.openStart.range[0] - 1] === '`') return true;
  }
  return false;
}

function numericAttribute(node: HtmlTagNode, name: string, fallback: number) {
  const attribute = getLiteralFormatAttribute(node, name);
  if (!attribute) return;
  return attribute.value === undefined ? fallback : Number(attribute.value);
}

function staticRange(node: HtmlTagNode) {
  const sourceMin = numericAttribute(node, 'min', 0);
  const sourceMax = numericAttribute(node, 'max', 100);
  if (sourceMin === undefined || sourceMax === undefined) return;
  const min = Number.isFinite(sourceMin) ? sourceMin : 0;
  const max = Math.max(min, Number.isFinite(sourceMax) ? sourceMax : 100);
  const sourceValue = numericAttribute(node, 'value', 0);
  if (sourceValue === undefined) return { min, max };
  const value = Math.min(max, Math.max(min, Number.isFinite(sourceValue) ? sourceValue : min));
  return { min, max, fraction: max > min ? (value - min) / (max - min) : 0 };
}

function hasConditionalMembership(node: HtmlTagNode) {
  return node.attributes?.some(attribute =>
    /^(v-(if|else(-if)?|for)|\*ng(if|for)|\[ng(if|forof)\])$/.test(attribute.key?.value?.toLowerCase() ?? '')
  );
}

function staticMeters(node: HtmlTagNode) {
  // Expressions may contain alternative branches or generated children; do not sum their source markup.
  if (
    node.children?.some(
      child => child.type === 'Text' && VALUE_BINDINGS.some(binding => child.value?.includes(binding))
    )
  )
    return;
  const meters = (node.children ?? []).filter(child => child.type === 'Tag' && child.name === 'nve-meter');
  if (meters.some(hasConditionalMembership)) return;
  return meters.filter(meter => {
    const slot = getLiteralFormatAttribute(meter, 'slot');
    return slot && !slot.value;
  });
}

function checkGroup(context: Rule.RuleContext, node: HtmlTagNode) {
  const meters = staticMeters(node);
  if (!meters?.length) return;
  const ranges = meters.map(staticRange);
  const known = ranges.filter(range => range !== undefined);
  const first = known[0];
  if (known.some(range => range.min !== first?.min || range.max !== first?.max)) {
    context.report({ node, messageId: 'mismatched-bounds' });
    return;
  }
  if (known.length !== meters.length || known.some(range => range.fraction === undefined)) return;
  const total = known.reduce((sum, range) => sum + (range.fraction ?? 0), 0);
  if (total > 1 + 1e-10) context.report({ node, messageId: 'excess-capacity' });
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-invalid-meter-group',
      description: 'Require matching effective bounds and values within shared capacity for static meter groups.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid:
          '<nve-meter-group><nve-meter value="20"></nve-meter><nve-meter value="30"></nve-meter></nve-meter-group>',
        invalid:
          '<nve-meter-group><nve-meter value="80"></nve-meter><nve-meter value="80"></nve-meter></nve-meter-group>'
      }
    }),
    schema: [],
    messages: {
      'mismatched-bounds': '<nve-meter-group> children must have matching effective min and max values.',
      'excess-capacity':
        '<nve-meter-group> segment widths exceed the shared track capacity. Reduce values or increase the shared range.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (node.name !== 'nve-meter-group') return;
        if (isMarkdownInlineCode(context, node)) return;
        checkGroup(context, node);
      }
    });
  }
} as const;

export default rule;
