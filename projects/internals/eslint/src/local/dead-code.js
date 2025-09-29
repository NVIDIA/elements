/**
 * Removal of dead/zombie code helps reduce bad context for models consuming codebase
 * https://www.bitnative.com/2012/10/22/kill-the-zombies-in-your-code
 * https://kentcdodds.com/blog/please-dont-commit-commented-out-code
 */
export default {
  meta: {
    type: 'problem',
    schema: [],
    fixable: 'code',
    docs: {
      description: 'Disallow dead code paths or dead source code comment blocks',
      category: 'Possible Errors'
    },
    messages: {
      ['unexpected-dead-code']: 'Remove dead/commented {{type}} to avoid incorrect context.'
    }
  },
  create(context) {
    return {
      Program() {
        const comments = context.getSourceCode().getAllComments();
        const checks = {
          import: /\s*import\s+.*from\s+['"].*['"];/,
          export: /\s*export\s+.*from\s+['"].*['"];/,
          function: /\bfunction\b\s+(\w+)\s*\(/,
          arrowFunction: /(\w+)\s*=>/,
          variableDeclaration: /(?:^|\s)(?:const|let|var)\s+(\w+|\[.*\])\s*(?:[=,;]|$)/,
          control: /\b(?:if|else|try|catch|switch|while|for|do)\b\s*(?:\(|$)/,
          return: /\breturn\b[^;]*;/,
          console: /\bconsole\s*\.?\s*log\b\s*\(/,
          debugger: /\bdebugger\b/,
          describe: /\bdescribe\(/,
          it: /\bit\(/
        };

        comments.forEach(comment => {
          const hasCode = Object.entries(checks)
            .map(([key, value]) => (value.test(comment.value.trim()) ? key : null))
            .find(Boolean);

          if ((comment.type === 'Line' && hasCode) || (comment.type === 'Block' && hasCode)) {
            context.report({
              node: comment,
              messageId: 'unexpected-dead-code',
              data: {
                type: comment.type.toLowerCase()
              }
            });
          }
        });
      }
    };
  }
};
