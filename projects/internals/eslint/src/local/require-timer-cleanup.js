import { walk, normalize, findEnclosingClass } from './utils.js';

/**
 * ESLint rule that flags timer leaks in class lifecycles.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'require-timer-cleanup',
    docs: {
      description:
        'Flags setInterval without a stored handle, and stored setInterval/setTimeout calls whose handle is never cleared, in class bodies.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'unstoppable-interval':
        '`setInterval(...)` result is not stored, so the interval cannot be cleared. Assign it to a class field (e.g., `this.#intervalId = setInterval(...)`) and call `clearInterval(this.#intervalId)` in disconnectedCallback() to stop the interval when the element disconnects.',
      'missing-timer-cleanup':
        '`{{fn}}(...)` result is stored on `{{target}}` but no matching `{{clear}}({{target}})` is called anywhere in the class. Clear the timer in disconnectedCallback() so it does not fire on a detached element.'
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        const fnName = getTimerFnName(node.callee);
        if (!fnName) {
          return;
        }
        const classNode = findEnclosingClass(node);
        if (!classNode) {
          return;
        }
        classifyAndReport(context, node, fnName, classNode);
      }
    };
  }
};

const SET_FNS = new Set(['setInterval', 'setTimeout']);

function getTimerFnName(callee) {
  if (callee.type === 'Identifier' && SET_FNS.has(callee.name)) {
    return callee.name;
  }
  if (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier' &&
    SET_FNS.has(callee.property.name)
  ) {
    return callee.property.name;
  }
  return null;
}

function classifyAndReport(context, callNode, fnName, classNode) {
  const parent = callNode.parent;
  if (!parent) {
    return;
  }

  const stored = getStoredMemberText(parent, callNode, context);
  if (stored) {
    const clearName = fnName === 'setInterval' ? 'clearInterval' : 'clearTimeout';
    if (!classHasClearForTarget(classNode, clearName, stored, context)) {
      context.report({
        node: callNode,
        messageId: 'missing-timer-cleanup',
        data: { fn: fnName, target: stored, clear: clearName }
      });
    }
    return;
  }

  if (parent.type === 'ExpressionStatement' && fnName === 'setInterval') {
    context.report({ node: callNode, messageId: 'unstoppable-interval' });
  }
}

function getStoredMemberText(parent, callNode, context) {
  if (parent.type === 'AssignmentExpression' && parent.right === callNode) {
    return thisMemberText(parent.left, context);
  }
  if (parent.type === 'PropertyDefinition' && parent.value === callNode) {
    return propertyDefinitionAsThisMember(parent, context);
  }
  return null;
}

function thisMemberText(node, context) {
  if (!node || node.type !== 'MemberExpression') {
    return null;
  }
  if (node.object.type !== 'ThisExpression') {
    return null;
  }
  return normalize(context.sourceCode.getText(node));
}

function propertyDefinitionAsThisMember(propertyDefinitionNode, context) {
  if (propertyDefinitionNode.static) {
    return null;
  }
  const key = propertyDefinitionNode.key;
  if (key.type === 'PrivateIdentifier') {
    return `this.#${key.name}`;
  }
  if (key.type === 'Identifier') {
    return `this.${key.name}`;
  }
  return `this[${context.sourceCode.getText(key)}]`;
}

function classHasClearForTarget(classNode, clearName, targetText, context) {
  let found = false;
  walk(classNode.body, node => {
    if (found || node.type !== 'CallExpression') {
      return;
    }
    const name = getClearFnName(node.callee);
    if (name !== clearName) {
      return;
    }
    if (node.arguments.length === 0) {
      return;
    }
    const argText = normalize(context.sourceCode.getText(node.arguments[0]));
    if (argText === targetText) {
      found = true;
    }
  });
  return found;
}

function getClearFnName(callee) {
  if (callee.type === 'Identifier' && (callee.name === 'clearInterval' || callee.name === 'clearTimeout')) {
    return callee.name;
  }
  if (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier' &&
    (callee.property.name === 'clearInterval' || callee.property.name === 'clearTimeout')
  ) {
    return callee.property.name;
  }
  return null;
}
