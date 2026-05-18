import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { walk } from './utils.js';

const DEFAULT_MINIMUM_CONSUMERS = 2;
const PACKAGE_CACHE = new Map();

/**
 * Prevent internal base classes before the abstraction has enough consumers.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'no-single-consumer-internal-base',
    docs: {
      description: 'Prevent internal base classes that have fewer than two implementation consumers.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          minimumConsumers: { type: 'number', minimum: 2 },
          rootDir: { type: 'string' }
        }
      }
    ],
    messages: {
      'single-consumer':
        'Internal base "{{name}}" has {{count}} implementation consumer(s). Inline it into the consumer until at least {{minimum}} consumers need the abstraction.'
    }
  },
  create(context) {
    const filename = normalizePath(context.physicalFilename ?? context.filename);
    const options = context.options[0] ?? {};
    const rootDir = options.rootDir ? normalizePath(options.rootDir) : getPackageRoot(filename);
    const minimumConsumers = options.minimumConsumers ?? DEFAULT_MINIMUM_CONSUMERS;

    if (!rootDir || !isInternalSourceFile(filename)) {
      return {};
    }

    return {
      ClassDeclaration(node) {
        if (!isExportedBaseCandidate(node)) {
          return;
        }

        const consumerCount = countConsumers({
          className: node.id.name,
          defaultExported: isDefaultExported(node),
          filename,
          rootDir,
          sourceCode: context.sourceCode
        });
        if (consumerCount >= minimumConsumers) {
          return;
        }

        context.report({
          node,
          messageId: 'single-consumer',
          data: {
            name: node.id.name,
            count: `${consumerCount}`,
            minimum: `${minimumConsumers}`
          }
        });
      }
    };
  }
};

function isExportedBaseCandidate(node) {
  return Boolean(
    node.id?.name &&
      isExported(node) &&
      (node.abstract === true || node.id.name.startsWith('Base') || node.id.name.endsWith('Base'))
  );
}

function isExported(node) {
  return node.parent?.type === 'ExportNamedDeclaration' || node.parent?.type === 'ExportDefaultDeclaration';
}

function isDefaultExported(node) {
  return node.parent?.type === 'ExportDefaultDeclaration';
}

function countConsumers({ className, defaultExported, filename, rootDir, sourceCode }) {
  let consumers = countLocalSubclasses(sourceCode.ast, className);
  const packageName = getPackageName(rootDir);
  const isBarrelExported = isExportedFromInternalBarrel(rootDir, filename, className);

  for (const file of getPackageFiles(rootDir)) {
    if (file === filename) {
      continue;
    }

    const text = readFileSync(file, 'utf8');
    const specifier = getRelativeJsImport(file, filename);
    const localNames = [
      ...getImportedClassNames(text, className, specifier, { defaultExported }),
      ...(packageName && isBarrelExported
        ? getImportedClassNames(text, className, `${packageName}/internal`, { defaultExported: false })
        : [])
    ];

    consumers += countSubclasses(text, localNames);
  }

  return consumers;
}

function countLocalSubclasses(ast, className) {
  let count = 0;
  walk(ast, node => {
    if (node.type !== 'ClassDeclaration' || !node.superClass) {
      return;
    }

    if (isSuperClass(node.superClass, className)) {
      count += 1;
    }
  });
  return count;
}

function isSuperClass(superClass, className) {
  if (superClass.type === 'Identifier') {
    return superClass.name === className;
  }

  if (superClass.type === 'TSInstantiationExpression') {
    return isSuperClass(superClass.expression, className);
  }

  return false;
}

function getImportedClassNames(text, className, specifier, { defaultExported }) {
  const importMap = getImportMap(text, specifier);
  const classNames = new Set(importMap.get(className) ?? []);

  for (const namespace of importMap.get('*') ?? []) {
    classNames.add(`${namespace}.${className}`);
  }

  if (defaultExported) {
    for (const localName of importMap.get('default') ?? []) {
      classNames.add(localName);
    }
  }

  return [...classNames];
}

function getImportMap(text, specifier) {
  const imports = new Map();
  const importPattern = new RegExp(
    String.raw`import\s+(?:type\s+)?([^;]*?)\s+from\s+['"]${escapeRegExp(specifier)}['"]`,
    'g'
  );

  for (const match of text.matchAll(importPattern)) {
    const importClause = match[1]?.trim() ?? '';

    addDefaultImport(imports, importClause);
    addNamespaceImport(imports, importClause);
    addNamedImports(imports, importClause);
  }

  return imports;
}

function addDefaultImport(imports, importClause) {
  if (!importClause || importClause.startsWith('{') || importClause.startsWith('*')) {
    return;
  }

  const localName = importClause.split(/[,{]/)[0]?.trim();
  if (isIdentifier(localName)) {
    addImport(imports, 'default', localName);
  }
}

function addNamespaceImport(imports, importClause) {
  const namespace = importClause.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/)?.[1];
  if (namespace) {
    addImport(imports, '*', namespace);
  }
}

function addNamedImports(imports, importClause) {
  const namedImports = importClause.match(/{(?<imports>[\s\S]*?)}/)?.groups?.imports;
  if (!namedImports) {
    return;
  }

  for (const specifier of namedImports.split(',')) {
    const normalized = specifier.trim().replace(/^type\s+/, '');
    const match = normalized.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
    if (match) {
      addImport(imports, match[1], match[2] ?? match[1]);
    }
  }
}

function addImport(imports, exportedName, localName) {
  if (!imports.has(exportedName)) {
    imports.set(exportedName, new Set());
  }
  imports.get(exportedName).add(localName);
}

function countSubclasses(text, classNames) {
  if (classNames.length === 0) {
    return 0;
  }

  const superClassNames = classNames.map(escapeRegExp).join('|');
  const subclassPattern = new RegExp(
    String.raw`\bclass\s+[A-Za-z_$][\w$]*(?:\s*<[^>{}]*>)?\s+extends\s+(?:${superClassNames})\b`,
    'g'
  );
  return [...text.matchAll(subclassPattern)].length;
}

function isIdentifier(value) {
  return typeof value === 'string' && /^[A-Za-z_$][\w$]*$/.test(value);
}

function getRelativeJsImport(fromFile, toFile) {
  const fromDirectory = fromFile.slice(0, fromFile.lastIndexOf('/'));
  const withoutExtension = toFile.replace(/\.tsx?$/, '.js');
  let specifier = normalizePath(relative(fromDirectory, withoutExtension));

  if (!specifier.startsWith('.')) {
    specifier = `./${specifier}`;
  }

  return specifier;
}

function getPackageFiles(rootDir) {
  const cacheKey = normalizePath(rootDir);
  if (PACKAGE_CACHE.has(cacheKey)) {
    return PACKAGE_CACHE.get(cacheKey);
  }

  const srcDir = join(rootDir, 'src');
  const files = existsSync(srcDir) ? collectFiles(srcDir).filter(isImplementationTsFile).map(normalizePath) : [];
  PACKAGE_CACHE.set(cacheKey, files);
  return files;
}

function getPackageName(rootDir) {
  const packageFile = join(rootDir, 'package.json');
  if (!existsSync(packageFile)) {
    return null;
  }

  const pkg = JSON.parse(readFileSync(packageFile, 'utf8'));
  return typeof pkg.name === 'string' ? pkg.name : null;
}

function isExportedFromInternalBarrel(rootDir, filename, className) {
  const indexFile = join(rootDir, 'src/internal/index.ts');
  if (!existsSync(indexFile)) {
    return false;
  }

  const specifier = getRelativeJsImport(indexFile, filename);
  const text = readFileSync(indexFile, 'utf8');
  return exportsModule(text, className, specifier);
}

function exportsModule(text, className, specifier) {
  const starExportPattern = new RegExp(String.raw`export\s+\*\s+from\s+['"]${escapeRegExp(specifier)}['"]`, 'm');
  const namedExportPattern = new RegExp(
    String.raw`export\s+{[^}]*\b${escapeRegExp(className)}\b[^}]*}\s+from\s+['"]${escapeRegExp(specifier)}['"]`,
    'm'
  );
  return starExportPattern.test(text) || namedExportPattern.test(text);
}

function collectFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const filepath = join(dir, entry.name);
    return entry.isDirectory() ? collectFiles(filepath) : [filepath];
  });
}

function isImplementationTsFile(filename) {
  return (
    (filename.endsWith('.ts') || filename.endsWith('.tsx')) &&
    !filename.endsWith('.d.ts') &&
    !filename.includes('.test.') &&
    !filename.includes('.examples.')
  );
}

function isInternalSourceFile(filename) {
  return isImplementationTsFile(filename) && filename.includes('/src/internal/');
}

function getPackageRoot(filename) {
  let currentDirectory = dirname(filename);
  while (currentDirectory && currentDirectory !== dirname(currentDirectory)) {
    if (existsSync(join(currentDirectory, 'package.json')) && existsSync(join(currentDirectory, 'src'))) {
      return normalizePath(currentDirectory);
    }
    currentDirectory = dirname(currentDirectory);
  }

  return null;
}

function normalizePath(filepath) {
  const normalized = filepath.startsWith('file://') ? fileURLToPath(filepath) : filepath;
  return normalized.replaceAll(sep, '/');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
