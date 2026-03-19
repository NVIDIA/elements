// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

const DEPRECATED_GLOBAL_ATTRIBUTES = ['mlv-text', 'mlv-layout', 'mlv-theme'];

const rule = {
  meta: {
    type: 'problem' as const,
    fixable: 'code' as const,
    hasSuggestions: true,
    docs: {
      description: 'Disallow use of deprecated global utility attributes in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-global-attribute']:
        'Unexpected use of deprecated global attribute {{attribute}}. Use {{alternative}} instead.',
      ['suggest-replace-deprecated-attribute']: 'Replace {{attribute}} with {{alternative}}'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        DEPRECATED_GLOBAL_ATTRIBUTES.forEach(attribute => {
          const attr = findAttr(node, attribute);
          if (attr) {
            const newAttributeName = attribute.replace('mlv-', 'nve-');

            context.report({
              messageId: 'unexpected-deprecated-global-attribute',
              node: attr,
              data: {
                attribute,
                alternative: newAttributeName
              },
              suggest: [
                {
                  messageId: 'suggest-replace-deprecated-attribute',
                  data: {
                    attribute,
                    alternative: newAttributeName
                  },
                  fix: fixer => {
                    if (!attr.value) {
                      return fixer.replaceText(attr, newAttributeName);
                    }

                    return fixer.replaceText(
                      attr,
                      `${newAttributeName}=${attr.startWrapper.value}${attr.value.value}${attr.endWrapper.value}`
                    );
                  }
                }
              ],
              fix: fixer => {
                if (!attr.value) {
                  return fixer.replaceText(attr, newAttributeName);
                }

                return fixer.replaceText(
                  attr,
                  `${newAttributeName}=${attr.startWrapper.value}${attr.value.value}${attr.endWrapper.value}`
                );
              }
            });
          }
        });
      }
    });
  }
} as const;

export default rule;
