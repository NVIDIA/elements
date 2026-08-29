const ITERATION_METHODS = new Set([
  'every',
  'filter',
  'find',
  'findIndex',
  'flatMap',
  'forEach',
  'map',
  'reduce',
  'reduceRight',
  'some'
]);
const LOOP_NODES = new Set(['DoWhileStatement', 'ForInStatement', 'ForOfStatement', 'ForStatement', 'WhileStatement']);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    name: 'no-gpu-upload-in-loop',
    docs: {
      description: 'Flags direct WebGPU queue uploads repeated by loops or collection callbacks.',
      category: 'Performance',
      recommended: false
    },
    schema: [],
    messages: {
      'repeated-upload':
        '`{{method}}` runs inside repeated iteration. Batch uploads or merge dirty ranges before crossing the WebGPU boundary.'
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        const method = getUploadMethod(node.callee);
        if (method && isRepeated(node)) {
          context.report({ node, messageId: 'repeated-upload', data: { method } });
        }
      }
    };
  }
};

function getUploadMethod(callee) {
  if (callee.type !== 'MemberExpression' || !isGpuQueue(callee.object)) return null;
  const name = callee.computed
    ? callee.property.type === 'Literal' && typeof callee.property.value === 'string'
      ? callee.property.value
      : undefined
    : callee.property.type === 'Identifier'
      ? callee.property.name
      : undefined;
  return name === 'writeBuffer' || name === 'writeTexture' ? name : null;
}

function isGpuQueue(node) {
  if (node.type === 'Identifier') return /queue$/iu.test(node.name);
  if (node.type !== 'MemberExpression') return false;
  if (!node.computed && node.property.type === 'Identifier') return /queue$/iu.test(node.property.name);
  return node.property.type === 'Literal' && typeof node.property.value === 'string'
    ? /queue$/iu.test(node.property.value)
    : false;
}

function isRepeated(node) {
  let current = node.parent;
  while (current) {
    if (LOOP_NODES.has(current.type)) return true;
    if (isFunction(current)) return isIterationCallback(current);
    current = current.parent;
  }
  return false;
}

function isFunction(node) {
  return (
    node.type === 'ArrowFunctionExpression' || node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression'
  );
}

function isIterationCallback(node) {
  const call = node.parent;
  if (call?.type !== 'CallExpression' || !call.arguments.includes(node)) return false;
  const callee = call.callee;
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    ITERATION_METHODS.has(callee.property.name)
  );
}
