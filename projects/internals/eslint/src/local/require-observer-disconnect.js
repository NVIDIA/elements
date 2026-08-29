import {
  crossesInstanceThisContextBoundary,
  findEnclosingClass,
  isInstanceThisContextBoundary,
  propertyDefinitionAsThisMember,
  thisMemberText,
  walk
} from './utils.js';

const OBSERVER_NAMES = new Set(['IntersectionObserver', 'MutationObserver', 'PerformanceObserver', 'ResizeObserver']);
const OBSERVER_FACTORIES = new Set([
  'createIntersectionObserver',
  'createMutationObserver',
  'createPerformanceObserver',
  'createResizeObserver'
]);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    name: 'require-observer-disconnect',
    docs: {
      description: 'Requires observer instances stored on class fields to be disconnected.',
      category: 'Performance',
      recommended: false
    },
    schema: [],
    messages: {
      'missing-observer-disconnect':
        'The observer stored on `{{target}}` is never disconnected. Call `{{target}}.disconnect()` when the owner disconnects or disposes.'
    }
  },
  create(context) {
    return {
      AssignmentExpression(node) {
        checkStoredObserver(context, node.right, thisMemberText(node.left, context));
      },
      PropertyDefinition(node) {
        checkStoredObserver(context, node.value, propertyDefinitionAsThisMember(node, context));
      }
    };
  }
};

function checkStoredObserver(context, value, target) {
  if (!value || !target || !isObserverCreation(value)) return;
  if (crossesInstanceThisContextBoundary(value)) return;
  const classNode = findEnclosingClass(value);
  if (!classNode || classHasDisconnect(classNode, target, context)) return;
  context.report({ node: value, messageId: 'missing-observer-disconnect', data: { target } });
}

function isObserverCreation(node) {
  if (node.type === 'NewExpression') {
    return node.callee.type === 'Identifier' && OBSERVER_NAMES.has(node.callee.name);
  }
  if (node.type !== 'CallExpression') return false;
  const callee = node.callee;
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    OBSERVER_FACTORIES.has(callee.property.name)
  );
}

function classHasDisconnect(classNode, target, context) {
  let found = false;
  walk(classNode.body, node => {
    if (isInstanceThisContextBoundary(node)) return false;
    if (found || node.type !== 'CallExpression') return;
    const callee = node.callee;
    if (
      callee.type !== 'MemberExpression' ||
      callee.computed ||
      callee.property.type !== 'Identifier' ||
      callee.property.name !== 'disconnect'
    ) {
      return;
    }
    if (thisMemberText(callee.object, context) === target) found = true;
  });
  return found;
}
