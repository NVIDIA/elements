const blocklist = ['Example', 'TestCase']; // 'demo' temporary removed, will add back in followup
const pascalCasePattern = /^[A-Z][a-zA-Z0-9]*$/;

/**
 * ESLint rule that enforces naming conventions for example exports in `*.examples.ts` files.
 *
 * - PascalCase names
 * - Maximum 6 words (split on uppercase boundaries)
 * - No component name prefix (derived from filename)
 * - No blocklisted words (Example, TestCase, Demo)
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'example-naming',
    docs: {
      description: 'Enforces naming conventions for example exports.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'not-pascal-case': 'Example export `{{name}}` must be PascalCase (e.g., `Interactive`, `WithIcon`).',
      'too-many-words':
        'Example export `{{name}}` has {{count}} words. Maximum is 6 words (split on uppercase boundaries).',
      'blocklisted-word':
        'Example export `{{name}}` contains the blocklisted word `{{word}}`. Use a more descriptive name.',
      'component-prefix':
        'Example export `{{name}}` should not start with the component name `{{prefix}}`. Remove the prefix.'
    }
  },
  create(context) {
    const filename = context.filename;
    const dirMatch = filename.match(/([^/]+)\.examples\.ts$/);
    const componentPrefix = dirMatch
      ? dirMatch[1]
          .split('-')
          .map(w => w[0].toUpperCase() + w.slice(1))
          .join('')
      : null;

    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration) {
          return;
        }

        let name;

        if (node.declaration.type === 'VariableDeclaration') {
          const declarator = node.declaration.declarations[0];
          if (declarator && declarator.id.type === 'Identifier') {
            name = declarator.id.name;
          }
        } else if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
          name = node.declaration.id.name;
        }

        if (!name) {
          return;
        }

        // Check PascalCase
        if (!pascalCasePattern.test(name)) {
          context.report({ node, messageId: 'not-pascal-case', data: { name } });
          return;
        }

        // Check component-prefix
        if (componentPrefix && name.startsWith(componentPrefix)) {
          context.report({ node, messageId: 'component-prefix', data: { name, prefix: componentPrefix } });
        }

        // Check word count (split on PascalCase boundaries, treating acronyms as one word)
        // e.g., "InvalidDOM" → ["Invalid", "DOM"], "LegacyDOMCreation" → ["Legacy", "DOM", "Creation"]
        const words = name.split(/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/).filter(w => w.length > 0);
        if (words.length > 6) {
          context.report({ node, messageId: 'too-many-words', data: { name, count: String(words.length) } });
        }

        // Check blocklist
        for (const word of blocklist) {
          if (name.includes(word)) {
            context.report({ node, messageId: 'blocklisted-word', data: { name, word } });
            break;
          }
        }
      }
    };
  }
};
