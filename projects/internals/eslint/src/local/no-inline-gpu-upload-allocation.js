const BUFFER_SOURCE_CONSTRUCTORS = new Set([
  'ArrayBuffer',
  'BigInt64Array',
  'BigUint64Array',
  'DataView',
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
    name: 'no-inline-gpu-upload-allocation',
    docs: {
      description: 'Flags inline BufferSource allocation in WebGPU queue uploads.',
      category: 'Performance',
      recommended: false
    },
    schema: [],
    messages: {
      'inline-upload-allocation':
        '`{{method}}` allocates a `{{kind}}` inline. Reuse a scratch BufferSource in repeated upload paths to avoid per-frame garbage.'
    }
  },
  create(context) {
    const services = context.sourceCode.parserServices;
    const checker = services?.program?.getTypeChecker();
    const nodeMap = services?.esTreeNodeToTSNodeMap;

    return {
      CallExpression(node) {
        const method = getUploadMethod(node.callee, checker, nodeMap);
        if (!method) return;
        const source = node.arguments[method === 'writeBuffer' ? 2 : 1];
        if (!source || source.type !== 'NewExpression' || source.callee.type !== 'Identifier') return;
        if (!BUFFER_SOURCE_CONSTRUCTORS.has(source.callee.name)) return;
        context.report({
          node: source,
          messageId: 'inline-upload-allocation',
          data: { kind: source.callee.name, method }
        });
      }
    };
  }
};

function getUploadMethod(callee, checker, nodeMap) {
  if (callee.type !== 'MemberExpression' || callee.computed || callee.property.type !== 'Identifier') return null;
  const receiver = nodeMap?.get(callee.object);
  if (!checker || !receiver || !isGpuQueueType(checker.getTypeAtLocation(receiver))) return null;
  return callee.property.name === 'writeBuffer' || callee.property.name === 'writeTexture'
    ? callee.property.name
    : null;
}

function isGpuQueueType(type) {
  if (type.isUnion()) return type.types.every(isGpuQueueType);
  if (type.isIntersection()) return type.types.some(isGpuQueueType);
  if (type.getSymbol()?.getName() === 'GPUQueue') return true;
  return type.getBaseTypes()?.some(isGpuQueueType) === true;
}
