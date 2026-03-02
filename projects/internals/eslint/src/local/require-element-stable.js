/**
 * ESLint rule that ensures `elementIsStable()` is called before assertions in tests
 * that use `@internals/testing` fixtures. Checks both the current describe's beforeEach
 * and any ancestor describe's beforeEach.
 *
 * Only flags describe blocks where the `@internals/testing` createFixture is called
 * in the test lifecycle (tracks local binding name to handle renames).
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'require-element-stable',
    docs: {
      description:
        'Ensures elementIsStable() is called before expect() assertions in tests that use @internals/testing.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'missing-element-stable':
        'Test uses `expect()` but `elementIsStable()` is not called in this test or its `beforeEach`. Await `elementIsStable(element)` before making assertions on elements.'
    }
  },
  create(context) {
    // Track the local binding name of createFixture from @internals/testing
    let createFixtureLocalName = null;
    // Stack tracks per-describe state: { hasFixture, hasStable }
    const describeStack = [];

    return {
      ImportDeclaration(node) {
        if (node.source.value === '@internals/testing') {
          for (const spec of node.specifiers) {
            const importedName = spec.imported ? spec.imported.name : spec.local.name;
            if (importedName === 'createFixture') {
              createFixtureLocalName = spec.local.name;
            }
          }
        }
      },
      'Program:exit'() {
        createFixtureLocalName = null;
        describeStack.length = 0;
      },
      CallExpression(node) {
        if (!createFixtureLocalName) {
          return;
        }

        if (!isDescribeCall(node)) {
          return;
        }

        const body = getCallbackBody(node);
        if (!body) {
          return;
        }

        const hasFixtureInBeforeEach = body.some(stmt => {
          const call = getExpressionCall(stmt);
          return call && isNamedCall(call, 'beforeEach') && callbackContains(call, createFixtureLocalName);
        });

        const hasStableInBeforeEach = body.some(stmt => {
          const call = getExpressionCall(stmt);
          return call && isNamedCall(call, 'beforeEach') && callbackContains(call, 'elementIsStable');
        });

        const ancestorHasFixture = describeStack.some(level => level.hasFixture);
        const ancestorHasStable = describeStack.some(level => level.hasStable);

        describeStack.push({ hasFixture: hasFixtureInBeforeEach, hasStable: hasStableInBeforeEach });

        // Only check if the @internals/testing createFixture is in the lifecycle
        const fixtureInScope = hasFixtureInBeforeEach || ancestorHasFixture;
        if (!fixtureInScope) {
          return;
        }

        for (const stmt of body) {
          const call = getExpressionCall(stmt);
          if (!call || !isItCall(call)) {
            continue;
          }

          const itCallback = call.arguments.find(
            arg => arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression'
          );
          if (!itCallback) {
            continue;
          }

          const hasExpect = containsCallTo(itCallback.body, 'expect');
          if (!hasExpect) {
            continue;
          }

          const hasStableInIt = containsCallTo(itCallback.body, 'elementIsStable');
          if (!hasStableInIt && !hasStableInBeforeEach && !ancestorHasStable) {
            context.report({ node: call, messageId: 'missing-element-stable' });
          }
        }
      },
      'CallExpression:exit'(node) {
        if (!createFixtureLocalName) {
          return;
        }
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

function isItCall(node) {
  if (node.callee.type === 'Identifier') {
    return node.callee.name === 'it' || node.callee.name === 'test';
  }
  return false;
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
