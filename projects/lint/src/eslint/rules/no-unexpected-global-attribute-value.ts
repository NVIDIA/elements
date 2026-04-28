// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import {
  recommendedNveTextValue,
  recommendedNveLayoutValue,
  DISTILLED_NVE_TEXT_VALUES,
  DISTILLED_NVE_LAYOUT_VALUES,
  DISTILLED_NVE_DISPLAY_VALUES,
  recommendedNveDisplayValue
} from '../internals/attributes.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Disallow use of invalid attribute values in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [
      {
        type: 'object',
        properties: {
          distilled: {
            type: 'boolean',
            default: true,
            description: 'When true the subset of options for agents is applied.'
          }
        }
      }
    ],
    messages: {
      ['unexpected-attribute-value']:
        'Unexpected value "{{value}}" in "{{attribute}}" attribute. Available values: {{validValues}}',
      ['unexpected-attribute-value-alternative']:
        'Unexpected value "{{value}}" in "{{attribute}}" attribute. Use "{{alternative}}" instead.',
      ['suggest-replace-attribute-value']: 'Replace "{{value}}" with "{{alternative}}"'
    }
  },
  create(context: Rule.RuleContext) {
    function checkNveText(node: HtmlTagNode) {
      const textAttr = findAttr(node, 'nve-text');
      if (!textAttr) return;
      const value = textAttr.value?.value ?? '';
      const alternative = recommendedNveTextValue(value);
      if (alternative === value) return;
      context.report({
        node: textAttr,
        data: {
          attribute: 'nve-text',
          value,
          alternative,
          validValues: [...DISTILLED_NVE_TEXT_VALUES].map(v => `"${v}"`).join(', ')
        },
        messageId: alternative ? 'unexpected-attribute-value-alternative' : 'unexpected-attribute-value',
        suggest: alternative
          ? [
              {
                messageId: 'suggest-replace-attribute-value',
                data: { value, alternative },
                fix: fixer =>
                  fixer.replaceText(
                    textAttr,
                    `nve-text=${textAttr.startWrapper.value}${alternative}${textAttr.endWrapper.value}`
                  )
              }
            ]
          : []
      });
    }

    function checkNveLayout(node: HtmlTagNode) {
      const layoutAttr = findAttr(node, 'nve-layout');
      if (!layoutAttr) return;
      const value = layoutAttr.value?.value ?? '';
      const alternative = recommendedNveLayoutValue(value);
      if (alternative === value) return;
      context.report({
        node: layoutAttr,
        data: {
          attribute: 'nve-layout',
          value,
          alternative,
          validValues: [...DISTILLED_NVE_LAYOUT_VALUES].map(v => `"${v}"`).join(', ')
        },
        messageId: alternative ? 'unexpected-attribute-value-alternative' : 'unexpected-attribute-value',
        suggest: alternative
          ? [
              {
                messageId: 'suggest-replace-attribute-value',
                data: { value, alternative },
                fix: fixer =>
                  fixer.replaceText(
                    layoutAttr,
                    `nve-layout=${layoutAttr.startWrapper.value}${alternative}${layoutAttr.endWrapper.value}`
                  )
              }
            ]
          : []
      });
    }

    function checkNveDisplay(node: HtmlTagNode) {
      const displayAttr = findAttr(node, 'nve-display');
      if (!displayAttr) return;
      const value = displayAttr.value?.value ?? '';
      const alternative = recommendedNveDisplayValue(value);
      if (alternative === value) return;
      context.report({
        node,
        data: {
          attribute: 'nve-display',
          value,
          alternative,
          validValues: [...DISTILLED_NVE_DISPLAY_VALUES].map(v => `"${v}"`).join(', ')
        },
        messageId: 'unexpected-attribute-value',
        suggest: alternative
          ? [
              {
                messageId: 'suggest-replace-attribute-value',
                data: { value, alternative },
                fix: fixer =>
                  fixer.replaceText(
                    displayAttr,
                    `nve-layout=${displayAttr.startWrapper.value}${alternative}${displayAttr.endWrapper.value}`
                  )
              }
            ]
          : []
      });
    }

    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        checkNveText(node);
        checkNveLayout(node);
        checkNveDisplay(node);
      }
    });
  }
} as const;

export default rule;
