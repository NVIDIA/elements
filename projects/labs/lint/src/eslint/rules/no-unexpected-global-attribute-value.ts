import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import {
  VALID_NVE_DISPLAY_VALUES,
  VALUE_BINDINGS,
  recommendedNveTextValue,
  recommendedNveLayoutValue
} from '../internals/attributes.js';

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Disallow use of invalid attribute values in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [{ type: 'object' }],
    messages: {
      ['unexpected-attribute-value']: 'Unexpected value "{{value}}" in "{{attribute}}" attribute',
      ['unexpected-attribute-value-alternative']:
        'Unexpected value "{{value}}" in "{{attribute}}" attribute. Use "{{alternative}}" instead.',
      ['suggest-replace-attribute-value']: 'Replace "{{value}}" with "{{alternative}}"'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const textAttr = findAttr(node, 'nve-text');
        if (textAttr) {
          const value = textAttr.value?.value ?? '';
          const alternative = recommendedNveTextValue(value);
          if (alternative !== value) {
            context.report({
              node: textAttr,
              data: {
                attribute: 'nve-text',
                value,
                alternative
              },
              messageId: alternative ? 'unexpected-attribute-value-alternative' : 'unexpected-attribute-value',
              suggest: alternative
                ? [
                    {
                      messageId: 'suggest-replace-attribute-value',
                      data: {
                        value,
                        alternative
                      },
                      fix: fixer => {
                        return fixer.replaceText(
                          textAttr,
                          `nve-text=${textAttr.startWrapper.value}${alternative}${textAttr.endWrapper.value}`
                        );
                      }
                    }
                  ]
                : []
            });
          }
        }

        const layoutAttr = findAttr(node, 'nve-layout');
        if (layoutAttr) {
          const value = layoutAttr.value?.value ?? '';
          const invalidSymbols = context.options[0]?.['nve-layout'] ?? [];
          const alternative = recommendedNveLayoutValue(value, invalidSymbols);
          if (alternative !== value) {
            context.report({
              node: layoutAttr,
              data: {
                attribute: 'nve-layout',
                value,
                alternative
              },
              messageId: alternative ? 'unexpected-attribute-value-alternative' : 'unexpected-attribute-value',
              suggest: alternative
                ? [
                    {
                      messageId: 'suggest-replace-attribute-value',
                      data: {
                        value,
                        alternative
                      },
                      fix: fixer => {
                        return fixer.replaceText(
                          layoutAttr,
                          `nve-layout=${layoutAttr.startWrapper.value}${alternative}${layoutAttr.endWrapper.value}`
                        );
                      }
                    }
                  ]
                : []
            });
          }
        }

        const displayAttr = findAttr(node, 'nve-display');
        if (displayAttr) {
          const values = displayAttr.value?.value?.split(' ') ?? [];
          const value = values.find(value => !VALID_NVE_DISPLAY_VALUES.has(value));
          const isValueBinding = VALUE_BINDINGS.some(binding => value?.includes(binding));
          if (value && !isValueBinding) {
            context.report({
              node,
              data: {
                attribute: 'nve-display',
                value
              },
              messageId: 'unexpected-attribute-value'
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
