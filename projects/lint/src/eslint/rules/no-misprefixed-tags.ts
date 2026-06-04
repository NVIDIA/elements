// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import type { HtmlTagNode } from '../rule-types.js';
import { elements } from '../internals/metadata.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

const CORRECT_PREFIX = 'nve';

function buildNearMissPrefixes(target: string): Set<string> {
  const variants = new Set<string>();

  for (let i = 0; i < target.length; i++) {
    variants.add(target.slice(0, i) + target.slice(i + 1));
  }

  variants.delete(target);
  return variants;
}

const NEAR_MISS_PREFIXES = buildNearMissPrefixes(CORRECT_PREFIX);

/**
 * Return the corrected `nve-*` tag name when `tag` uses a near-miss prefix and
 * the corrected name matches a known Elements component, otherwise `null`.
 */
function getCorrectedTag(tag: string): string | null {
  if (!tag || tag.startsWith(`${CORRECT_PREFIX}-`)) {
    return null;
  }

  const dashIndex = tag.indexOf('-');
  if (dashIndex <= 0) {
    return null;
  }

  const prefix = tag.slice(0, dashIndex);
  const suffix = tag.slice(dashIndex + 1);
  if (!suffix || !NEAR_MISS_PREFIXES.has(prefix)) {
    return null;
  }

  const replacement = `${CORRECT_PREFIX}-${suffix}`;
  return elements.some(element => element.name === replacement) ? replacement : null;
}

/** Rewrite the tag name in both the opening and (optional) closing tag. */
function fixTagName(fixer: Rule.RuleFixer, node: HtmlTagNode, replacement: string): Rule.Fix[] {
  const length = node.name.length;
  const openNameStart = node.openStart.range[0] + 1;
  const fixes = [fixer.replaceTextRange([openNameStart, openNameStart + length], replacement)];

  if (node.close) {
    const closeNameStart = node.close.range[0] + 2;
    fixes.push(fixer.replaceTextRange([closeNameStart, closeNameStart + length], replacement));
  }

  return fixes;
}

const rule = {
  meta: {
    type: 'problem' as const,
    fixable: 'code' as const,
    docs: {
      description: 'Disallow misprefixed (nv-*) Elements tags that resolve to a known (nve-*) element.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['misprefixed-tag']: 'Unexpected tag prefix in <{{tag}}>. Did you mean <{{replacement}}>?'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const replacement = getCorrectedTag(node.name);
        if (!replacement) {
          return;
        }

        context.report({
          node,
          data: { tag: node.name, replacement },
          messageId: 'misprefixed-tag',
          fix: (fixer: Rule.RuleFixer) => fixTagName(fixer, node, replacement)
        });
      }
    });
  }
} as const;

export default rule;
