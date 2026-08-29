import { isHotPath, walk } from './utils.js';

const BUFFER_CONSTRUCTORS = new Set([
  'ArrayBuffer',
  'BigInt64Array',
  'BigUint64Array',
  'DataView',
  'Float32Array',
  'Float64Array',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'SharedArrayBuffer',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array'
]);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    name: 'no-hot-path-buffer-allocation',
    docs: {
      description: 'Flags buffer and view construction in annotated and renderer hot paths.',
      category: 'Performance',
      recommended: false
    },
    schema: [],
    messages: {
      'buffer-constructor':
        '`new {{kind}}` allocates storage or a view inside a hot path. Reuse owned scratch storage or move initialization outside the repeated path.'
    }
  },
  create(context) {
    return {
      FunctionDeclaration(node) {
        if (isHotPath(context, node)) inspectHotPath(context, node.body);
      },
      MethodDefinition(node) {
        if (isHotPath(context, node)) inspectHotPath(context, node.value.body);
      },
      PropertyDefinition(node) {
        if (isFunction(node.value) && isHotPath(context, node)) inspectHotPath(context, node.value.body);
      },
      VariableDeclaration(node) {
        if (!isHotPath(context, node)) return;
        for (const declaration of node.declarations) {
          if (isFunction(declaration.init)) inspectHotPath(context, declaration.init.body);
        }
      }
    };
  }
};

function isFunction(node) {
  return (
    node?.type === 'ArrowFunctionExpression' ||
    node?.type === 'FunctionDeclaration' ||
    node?.type === 'FunctionExpression'
  );
}

function inspectHotPath(context, body) {
  walk(body, node => {
    if (isFunction(node)) return false;
    if (
      node.type === 'NewExpression' &&
      node.callee.type === 'Identifier' &&
      BUFFER_CONSTRUCTORS.has(node.callee.name)
    ) {
      context.report({ node, messageId: 'buffer-constructor', data: { kind: node.callee.name } });
    }
  });
}
