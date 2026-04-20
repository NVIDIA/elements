/**
 * Shared helpers for the listener/observer/timer cleanup rules.
 * Extracted so walker and class-scope logic stay consistent across rules.
 */

/**
 * Recursive AST walker that visits every node under `node`. Safe against the
 * `.parent` back-pointer (skipped) and descends into arrays of child nodes.
 */
export function walk(node, visit) {
  if (!node || typeof node !== 'object') {
    return;
  }
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'parent') {
      continue;
    }
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        walk(item, visit);
      }
    } else if (child && typeof child === 'object' && typeof child.type === 'string') {
      walk(child, visit);
    }
  }
}

/** Collapse internal whitespace so `this.shadowRoot` matches across formatting. */
export function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/** Walk up `.parent` looking for the enclosing class. Returns `null` for module-level nodes. */
export function findEnclosingClass(node) {
  let current = node.parent;
  while (current) {
    if (current.type === 'ClassDeclaration' || current.type === 'ClassExpression') {
      return current;
    }
    current = current.parent;
  }
  return null;
}
