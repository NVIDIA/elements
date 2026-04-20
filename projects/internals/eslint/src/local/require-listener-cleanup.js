import { walk, normalize } from './utils.js';

/**
 * ESLint rule that catches event listener leaks in Web Component class lifecycles.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'require-listener-cleanup',
    docs: {
      description:
        'Ensures addEventListener calls in connectedCallback have a matching removeEventListener in disconnectedCallback, and forbids addEventListener in the constructor.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'missing-cleanup':
        '`addEventListener` on `{{target}}` for `{{event}}` is called in connectedCallback() but no matching `removeEventListener` is called in disconnectedCallback(). Attach via an arrow class field and remove the same reference in disconnectedCallback() to prevent a listener leak when the element disconnects and reconnects.',
      'missing-disconnected':
        '`connectedCallback` attaches event listeners but the class has no `disconnectedCallback`. Add a `disconnectedCallback` that removes each listener with its original reference to prevent a leak when the element disconnects and reconnects.',
      'listener-in-constructor':
        '`addEventListener` on `{{target}}` for `{{event}}` is called in the constructor. The constructor runs once per instance, so this listener cannot be paired with a `removeEventListener` in disconnectedCallback() and leaks across reconnects. Targets like `this.shadowRoot` are also still `null` at construction time. Move the call into connectedCallback() and pair it with a remove in disconnectedCallback().'
    }
  },
  create(context) {
    return {
      ClassDeclaration: node => checkClass(context, node),
      ClassExpression: node => checkClass(context, node)
    };
  }
};

function checkClass(context, classNode) {
  checkConstructor(context, classNode);
  checkConnectedCallback(context, classNode);
}

function checkConstructor(context, classNode) {
  const ctor = classNode.body.body.find(member => member.type === 'MethodDefinition' && member.kind === 'constructor');
  if (!ctor) {
    return;
  }
  for (const add of collectListenerCalls(context, classNode, ctor, 'addEventListener')) {
    context.report({
      node: add.node,
      messageId: 'listener-in-constructor',
      data: { target: add.target, event: add.event }
    });
  }
}

function checkConnectedCallback(context, classNode) {
  const connected = findMethod(classNode, 'connectedCallback');
  if (!connected) {
    return;
  }

  const addCalls = collectListenerCalls(context, classNode, connected, 'addEventListener');
  if (addCalls.length === 0) {
    return;
  }

  const disconnected = findMethod(classNode, 'disconnectedCallback');
  if (!disconnected) {
    context.report({ node: connected, messageId: 'missing-disconnected' });
    return;
  }

  const removeCalls = collectListenerCalls(context, classNode, disconnected, 'removeEventListener');

  for (const add of addCalls) {
    const hasMatch = removeCalls.some(remove => remove.target === add.target && remove.event === add.event);
    if (!hasMatch) {
      context.report({
        node: add.node,
        messageId: 'missing-cleanup',
        data: { target: add.target, event: add.event }
      });
    }
  }
}

function findMethod(classNode, methodName) {
  return classNode.body.body.find(
    member =>
      member.type === 'MethodDefinition' &&
      !member.static &&
      member.key.type === 'Identifier' &&
      member.key.name === methodName
  );
}

/**
 * depth-1 follow-through catches the common connectedCallback delegating to a helper that adds listeners
 */
function collectListenerCalls(context, classNode, methodNode, methodName) {
  const results = [];
  const visited = new Set();
  visited.add(methodNode);
  collectInBody(context, methodNode.value.body, methodName, results);

  walk(methodNode.value.body, node => {
    if (node.type !== 'CallExpression') {
      return;
    }
    const resolved = resolvePrivateMethodCall(node, classNode);
    if (!resolved || visited.has(resolved)) {
      return;
    }
    visited.add(resolved);
    collectInBody(context, resolved.value.body, methodName, results);
  });

  return results;
}

function collectInBody(context, body, methodName, results) {
  walk(body, node => {
    if (node.type !== 'CallExpression') {
      return;
    }
    const member = node.callee;
    if (
      member.type !== 'MemberExpression' ||
      member.property.type !== 'Identifier' ||
      member.property.name !== methodName ||
      node.arguments.length === 0
    ) {
      return;
    }
    results.push({
      node,
      target: normalize(context.sourceCode.getText(member.object)),
      event: normalize(context.sourceCode.getText(node.arguments[0]))
    });
  });
}

function resolvePrivateMethodCall(callNode, classNode) {
  const callee = callNode.callee;
  if (!callee || callee.type !== 'MemberExpression') {
    return null;
  }
  if (callee.object.type !== 'ThisExpression' || callee.property.type !== 'PrivateIdentifier') {
    return null;
  }
  const name = callee.property.name;
  return classNode.body.body.find(
    member =>
      member.type === 'MethodDefinition' &&
      !member.static &&
      member.kind === 'method' &&
      member.key.type === 'PrivateIdentifier' &&
      member.key.name === name
  );
}
