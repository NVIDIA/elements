import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

const RESTRICTED_ATTRIBUTES = ['nve-text', 'nve-layout', 'nve-text', 'nve-layout'];

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
            context.report({
              messageId: 'no-restricted-attributes',
              node,
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
