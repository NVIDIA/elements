import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

/**
 * ESLint rule that ensures component `render()` methods wrap content in an element
 * with the `internal-host` attribute. Styles target `[internal-host]` for API protection.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'require-internal-host',
    docs: {
      description: 'Ensures component render() methods wrap content in an element with the internal-host attribute.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'missing-internal-host':
        'The root element in `render()` must have an `internal-host` attribute. Add `internal-host` to the root element for style encapsulation.'
    }
  },
  create(context) {
    let inRenderMethod = false;
    let foundInternalHost = false;
    let renderNode = null;
    let rootTagCount = 0;

    return {
      MethodDefinition(node) {
        if (node.key.type === 'Identifier' && node.key.name === 'render' && !node.static) {
          inRenderMethod = true;
          foundInternalHost = false;
          renderNode = node;
          rootTagCount = 0;
        }
      },
      'MethodDefinition:exit'(node) {
        if (node.key.type === 'Identifier' && node.key.name === 'render' && !node.static) {
          if (inRenderMethod && renderNode && rootTagCount > 0 && !foundInternalHost) {
            context.report({ node: renderNode, messageId: 'missing-internal-host' });
          }
          inRenderMethod = false;
          renderNode = null;
        }
      },
      ...createVisitors(context, {
        Tag(node) {
          if (!inRenderMethod) {
            return;
          }

          rootTagCount++;

          // Only check the first root-level tag
          if (rootTagCount === 1) {
            // Bare <slot> elements are exempt (pass-through content wrappers)
            if (node.name === 'slot') {
              foundInternalHost = true;
            } else if (findAttr(node, 'internal-host')) {
              foundInternalHost = true;
            }
          }
        }
      })
    };
  }
};
