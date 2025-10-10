import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { getRecommendedSlotName, hasSlot } from '../internals/slots.js';
import { isNVElement } from '../internals/utils.js';

const rule = {
  meta: {
    type: 'problem' as const,
    hasSuggestions: true,
    docs: {
      description: 'Disallow use of invalid slot values in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-slot-value']: 'Unexpected slot "{{slotName}}" on "{{tagName}}" for element "{{parentTagName}}"',
      ['suggest-replace-slot-value']: 'Replace "{{slotName}}" with "{{alternative}}"',
      ['suggest-remove-slot-value']: 'Remove "{{slotName}}"'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const slotAttr = findAttr(node, 'slot');
        const slotName = slotAttr?.value?.value ?? '';
        const tagName = node.name;
        const parentTagName = node.parent?.name;

        if (slotAttr && isNVElement(parentTagName) && !hasSlot(parentTagName, slotName)) {
          const alternative = getRecommendedSlotName(slotName, parentTagName);
          let suggest = [];

          if (alternative === '') {
            suggest.push({
              messageId: 'suggest-remove-slot-value',
              data: {
                slotName,
                alternative
              },
              fix: fixer => {
                return fixer.replaceText(slotAttr, '');
              }
            });
          } else if (alternative) {
            suggest.push({
              messageId: 'suggest-replace-slot-value',
              data: {
                slotName,
                alternative
              },
              fix: fixer => {
                return fixer.replaceText(
                  slotAttr,
                  `slot=${slotAttr.startWrapper.value}${alternative}${slotAttr.endWrapper.value}`
                );
              }
            });
          }

          context.report({
            node: slotAttr,
            data: {
              slotName,
              tagName,
              parentTagName
            },
            messageId: 'unexpected-slot-value',
            suggest
          });
        }
      }
    });
  }
} as const;

export default rule;
