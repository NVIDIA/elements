import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

const RESTRICTED_GLOBAL_ATTRIBUTES = ['nve-text', 'nve-layout', 'mlv-text', 'mlv-layout'];
const RESTRICTED_ELEMENT_API_ATTRIBUTES = ['variant'];

// External box-model attribute values that custom elements allow
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
      description: 'Disallow use of invalid API attributes or utility attributes on custom HTML element tags.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['no-restricted-attributes']:
        'Unexpected use of restricted attribute "{{attribute}}" on <{{element}}>. Remove the attribute.'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        RESTRICTED_GLOBAL_ATTRIBUTES.forEach(attribute => {
          const attr = findAttr(node, attribute);
          const isCustomElement = node.name.includes('-') && attr;

          if (isCustomElement) {
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
                attribute,
                element: node.name
              }
            });
          }
        });

        RESTRICTED_ELEMENT_API_ATTRIBUTES.forEach(attribute => {
          const attr = findAttr(node, attribute);
          const isElementAPI = node.name.startsWith('nve-') && attr;
          if (isElementAPI) {
            context.report({
              messageId: 'no-restricted-attributes',
              node: attr,
              data: {
                attribute,
                element: node.name
              }
            });
          }
        });
      }
    });
  }
} as const;

export default rule;
