import { findHtmlTemplate, hasTag } from './example-helpers.js';

const defaultMaxChars = 4000; // ~1000 tokens
const patternMaxChars = 10_000; // ~2500 tokens

/**
 * ESLint rule that enforces maximum character count for example HTML templates
 * to constrain context usage in MCP/CLI tools.
 *
 * - Default limit: 4,000 characters
 * - Pattern limit: 10,000 characters
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'example-template-size',
    docs: {
      description: 'Enforce maximum character count for example HTML templates to constrain context usage.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'template-too-large':
        'Example template `{{name}}` is {{length}} characters (limit: {{max}}). Simplify the template or split into smaller examples.'
    }
  },
  create(context) {
    const isPatternFile = context.filename.includes('/patterns/');

    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration || node.declaration.type !== 'VariableDeclaration') {
          return;
        }

        const declarator = node.declaration.declarations[0];
        if (!declarator || declarator.id.type !== 'Identifier') {
          return;
        }

        const name = declarator.id.name;
        const template = findHtmlTemplate(declarator.init);
        if (!template) {
          return;
        }

        if (hasTag(context, node, 'test-case')) {
          return;
        }

        const hasPatternTag = hasTag(context, node, 'pattern');
        const max = isPatternFile || hasPatternTag ? patternMaxChars : defaultMaxChars;
        const length = template.quasi.range[1] - template.quasi.range[0] - 2;

        if (length > max) {
          context.report({
            node,
            messageId: 'template-too-large',
            data: { name, length: String(length), max: String(max) }
          });
        }
      }
    };
  }
};
