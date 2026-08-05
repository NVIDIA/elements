import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const DEFAULT_IMPORT_PREFIX = '@nvidia-elements/core';

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

export function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
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
