import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

const DEPRECATED_POPOVER_ATTRIBUTES = {
  'nve-dialog': ['trigger', 'behavior-trigger'],
  'nve-tooltip': ['trigger', 'behavior-trigger'],
  'nve-toast': ['trigger', 'behavior-trigger'],
  'nve-drawer': ['trigger', 'behavior-trigger'],
  'nve-dropdown': ['trigger', 'behavior-trigger'],
  'nve-notification': ['trigger', 'behavior-trigger']
} as const;

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated popover attributes.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-popover-attribute']:
        'Unexpected use of deprecated popover attribute {{attribute}}. Use native HTML popover API instead.'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        Object.entries(DEPRECATED_POPOVER_ATTRIBUTES).forEach(([tag, attributes]) => {
          if (node.name === tag) {
            attributes.forEach(attribute => {
              const attr = findAttr(node, attribute);
              if (attr) {
                context.report({
                  node,
                  data: {
                    attribute
                  },
                  messageId: 'unexpected-deprecated-popover-attribute'
                });
              }
            });
          }
        });
      }
    });
  }
} as const;

export default rule;
