import { isHotPath, walk } from './utils.js';

const ALLOCATING_METHODS = new Set([
  'concat',
  'filter',
  'flat',
  'flatMap',
  'map',
  'slice',
  'toReversed',
  'toSorted',
  'toSpliced',
  'with'
]);
const ALLOCATING_CONSTRUCTORS = new Set(['Array', 'Map', 'Set']);
const COLLECTION_TYPE_NAMES = new Set([
  'Array',
  'BigInt64Array',
  'BigUint64Array',
  'Float32Array',
  'Float64Array',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'ReadonlyArray',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array'
]);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    name: 'no-hot-path-collection-allocation',
    docs: {
      description: 'Flags collection-producing operations in explicit and recognized renderer hot paths.',
      category: 'Performance',
      recommended: false
    },
    schema: [],
    messages: {
      'allocating-method':
        '`{{method}}` creates a collection inside a hot path. Iterate directly or reuse caller-owned scratch storage.',
      'array-copy': '`Array.from` creates a collection inside a hot path. Iterate the source directly when possible.',
      'array-spread': 'Array spread creates a collection inside a hot path. Iterate the source directly when possible.',
      'collection-constructor':
        '`new {{kind}}` creates a collection inside a hot path. Reuse owned storage or move initialization outside the repeated path.'
    }
  },
  create(context) {
    const services = context.sourceCode.parserServices;
    const checker = services?.program?.getTypeChecker();
    const nodeMap = services?.esTreeNodeToTSNodeMap;

    return {
      FunctionDeclaration(node) {
        if (isHotPath(context, node)) inspectHotPath(context, node.body, checker, nodeMap);
      },
      MethodDefinition(node) {
        if (isHotPath(context, node)) inspectHotPath(context, node.value.body, checker, nodeMap);
      },
      PropertyDefinition(node) {
        if (isFunction(node.value) && isHotPath(context, node))
          inspectHotPath(context, node.value.body, checker, nodeMap);
      },
      VariableDeclaration(node) {
        if (!isHotPath(context, node)) return;
        for (const declaration of node.declarations) {
          if (isFunction(declaration.init)) inspectHotPath(context, declaration.init.body, checker, nodeMap);
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

function inspectHotPath(context, body, checker, nodeMap) {
  walk(body, node => {
    if (isFunction(node)) return false;
    if (
      node.type === 'NewExpression' &&
      node.callee.type === 'Identifier' &&
      ALLOCATING_CONSTRUCTORS.has(node.callee.name)
    ) {
      context.report({ node, messageId: 'collection-constructor', data: { kind: node.callee.name } });
      return;
    }
    if (node.type === 'ArrayExpression' && node.elements.some(element => element?.type === 'SpreadElement')) {
      context.report({ node, messageId: 'array-spread' });
      return;
    }
    if (node.type !== 'CallExpression') return;
    if (isArrayFrom(node.callee)) {
      context.report({ node, messageId: 'array-copy' });
      return;
    }
    const method = getAllocatingMethod(node.callee, checker, nodeMap);
    if (method) context.report({ node, messageId: 'allocating-method', data: { method } });
  });
}

function isArrayFrom(callee) {
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'Array' &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'from'
  );
}

function getAllocatingMethod(callee, checker, nodeMap) {
  if (callee.type !== 'MemberExpression' || callee.computed || callee.property.type !== 'Identifier') return null;
  const receiver = nodeMap?.get(callee.object);
  if (!checker || !receiver || !isCollectionType(checker, checker.getTypeAtLocation(receiver))) return null;
  return ALLOCATING_METHODS.has(callee.property.name) ? callee.property.name : null;
}

function isCollectionType(checker, type) {
  if (type.isUnion()) return type.types.every(member => isCollectionType(checker, member));
  if (type.isIntersection()) return type.types.some(member => isCollectionType(checker, member));
  if (checker.isArrayType(type) || checker.isTupleType(type)) return true;
  const name = type.getSymbol()?.getName();
  if (name !== undefined && COLLECTION_TYPE_NAMES.has(name)) return true;
  const constraint = checker.getBaseConstraintOfType(type);
  return constraint !== undefined && constraint !== type && isCollectionType(checker, constraint);
}
