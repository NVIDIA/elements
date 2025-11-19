import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

/**
 * A ESLint rule that disallows public API use of CSS parts except on nve-* elements that already have a supported public API surface.
 * Parts with an underscore prefix (_) are allowed as they indicate internal/private parts.
 *
 * Example of invalid use:
 *
 * <div internal-host>
 *   <slot part="content"></slot>
 * </div>
 *
 * Example of valid use:
 *
 * <div internal-host>
 *   <slot part="_content"></slot>
 *   <nve-icon part="icon" name="close"></nve-icon>
 * </div>
 *
 * @type {import('eslint').Linter.Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'no-invalid-css-parts',
    docs: {
      description:
        'Disallows public API use of CSS parts except on nve-* elements that already have a supported public API surface.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'invalid-css-part':
        'The `part` attribute should only be used on `nve-*` elements or with an underscore prefix (e.g., part="_internal"). Element <{{tagName}}> should not expose public CSS parts.'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const tagName = node.name;

        // Check if element has a part attribute
        const partAttr = findAttr(node, 'part');

        if (partAttr) {
          // If it has a part attribute but is NOT an nve-* element
          if (!tagName || !tagName.startsWith('nve-')) {
            // Get the part value
            const partValue = partAttr.value?.value;

            // Allow parts that start with underscore (private/internal parts)
            const isPrivatePart = partValue && partValue.trim().startsWith('_');

            if (!isPrivatePart) {
              context.report({
                node,
                messageId: 'invalid-css-part',
                data: {
                  tagName: tagName || 'unknown'
                }
              });
            }
          }
        }
      }
    });
  }
};
