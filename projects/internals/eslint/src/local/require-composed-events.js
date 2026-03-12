/**
 * ESLint rule that ensures CustomEvents with `bubbles: true` also set `composed: true`
 * so they propagate across shadow DOM boundaries.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'require-composed-events',
    docs: {
      description: 'CustomEvent with `bubbles: true` should also set `composed: true`.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'missing-composed':
        'CustomEvent with `bubbles: true` should also set `composed: true` to propagate across shadow DOM boundaries.'
    }
  },
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'CustomEvent') {
          return;
        }

        const options = node.arguments[1];
        if (!options || options.type !== 'ObjectExpression') {
          return;
        }

        const bubblesProp = options.properties.find(
          p => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'bubbles'
        );

        if (!bubblesProp || bubblesProp.value.value !== true) {
          return;
        }

        const composedProp = options.properties.find(
          p => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'composed'
        );

        if (!composedProp || composedProp.value.value !== true) {
          context.report({ node, messageId: 'missing-composed' });
        }
      }
    };
  }
};
