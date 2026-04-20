/**
 * ESLint rule that flags observer instances whose reference is discarded, making
 * disposal impossible. ResizeObserver, MutationObserver, IntersectionObserver, PerformanceObserver
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { findEnclosingClass } from './utils.js';

const OBSERVER_NAMES = new Set(['ResizeObserver', 'MutationObserver', 'IntersectionObserver', 'PerformanceObserver']);

export default {
  meta: {
    type: 'problem',
    name: 'require-observer-cleanup',
    docs: {
      description:
        'Flags observer instances created without storing a reference, which prevents them from being disconnected.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'inline-observer-leak':
        'The `{{kind}}` is created but its reference is discarded, so it can never be `.disconnect()`-ed. Assign it to a class field (e.g., `this.#observer = new {{kind}}(...)`) and call `this.#observer.disconnect()` in disconnectedCallback() to prevent the callback from firing on a detached element.'
    }
  },
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee.type !== 'Identifier' || !OBSERVER_NAMES.has(node.callee.name)) {
          return;
        }
        if (!findEnclosingClass(node)) {
          return;
        }
        if (isReferenceRetained(node)) {
          return;
        }
        context.report({
          node,
          messageId: 'inline-observer-leak',
          data: { kind: node.callee.name }
        });
      }
    };
  }
};

const RETAINED_CONTAINERS = new Set(['ReturnStatement', 'ArrowFunctionExpression', 'ArrayExpression', 'SpreadElement']);
const RETAINED_FIELDS = {
  VariableDeclarator: 'init',
  AssignmentExpression: 'right',
  PropertyDefinition: 'value',
  Property: 'value'
};

function isReferenceRetained(node) {
  const parent = node.parent;
  if (!parent) {
    return false;
  }
  if (RETAINED_CONTAINERS.has(parent.type)) {
    return true;
  }
  const field = RETAINED_FIELDS[parent.type];
  if (field) {
    return parent[field] === node;
  }
  if (parent.type === 'CallExpression' || parent.type === 'NewExpression') {
    return parent.arguments.includes(node);
  }
  return false;
}
