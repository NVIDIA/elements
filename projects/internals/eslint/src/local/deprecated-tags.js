import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';

const DEPRECATED_TAGS = new Set(['nve-app-header', 'nve-alert-banner', 'nve-json-view']);

export default {
  meta: {
    type: 'code',
    docs: {
      description: 'Disallow use of deprecated elements in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: ''
    },

    fixable: null,
    schema: [],
    messages: {
      ['unexpected']: 'Unexpected use of deprecated tag <{{tag}}>'
    }
  },

  create(context) {
    return createVisitors(context, {
      Tag(node) {
        if (DEPRECATED_TAGS.has(node.name)) {
          context.report({
            node,
            data: {
              tag: node.name
            },
            messageId: 'unexpected'
          });
        }
      }
    });
  }
};
