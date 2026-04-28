// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { VALUE_BINDINGS } from '../internals/attributes.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

export const DEPRECATED_ATTRIBUTE_VALUES: Record<string, Record<string, string>> = {
  'nve-text': {
    eyebrow: 'label sm'
  },
  'nve-layout': {
    grow: 'full'
  }
};

function rewriteValue(value: string, deprecations: Record<string, string>): string | null {
  const tokens = value.split(/\s+/).filter(Boolean);
  const replaced = tokens.map(token => deprecations[token] ?? token);
  if (tokens.every((token, i) => token === replaced[i])) return null;
  return Array.from(new Set(replaced.flatMap(t => t.split(/\s+/)))).join(' ');
}

const rule = {
  meta: {
    type: 'problem' as const,
    fixable: 'code' as const,
    hasSuggestions: true,
    docs: {
      description: 'Disallow use of deprecated attribute values for nve-* utility attributes.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-global-attribute-value']:
        'Unexpected use of deprecated value "{{value}}" in "{{attribute}}". Use "{{alternative}}" instead.',
      ['suggest-replace-deprecated-global-attribute-value']: 'Replace "{{value}}" with "{{alternative}}"'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        Object.entries(DEPRECATED_ATTRIBUTE_VALUES).forEach(([attribute, deprecations]) => {
          const attr = findAttr(node, attribute);
          const value = attr?.value?.value ?? '';
          if (!attr || !value) return;
          if (VALUE_BINDINGS.some(binding => value.includes(binding))) return;
          const alternative = rewriteValue(value, deprecations);
          if (alternative === null) return;

          context.report({
            node: attr,
            data: { attribute, value, alternative },
            messageId: 'unexpected-deprecated-global-attribute-value',
            suggest: [
              {
                messageId: 'suggest-replace-deprecated-global-attribute-value',
                data: { value, alternative },
                fix: fixer =>
                  fixer.replaceText(
                    attr,
                    `${attribute}=${attr.startWrapper.value}${alternative}${attr.endWrapper.value}`
                  )
              }
            ],
            fix: fixer =>
              fixer.replaceText(attr, `${attribute}=${attr.startWrapper.value}${alternative}${attr.endWrapper.value}`)
          });
        });
      }
    });
  }
} as const;

export default rule;
