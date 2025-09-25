import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

const DEPRECATED_ATTRIBUTES = {
  'nve-badge': {
    status: ['trend-up', 'trend-down', 'trend-neutral']
  }
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated attributes in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-attribute']: 'Unexpected use of deprecated attribute {{attribute}}'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const deprecatedAttributes: Record<string, string[]> | undefined = DEPRECATED_ATTRIBUTES[node.name];
        if (deprecatedAttributes) {
          Object.entries(deprecatedAttributes).forEach(([attribute, values]) => {
            const attr = findAttr(node, attribute);
            if (attr && values.includes(attr.value.value)) {
              context.report({
                node,
                data: {
                  attribute
                },
                messageId: 'unexpected-deprecated-attribute'
              });
            }
          });
        }
      }
    });
  }
} as const;

export default rule;
