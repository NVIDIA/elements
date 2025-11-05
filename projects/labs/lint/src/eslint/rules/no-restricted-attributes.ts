import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

const RESTRICTED_ATTRIBUTES = ['nve-text', 'nve-layout', 'mlv-text', 'mlv-layout'];

// External box-model attribute values that are allowed on custom elements
function isExternalBoxModelValue(value: string) {
  return value
    .trim()
    .split(' ')
    .every(part => part.startsWith('span:') || part === 'full');
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of utility attributes on custom HTML element tags.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['no-restricted-attributes']: 'Unexpected use of restricted attribute {{attribute}} on custom HTML element.'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        RESTRICTED_ATTRIBUTES.forEach(attribute => {
          const attr = findAttr(node, attribute);
          if (node.name.includes('-') && attr) {
            // Allow external box-model values for layout attributes
            if (attribute === 'nve-layout' && attr.value?.value) {
              if (isExternalBoxModelValue(attr.value.value)) {
                return;
              }
            }

            context.report({
              messageId: 'no-restricted-attributes',
              node: attr,
              data: {
                attribute
              }
            });
          }
        });
      }
    });
  }
} as const;

export default rule;
