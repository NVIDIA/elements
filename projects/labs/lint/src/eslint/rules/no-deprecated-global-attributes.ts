import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

const DEPRECATED_GLOBAL_ATTRIBUTES = ['nve-text', 'nve-layout', 'nve-theme'];

const rule = {
  meta: {
    type: 'problem' as const,
    fixable: 'code' as const,
    docs: {
      description: 'Disallow use of deprecated global utility attributes in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-global-attribute']:
        'Unexpected use of deprecated global attribute {{attribute}}. Use {{alternative}} instead.'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        DEPRECATED_GLOBAL_ATTRIBUTES.forEach(attribute => {
          const attr = findAttr(node, attribute);
          if (attr) {
            context.report({
              messageId: 'unexpected-deprecated-global-attribute',
              node,
              data: {
                attribute,
                alternative: attribute.replace('nve-', 'nve-')
              },
              fix: fixer => {
                const newAttributeName = attribute.replace('nve-', 'nve-');

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
