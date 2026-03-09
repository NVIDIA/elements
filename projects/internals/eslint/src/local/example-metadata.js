const allowedTags = ['priority', 'performance', 'pattern', 'anti-pattern', 'test-case'];
const contextMaxLength = 400;
const placeholderPatterns = [
  /lorem ipsum/i,
  /dolor sit amet/i,
  /consectetur adipiscing/i,
  /velit officia consequat/i,
  /exercitation veniam consequat/i,
  /eiusmod tempor incididunt/i
];

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
      'missing-summary': 'Exported examples require a @summary JSDoc tag.',
      'no-links':
        '@summary must not contain links. Inline the relevant text instead so context is preserved for agents.',
      'no-placeholder-text':
        'Example contains placeholder text ("{{match}}"). Replace with realistic, meaningful content.'
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

        // Summary must not contain links (URLs or markdown links)
        // This is to save context with agents especially when they have training on web platform concepts by default.
        const hasUrl = /https?:\/\/[^\s<>"{}|\\^`[\]]+/i.test(summary);
        const hasMdLink = /\[([^\]]+)\]\([^)]+\)/.test(summary);
        if (hasUrl || hasMdLink) {
          context.report({ node, messageId: 'no-links' });
        }

        // Summary must be ≤ 400 characters (plain text)
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

        // Detect lorem ipsum placeholder text in export source
        const sourceText = context.sourceCode.getText(node);
        for (const pattern of placeholderPatterns) {
          const match = sourceText.match(pattern);
          if (match) {
            context.report({
              node,
              messageId: 'no-placeholder-text',
              data: { match: match[0] }
            });
            break;
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
