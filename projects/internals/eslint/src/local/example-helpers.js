/**
 * Shared helpers for example-* ESLint rules.
 */

/**
 * Navigate the AST from a declarator's init node to find the html tagged template literal
 * inside a render property's arrow function.
 */
export function findHtmlTemplate(objNode) {
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
export function hasTag(context, node, tagName) {
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
export function parseTag(raw, tagName) {
  const regex = new RegExp(`@${tagName}\\s+([\\s\\S]*?)(?=\\s*(?:@\\w|$))`);
  const match = raw.match(regex);
  if (!match) {
    return '';
  }
  return match[1].replace(/\s*\*\s*/g, ' ').trim();
}

/**
 * Given a TaggedTemplateExpression node, concatenate all quasis to produce the
 * full HTML text of the template (expression slots become empty strings).
 */
export function getTemplateText(template) {
  return template.quasi.quasis.map(q => q.value.raw).join('');
}
