import {
  crossesInstanceThisContextBoundary,
  findEnclosingClass,
  isInstanceThisContextBoundary,
  propertyDefinitionAsThisMember,
  thisMemberText,
  walk
} from './utils.js';

const REQUEST_NAME = 'requestAnimationFrame';
const CANCEL_NAME = 'cancelAnimationFrame';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    name: 'require-animation-frame-cleanup',
    docs: {
      description: 'Requires animation frame handles stored on a class to be canceled.',
      category: 'Performance',
      recommended: false
    },
    schema: [],
    messages: {
      'missing-frame-cleanup':
        '`requestAnimationFrame` stores its handle on `{{target}}`, but the class never calls `cancelAnimationFrame({{target}})`. Cancel pending frame work when the owner disconnects or disposes.'
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        if (getMemberCallName(node.callee) !== REQUEST_NAME) return;
        const target = getStoredMemberText(node.parent, node, context);
        if (crossesInstanceThisContextBoundary(node)) return;
        const classNode = findEnclosingClass(node);
        if (!classNode || !target || classHasCancellation(classNode, target, context)) return;
        context.report({ node, messageId: 'missing-frame-cleanup', data: { target } });
      }
    };
  }
};

function classHasCancellation(classNode, target, context) {
  let found = false;
  walk(classNode.body, node => {
    if (isInstanceThisContextBoundary(node)) return false;
    if (found || node.type !== 'CallExpression' || getMemberCallName(node.callee) !== CANCEL_NAME) return;
    const argument = node.arguments[0];
    if (argument && argument.type !== 'SpreadElement' && thisMemberText(argument, context) === target) {
      found = true;
    }
  });
  return found;
}

function getMemberCallName(callee) {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type !== 'MemberExpression' || callee.computed || callee.property.type !== 'Identifier') return null;
  return callee.property.name;
}

function getStoredMemberText(parent, callNode, context) {
  if (!parent) return null;
  if (parent.type === 'AssignmentExpression' && parent.right === callNode) {
    return thisMemberText(parent.left, context);
  }
  if (parent.type === 'PropertyDefinition' && parent.value === callNode) {
    return propertyDefinitionAsThisMember(parent, context);
  }
  return null;
}
