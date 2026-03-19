// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { VALUE_BINDINGS } from '../internals/attributes.js';
import type { HtmlTagNode } from '../rule-types.js';

/** Spacing alignment values that manage their own distribution and override gap */
const SPACING_ALIGNMENTS = ['align:space-around', 'align:space-between', 'align:space-evenly'];

/** Context limited gap sizes to suggest as fixes */
const SUGGESTED_GAP_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Require gap spacing on row and column layouts.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
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

        const value = layoutAttr.value?.value ?? '';

        if (VALUE_BINDINGS.some(binding => value.includes(binding))) return;

        const segments = value.split(' ').filter((s: string) => s !== '');

        const isRowOrColumn = segments.includes('row') || segments.includes('column');
        if (!isRowOrColumn) return;

        const hasGap = segments.some((s: string) => s.startsWith('gap:'));
        if (hasGap) return;

        const hasSpacingAlignment = segments.some((s: string) => SPACING_ALIGNMENTS.includes(s));
        if (hasSpacingAlignment) return;

        context.report({
          node: layoutAttr,
          messageId: 'missing-gap-space',
          data: { layout: value },
          suggest: SUGGESTED_GAP_SIZES.map(size => ({
            messageId: 'suggest-add-gap',
            data: { size },
            fix: fixer => {
              return fixer.replaceText(
                layoutAttr,
                `nve-layout=${layoutAttr.startWrapper.value}${value} gap:${size}${layoutAttr.endWrapper.value}`
              );
            }
          }))
        });
      }
    });
  }
} as const;

export default rule;
