const TERMINAL_METHODS = new Set(['every', 'find', 'findIndex', 'forEach', 'reduce', 'reduceRight', 'some']);
const TYPED_ARRAY_NAMES = new Set([
  'BigInt64Array',
  'BigUint64Array',
  'Float32Array',
  'Float64Array',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array'
]);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    name: 'prefer-direct-typed-array-iteration',
    docs: {
      description: 'Avoids copying typed arrays with Array.from before operations that do not transform the array.',
      category: 'Performance',
      recommended: false
    },
    schema: [],
    messages: {
      'unnecessary-copy':
        '`Array.from` copies this typed array before `{{method}}`. Call `{{method}}` on the typed array directly to avoid the allocation.'
    }
  },
  create(context) {
    const services = context.sourceCode.parserServices;
    const checker = services?.program?.getTypeChecker();
    const nodeMap = services?.esTreeNodeToTSNodeMap;
    if (!checker || !nodeMap) return {};

    return {
      CallExpression(node) {
        const match = matchCopiedTerminalCall(node);
        if (!match || !isTypedArray(checker, nodeMap.get(match.source))) return;
        context.report({
          node: match.copy,
          messageId: 'unnecessary-copy',
          data: { method: match.method }
        });
      }
    };
  }
};

function matchCopiedTerminalCall(node) {
  const callee = node.callee;
  if (callee.type !== 'MemberExpression' || callee.computed || callee.property.type !== 'Identifier') return null;
  if (!TERMINAL_METHODS.has(callee.property.name)) return null;
  const copy = callee.object;
  if (copy.type !== 'CallExpression' || copy.arguments.length !== 1) return null;
  const from = copy.callee;
  if (
    from.type !== 'MemberExpression' ||
    from.computed ||
    from.object.type !== 'Identifier' ||
    from.object.name !== 'Array' ||
    from.property.type !== 'Identifier' ||
    from.property.name !== 'from'
  ) {
    return null;
  }
  const source = copy.arguments[0];
  return source.type === 'SpreadElement' ? null : { copy, method: callee.property.name, source };
}

function isTypedArray(checker, node) {
  const type = checker.getTypeAtLocation(node);
  if (type.isUnion()) return type.types.every(member => isTypedArrayType(member));
  return isTypedArrayType(type);
}

function isTypedArrayType(type) {
  const name = type.getSymbol()?.getName() ?? type.aliasSymbol?.getName();
  return name !== undefined && TYPED_ARRAY_NAMES.has(name);
}
