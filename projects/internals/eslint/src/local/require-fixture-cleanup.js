/**
 * ESLint rule that ensures `removeFixture()` is called in `afterEach` when `createFixture` is used in `beforeEach`.
 * Missing cleanup causes DOM pollution between test suites, leading to flaky tests.
 *
 * Checks both the current describe's afterEach and any ancestor describe's afterEach.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'require-fixture-cleanup',
    docs: {
      description: 'Ensures removeFixture() is called in afterEach when createFixture is used in beforeEach.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'missing-cleanup':
        'A `beforeEach` in this `describe` block calls `createFixture` but no sibling `afterEach` calls `removeFixture`. Add `afterEach(() => removeFixture())` to prevent DOM pollution between tests.'
    }
  },
  create(context) {
    const describeStack = [];

    return {
      CallExpression(node) {
        if (!isDescribeCall(node)) {
          return;
        }

        const body = getCallbackBody(node);
        if (!body) {
          return;
        }

        const hasCreateFixtureInBeforeEach = body.some(stmt => {
          const call = getExpressionCall(stmt);
          return call && isNamedCall(call, 'beforeEach') && callbackContains(call, 'createFixture');
        });

        const hasRemoveFixtureInAfterEach = body.some(stmt => {
          const call = getExpressionCall(stmt);
          return call && isNamedCall(call, 'afterEach') && callbackContains(call, 'removeFixture');
        });

        const ancestorHasCleanup = describeStack.some(level => level.hasCleanup);

        describeStack.push({ hasCleanup: hasRemoveFixtureInAfterEach });

        if (!hasCreateFixtureInBeforeEach) {
          return;
        }

        if (!hasRemoveFixtureInAfterEach && !ancestorHasCleanup) {
          context.report({ node, messageId: 'missing-cleanup' });
        }
      },
      'CallExpression:exit'(node) {
        if (isDescribeCall(node) && getCallbackBody(node)) {
          describeStack.pop();
        }
      }
    };
  }
};

function isDescribeCall(node) {
  return node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'describe';
}

function getCallbackBody(callNode) {
  const callback = callNode.arguments.find(
    arg => arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression'
  );
  if (!callback || !callback.body || callback.body.type !== 'BlockStatement') {
    return null;
  }
  return callback.body.body;
}

function getExpressionCall(stmt) {
  if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'CallExpression') {
    return stmt.expression;
  }
  return null;
}

function isNamedCall(callNode, name) {
  return callNode.callee.type === 'Identifier' && callNode.callee.name === name;
}

function callbackContains(callNode, fnName) {
  const callback = callNode.arguments.find(
    arg => arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression'
  );
  if (!callback) {
    return false;
  }
  return containsCallTo(callback.body, fnName);
}

function containsCallTo(node, fnName) {
  if (!node || typeof node !== 'object') {
    return false;
  }

  if (node.type === 'CallExpression') {
    if (node.callee.type === 'Identifier' && node.callee.name === fnName) {
      return true;
    }
    if (
      node.callee.type === 'MemberExpression' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === fnName
    ) {
      return true;
    }
  }

  for (const key of Object.keys(node)) {
    if (key === 'parent') {
      continue;
    }
    const child = node[key];
    if (Array.isArray(child)) {
      if (child.some(c => containsCallTo(c, fnName))) {
        return true;
      }
    } else if (child && typeof child === 'object' && child.type) {
      if (containsCallTo(child, fnName)) {
        return true;
      }
    }
  }
  return false;
}
