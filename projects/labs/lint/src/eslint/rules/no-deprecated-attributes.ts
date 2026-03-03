import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

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
      ['unexpected-deprecated-attribute']: 'Unexpected use of deprecated value "{{value}}" in attribute "{{attribute}}"'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const deprecatedAttributes: Record<string, string[]> | undefined =
          DEPRECATED_ATTRIBUTES[node.name as keyof typeof DEPRECATED_ATTRIBUTES];
        if (deprecatedAttributes) {
          Object.entries(deprecatedAttributes).forEach(([attribute, values]) => {
            const attr = findAttr(node, attribute);
            const value = attr?.value?.value;
            if (attr && values.includes(value)) {
              context.report({
                node: attr,
                data: {
                  attribute,
                  value
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
