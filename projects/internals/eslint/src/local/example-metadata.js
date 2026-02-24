const allowedTags = ['priority', 'performance', 'pattern', 'anti-pattern', 'test-case'];
const contextMaxLength = 400;

export default {
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description: 'Validate JSDoc metadata (@summary, @description, @tags) on example exports',
      category: 'Possible Errors'
    },
    messages: {
      'summary-too-long':
        '@summary plain text exceeds {{max}} characters ({{length}}/{{max}}). Strip URLs and markdown links before counting.',
      'invalid-tags': 'Invalid @tags: {{invalid}}. Allowed: {{allowed}}.',
      'missing-summary': 'Exported examples require a @summary JSDoc tag.'
    }
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration || node.declaration.type !== 'VariableDeclaration') {
          return;
        }

        const jsdoc = context.sourceCode
          .getCommentsBefore(node)
          .findLast(c => c.type === 'Block' && c.value.startsWith('*'));

        if (!jsdoc) {
          context.report({ node, messageId: 'missing-summary' });
          return;
        }

        const raw = jsdoc.value;
        const summary = parseTag(raw, 'summary');
        const tags = parseTag(raw, 'tags')
          .split(' ')
          .map(t => t.trim())
          .filter(t => t.length > 0);

        // Summary is required
        if (!summary.trim()) {
          context.report({ node, messageId: 'missing-summary' });
          return;
        }

        // Summary must be ≤ 400 characters (plain text: URLs stripped, markdown links reduced to text)
        const plainText = summary
          .replace(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        if (plainText.length > contextMaxLength) {
          context.report({
            node,
            messageId: 'summary-too-long',
            data: { length: String(plainText.length), max: String(contextMaxLength) }
          });
        }

        // Tags must be from the allowed list
        if (tags.length) {
          const invalid = tags.filter(tag => !allowedTags.includes(tag));
          if (invalid.length) {
            context.report({
              node,
              messageId: 'invalid-tags',
              data: { invalid: invalid.join(', '), allowed: allowedTags.join(', ') }
            });
          }
        }
      }
    };
  }
};

/**
 * Extract the value of a JSDoc tag from raw comment text.
 * Returns the text after `@tagName` up to the next `@tag` or end of comment.
 */
function parseTag(raw, tagName) {
  const regex = new RegExp(`@${tagName}\\s+([\\s\\S]*?)(?=\\s*(?:@\\w|$))`);
  const match = raw.match(regex);
  if (!match) {
    return '';
  }
  return match[1].replace(/\s*\*\s*/g, ' ').trim();
}
