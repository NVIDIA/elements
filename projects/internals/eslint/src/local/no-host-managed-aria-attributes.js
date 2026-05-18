const MANAGED_ATTRIBUTES = {
  'aria-current': 'stateCurrent',
  'aria-disabled': 'stateDisabled',
  'aria-expanded': 'stateExpanded',
  'aria-label': 'ElementInternals.ariaLabel',
  'aria-pressed': 'statePressed',
  'aria-selected': 'stateSelected',
  role: 'ElementInternals.role'
};

/**
 * Prevent setting host ARIA state attributes that should be managed through
 * ElementInternals and the shared state/type controllers.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'no-host-managed-aria-attributes',
    docs: {
      description: 'Prevent host ARIA state attributes that should be managed with ElementInternals.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'managed-attribute':
        'Use {{controller}} instead of setting "{{attribute}}" on the custom element host with {{method}}().'
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isHostAttributeMutation(node)) {
          return;
        }

        const attribute = getStaticString(node.arguments[0])?.toLowerCase();
        const controller = MANAGED_ATTRIBUTES[attribute];

        if (!controller) {
          return;
        }

        context.report({
          node,
          messageId: 'managed-attribute',
          data: {
            attribute,
            controller,
            method: node.callee.property.name
          }
        });
      }
    };
  }
};

function isHostAttributeMutation(node) {
  if (node.callee.type !== 'MemberExpression' || node.callee.computed) {
    return false;
  }

  if (node.callee.object.type !== 'ThisExpression') {
    return false;
  }

  return ['setAttribute', 'removeAttribute', 'toggleAttribute'].includes(node.callee.property.name);
}

function getStaticString(node) {
  if (!node) {
    return null;
  }

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked ?? null;
  }

  return null;
}
