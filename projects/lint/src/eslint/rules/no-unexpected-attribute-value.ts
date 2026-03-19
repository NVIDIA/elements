// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { getElementAttribute, getRecommendedValue } from '../internals/element-attributes.js';
import { isNVElement } from '../internals/utils.js';
import type { HtmlAttribute, HtmlTagNode } from '../rule-types.js';

const VALUE_BINDINGS = ['${', '{', '{{', '{%'];

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Disallow use of invalid attribute values for nve-* elements.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['no-unexpected-attribute-value']:
        'Unexpected value "{{value}}" for attribute "{{attribute}}" on <{{tagName}}>. Available values: {{validValues}}',
      ['unexpected-attribute-value-alternative']:
        'Unexpected value "{{value}}" for attribute "{{attribute}}" on <{{tagName}}>. Did you mean "{{alternative}}"?',
      ['suggest-replace-attribute-value']: 'Replace "{{value}}" with "{{alternative}}"'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name;

        if (!isNVElement(tagName)) {
          return;
        }

        (node.attributes ?? [])
          .filter(
            attr =>
              attr.type === 'Attribute' &&
              attr.key?.value &&
              !VALUE_BINDINGS.some(binding => attr.value?.value?.includes(binding))
          )
          .forEach((attr: HtmlAttribute) => {
            const attributeName = attr.key!.value;
            const value = attr.value?.value ?? '';
            const attrInfo = getElementAttribute(tagName, attributeName);

            if (attrInfo?.isEnum && !attrInfo.deprecated && !attrInfo.values.includes(value)) {
              const validValues = [...attrInfo.values].sort((a, b) => a.localeCompare(b));
              const alternative = getRecommendedValue(value, validValues);
              const suggest = alternative
                ? [
                    {
                      messageId: 'suggest-replace-attribute-value',
                      data: {
                        value,
                        alternative
                      },
                      fix: (fixer: Rule.RuleFixer) => {
                        return fixer.replaceText(
                          attr as unknown as Rule.Node,
                          `${attributeName}=${attr.startWrapper?.value ?? '"'}${alternative}${attr.endWrapper?.value ?? '"'}`
                        );
                      }
                    }
                  ]
                : [];

              context.report({
                node: attr,
                data: {
                  tagName,
                  attribute: attributeName,
                  value,
                  alternative,
                  validValues: validValues.map(value => `"${value}"`).join(', ')
                },
                messageId: alternative ? 'unexpected-attribute-value-alternative' : 'no-unexpected-attribute-value',
                suggest
              });
            }
          });
      }
    });
  }
} as const;

export default rule;
