import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

/**
 * A ESLint rule that ensures encapsulated `nve-*` elements are exposed as CSS parts in lit templates.
 *
 * Example of invalid use:
 *
 * <div internal-host>
 *   <slot></slot>
 *   <nve-icon name="close"></nve-icon>
 * </div>
 *
 * Example of valid use:
 *
 * <div internal-host>
 *   <slot></slot>
 *   <nve-icon name="close" part="icon"></nve-icon>
 * </div>
 *
 * @type {import('eslint').Linter.Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'required-css-parts',
    docs: {
      description: 'Ensures encapsulated `nve-*` elements are exposed as CSS parts in lit templates.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    fixable: 'code',
    messages: {
      'missing-css-part':
        'Encapsulated `nve-*` element <{{tagName}}> must be exposed as a CSS part. Add a `part` attribute.'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const tagName = node.name;
        if (tagName && tagName.startsWith('nve-')) {
          if (!findAttr(node, 'part')) {
            const partName = tagName.replace('nve-', '');

            context.report({
              node,
              messageId: 'missing-css-part',
              data: {
                tagName
              },
              fix: fixer => {
                const sourceCode = context.getSourceCode();
                const tagText = sourceCode.getText(node);

                // Insert part attribute after the tag name
                // Replace: <nve-icon name="close">
                // With:    <nve-icon part="icon" name="close">
                const tagNameEnd = tagName.length + 1; // +1 for '<'
                const modifiedTag = `${tagText.slice(0, tagNameEnd)} part="${partName}"${tagText.slice(tagNameEnd)}`;
                return fixer.replaceText(node, modifiedTag);
              }
            });
          }
        }
      }
    });
  }
};
