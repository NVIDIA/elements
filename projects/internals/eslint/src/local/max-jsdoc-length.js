const DEFAULT_MAX_LENGTH = 400;

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    name: 'max-jsdoc-length',
    docs: {
      description: 'Limits JSDoc length on class properties and methods.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          maxLength: { type: 'integer', minimum: 1 }
        }
      }
    ],
    messages: {
      'too-long':
        'Class member JSDoc has {{length}} characters; maximum is {{maxLength}}. Keep the API description concise.'
    }
  },
  create(context) {
    const maxLength = context.options[0]?.maxLength ?? DEFAULT_MAX_LENGTH;
    const sourceCode = context.sourceCode;

    function checkMember(node) {
      const comments = new Set(sourceCode.getCommentsBefore(node));
      for (const decorator of node.decorators ?? []) {
        for (const comment of sourceCode.getCommentsAfter(decorator)) comments.add(comment);
      }
      for (const comment of comments) {
        if (comment.type !== 'Block' || !comment.value.startsWith('*')) continue;
        const length = normalizeJsdoc(comment.value).length;
        if (length <= maxLength) continue;
        context.report({
          loc: comment.loc,
          messageId: 'too-long',
          data: { length: String(length), maxLength: String(maxLength) }
        });
      }
    }

    return {
      PropertyDefinition: checkMember,
      AccessorProperty: checkMember,
      TSAbstractPropertyDefinition: checkMember,
      TSAbstractAccessorProperty: checkMember,
      TSParameterProperty: checkMember,
      MethodDefinition: checkMember,
      TSAbstractMethodDefinition: checkMember
    };
  }
};

function normalizeJsdoc(value) {
  return value
    .slice(1)
    .split(/\r\n?|\n/u)
    .map((line, index) => (index === 0 ? line : line.replace(/^\s*\* ?/u, '')))
    .join(' ')
    .replace(/\s+/gu, ' ')
    .trim();
}
