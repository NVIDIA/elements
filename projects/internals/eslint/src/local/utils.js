import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const DEFAULT_IMPORT_PREFIX = '@nvidia-elements/core';

const HOT_RENDERER_METHOD = /^(?:draw|prepare|render)(?:$|[A-Z])/u;

export function getPackageName(startDirectory) {
  let directory = startDirectory;

  while (true) {
    const packageJsonPath = join(directory, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        return typeof packageJson.name === 'string' ? packageJson.name : undefined;
      } catch {
        return undefined;
      }
    }

    const parentDirectory = dirname(directory);
    if (parentDirectory === directory) return undefined;
    directory = parentDirectory;
  }
}

export function getBundleImportPattern(prefix) {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedPrefix}/([^/]+)/define\\.js$`);
}

export function getBundleExportPattern(prefix) {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedPrefix}/([^/]+)$`);
}

export function walk(node, visit) {
  if (!node || typeof node !== 'object') {
    return;
  }
  if (visit(node) === false) {
    return;
  }
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

export function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

export function thisMemberText(node, context) {
  if (node.type !== 'MemberExpression' || node.object.type !== 'ThisExpression') return null;
  if (node.computed) return `this[${normalize(context.sourceCode.getText(node.property))}]`;
  return normalize(context.sourceCode.getText(node));
}

export function propertyDefinitionAsThisMember(node, context) {
  if (node.static) return null;
  if (node.computed) return `this[${normalize(context.sourceCode.getText(node.key))}]`;
  if (node.key.type === 'PrivateIdentifier') return `this.#${node.key.name}`;
  if (node.key.type === 'Identifier') return `this.${node.key.name}`;
  return `this[${normalize(context.sourceCode.getText(node.key))}]`;
}

export function isInstanceThisContextBoundary(node) {
  if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression' || node.type === 'StaticBlock') return true;
  if ((node.type === 'MethodDefinition' || node.type === 'PropertyDefinition') && node.static) return true;
  return (
    (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') &&
    node.parent?.type !== 'MethodDefinition'
  );
}

export function crossesInstanceThisContextBoundary(node) {
  let current = node.parent;
  while (current) {
    if (current.type === 'ClassDeclaration' || current.type === 'ClassExpression') return false;
    if (isInstanceThisContextBoundary(current)) return true;
    current = current.parent;
  }
  return false;
}

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

export function isHotPath(context, node) {
  return hasHotPathComment(context, node) || isRendererHotPath(node);
}

function hasHotPathComment(context, node) {
  let candidate = node;
  while (candidate) {
    if (context.sourceCode.getCommentsBefore(candidate).some(comment => /@hotPath\b/u.test(comment.value))) return true;
    candidate =
      candidate.parent?.type === 'ExportNamedDeclaration' || candidate.parent?.type === 'ExportDefaultDeclaration'
        ? candidate.parent
        : null;
  }
  return false;
}

function isRendererHotPath(node) {
  if (node.type !== 'MethodDefinition' && node.type !== 'PropertyDefinition') return false;
  const classNode = node.parent?.parent;
  const className =
    classNode?.type === 'ClassDeclaration' || classNode?.type === 'ClassExpression' ? classNode.id?.name : undefined;
  const methodName =
    node.key.type === 'Identifier' || node.key.type === 'PrivateIdentifier' ? node.key.name : undefined;
  return className?.endsWith('Renderer') === true && methodName !== undefined && HOT_RENDERER_METHOD.test(methodName);
}
