const defaultMaxChars = 4000;  // ~1000 tokens
const patternMaxChars = 10_000;  // ~2500 tokens

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

/**
 * Navigate the AST from a declarator's init node to find the html tagged template literal
 * inside a render property's arrow function.
 */
function findHtmlTemplate(objNode) {
  if (!objNode || objNode.type !== 'ObjectExpression') {
    return null;
  }

  const renderProp = objNode.properties.find(
    p => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'render'
  );
  if (!renderProp) {
    return null;
  }

  const fn = renderProp.value;
  if (fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression') {
    return null;
  }

  let expr;
  if (fn.body.type === 'TaggedTemplateExpression') {
    expr = fn.body;
  } else if (fn.body.type === 'BlockStatement') {
    const returnStmt = fn.body.body.find(s => s.type === 'ReturnStatement');
    if (returnStmt) {
      expr = returnStmt.argument;
    }
  }

  if (!expr || expr.type !== 'TaggedTemplateExpression') {
    return null;
  }

  const tag = expr.tag;
  if (tag.type === 'Identifier' && tag.name === 'html') {
    return expr;
  }

  return null;
}

/**
 * Check whether the JSDoc comment above a node contains a specific value in @tags.
 */
function hasTag(context, node, tagName) {
  const jsdoc = context.sourceCode.getCommentsBefore(node).findLast(c => c.type === 'Block' && c.value.startsWith('*'));

  if (!jsdoc) {
    return false;
  }

  return parseTag(jsdoc.value, 'tags')
    .split(' ')
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .includes(tagName);
}

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
