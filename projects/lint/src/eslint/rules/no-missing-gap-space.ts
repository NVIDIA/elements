// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { VALUE_BINDINGS } from '../internals/attributes.js';
import type { HtmlAttribute, HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const GAP_OPTIONAL_VALUES = new Set([
  'full',
  'align:center',
  'align:horizontal-center',
  'align:vertical-center',
  'align:stretch',
  'align:horizontal-stretch',
  'align:vertical-stretch',
  'align:left',
  'align:right',
  'align:space-around',
  'align:space-between',
  'align:space-evenly'
]);

/** Context limited gap sizes to suggest as fixes */
const SUGGESTED_GAP_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];

function hasGapOptionalValue(values: string[]): boolean {
  return values.some(value => GAP_OPTIONAL_VALUES.has(value));
}

function suggestedLayout(value: string, size: string): string {
  return `${value} gap:${size}`;
}

function reportGapViolation({
  context,
  layoutAttr,
  value
}: {
  context: Rule.RuleContext;
  layoutAttr: HtmlAttribute;
  value: string;
}) {
  const [startWrapper, endWrapper] =
    layoutAttr.startWrapper && layoutAttr.endWrapper
      ? [layoutAttr.startWrapper.value, layoutAttr.endWrapper.value]
      : ['"', '"'];

  context.report({
    node: layoutAttr,
    messageId: 'missing-gap-space',
    data: { layout: value },
    suggest: SUGGESTED_GAP_SIZES.map(size => ({
      messageId: 'suggest-add-gap',
      data: { size },
      fix: (fixer: Rule.RuleFixer) =>
        fixer.replaceText(
          layoutAttr as unknown as Rule.Node,
          `nve-layout=${startWrapper}${suggestedLayout(value, size)}${endWrapper}`
        )
    }))
  });
}

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Require gap spacing on row, column, and grid layouts.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['missing-gap-space']: `Layout "{{layout}}" is missing gap spacing. Add a gap value such as "${SUGGESTED_GAP_SIZES.join('", "')}"`,
      ['suggest-add-gap']: 'Add "gap:{{size}}" to the layout'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const layoutAttr = findAttr(node, 'nve-layout');
        if (!layoutAttr) return;

        const value: string = layoutAttr.value?.value ?? '';
        if (VALUE_BINDINGS.some(binding => value.includes(binding))) return;

        const values = value.split(/\s+/).filter(Boolean);
        const isLayout = values.includes('row') || values.includes('column') || values.includes('grid');
        const hasGap = values.some(segment => segment.startsWith('gap:'));
        if (!isLayout || hasGap || hasGapOptionalValue(values)) return;
        reportGapViolation({ context, layoutAttr, value });
      }
    });
  }
} as const;

export default rule;
