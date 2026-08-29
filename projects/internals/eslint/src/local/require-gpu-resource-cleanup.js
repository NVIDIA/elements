import {
  crossesInstanceThisContextBoundary,
  findEnclosingClass,
  isInstanceThisContextBoundary,
  propertyDefinitionAsThisMember,
  thisMemberText,
  walk
} from './utils.js';

const GPU_RESOURCE_FACTORIES = new Set(['createBuffer', 'createQuerySet', 'createTexture']);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    name: 'require-gpu-resource-cleanup',
    docs: {
      description: 'Requires GPU buffers, textures, and query sets retained on class fields to be destroyed.',
      category: 'Performance',
      recommended: false
    },
    schema: [],
    messages: {
      'missing-gpu-cleanup':
        'The GPU resource stored on `{{target}}` is never destroyed. Call `{{target}}.destroy()` when its owner disconnects, disposes, or replaces it.'
    }
  },
  create(context) {
    return {
      AssignmentExpression(node) {
        checkStoredResource(context, node.right, thisMemberText(node.left, context));
      },
      PropertyDefinition(node) {
        checkStoredResource(context, node.value, propertyDefinitionAsThisMember(node, context));
      }
    };
  }
};

function checkStoredResource(context, value, target) {
  if (!value || !target || !isGpuResourceCreation(value)) return;
  if (crossesInstanceThisContextBoundary(value)) return;
  const classNode = findEnclosingClass(value);
  if (!classNode || classHasDestroy(classNode, target, context)) return;
  context.report({ node: value, messageId: 'missing-gpu-cleanup', data: { target } });
}

function isGpuResourceCreation(node) {
  if (node.type !== 'CallExpression') return false;
  const callee = node.callee;
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    GPU_RESOURCE_FACTORIES.has(callee.property.name) &&
    isGpuDevice(callee.object)
  );
}

function isGpuDevice(node) {
  if (node.type === 'Identifier') return /(?:device|gpu)$/iu.test(node.name);
  if (node.type !== 'MemberExpression') return false;
  if (!node.computed && (node.property.type === 'Identifier' || node.property.type === 'PrivateIdentifier')) {
    return /(?:device|gpu)$/iu.test(node.property.name);
  }
  return node.property.type === 'Literal' && typeof node.property.value === 'string'
    ? /(?:device|gpu)$/iu.test(node.property.value)
    : false;
}

function classHasDestroy(classNode, target, context) {
  let found = false;
  walk(classNode.body, node => {
    if (isInstanceThisContextBoundary(node)) return false;
    if (found || node.type !== 'CallExpression') return;
    const callee = node.callee;
    if (
      callee.type === 'MemberExpression' &&
      callee.property.type === 'Identifier' &&
      callee.property.name === 'destroy' &&
      thisMemberText(callee.object, context) === target
    ) {
      found = true;
    }
  });
  return found;
}
