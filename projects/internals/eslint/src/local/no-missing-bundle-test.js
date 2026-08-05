import htmlParser from '@html-eslint/parser';
import { parse } from '@typescript-eslint/parser';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DEFAULT_IMPORT_PREFIX, getBundleImportPattern, getPackageName } from './utils.js';

function visitAst(node, visitor, visited = new WeakSet()) {
  if (!node || typeof node !== 'object' || visited.has(node)) return;
  visited.add(node);

  if (Array.isArray(node)) {
    for (const child of node) visitAst(child, visitor, visited);
    return;
  }

  if (typeof node.type === 'string') visitor(node);

  for (const value of Object.values(node)) {
    visitAst(value, visitor, visited);
  }
}

function getLighthouseHtmlTemplates(ast) {
  const templates = [];

  visitAst(ast, node => {
    if (
      node.type !== 'CallExpression' ||
      node.callee.type !== 'MemberExpression' ||
      node.callee.computed ||
      node.callee.object.type !== 'Identifier' ||
      node.callee.object.name !== 'lighthouseRunner' ||
      node.callee.property.type !== 'Identifier' ||
      node.callee.property.name !== 'getReport'
    ) {
      return;
    }

    const template = node.arguments[1];
    if (template?.type !== 'TemplateLiteral' || template.expressions.length > 0) return;

    const source = template.quasis[0]?.value.cooked;
    if (typeof source === 'string') templates.push(source);
  });

  return templates;
}

function getModuleScriptSources(htmlSource) {
  const htmlAst = htmlParser.parseForESLint(htmlSource, { filePath: 'lighthouse.html' }).ast;
  const scripts = [];

  visitAst(htmlAst, node => {
    if (node.type !== 'ScriptTag') return;

    const isModule = node.attributes.some(
      attribute =>
        attribute.type === 'Attribute' && attribute.key.value === 'type' && attribute.value?.value === 'module'
    );

    if (isModule && typeof node.value?.value === 'string') scripts.push(node.value.value);
  });

  return scripts;
}

/**
 * ESLint rule that ensures components registered in `src/bundle.ts` are
 * included in the aggregate Lighthouse direct-import benchmark.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'no-missing-bundle-test',
    docs: {
      description: 'Ensures bundled components are included in the aggregate Lighthouse test.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        properties: {
          importPrefix: {
            type: 'string',
            description: `Import path prefix to match. Defaults to '${DEFAULT_IMPORT_PREFIX}'.`
          },
          lighthouseTestFile: {
            type: 'string',
            description: 'Lighthouse test file, relative to bundle.ts, whose direct imports must match the bundle.'
          }
        },
        required: ['lighthouseTestFile'],
        additionalProperties: false
      }
    ],
    messages: {
      'missing-bundle-test':
        "Component `{{component}}` is registered in bundle.ts but is not measured in {{testFile}}. Add `import '{{prefix}}/{{component}}/define.js';` to its aggregate direct-import benchmark.",
      'missing-lighthouse-test':
        'Configured Lighthouse test file {{testFile}} does not exist. Create the file or update the lighthouseTestFile option.'
    }
  },
  create(context) {
    const filename = context.filename;
    if (!filename.endsWith('bundle.ts')) return {};

    const options = context.options[0] || {};
    const lighthouseTestFile = options.lighthouseTestFile;
    if (typeof lighthouseTestFile !== 'string') return {};

    const prefix = options.importPrefix || getPackageName(dirname(filename)) || DEFAULT_IMPORT_PREFIX;
    const importPattern = getBundleImportPattern(prefix);
    const bundledComponents = new Set();

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') return;

        const match = source.match(importPattern);
        if (match?.[1]) bundledComponents.add(match[1]);
      },
      'Program:exit'(node) {
        const lighthouseTestPath = join(dirname(filename), lighthouseTestFile);
        if (!existsSync(lighthouseTestPath)) {
          context.report({
            node,
            messageId: 'missing-lighthouse-test',
            data: { testFile: lighthouseTestFile }
          });
          return;
        }

        const lighthouseSource = readFileSync(lighthouseTestPath, 'utf8');
        const lighthouseAst = parse(lighthouseSource, {
          ecmaVersion: 'latest',
          filePath: lighthouseTestPath,
          sourceType: 'module'
        });
        const lighthouseComponents = new Set();

        for (const htmlSource of getLighthouseHtmlTemplates(lighthouseAst)) {
          for (const scriptSource of getModuleScriptSources(htmlSource)) {
            const scriptAst = parse(scriptSource, {
              ecmaVersion: 'latest',
              sourceType: 'module'
            });

            for (const statement of scriptAst.body) {
              if (
                statement.type !== 'ImportDeclaration' ||
                statement.source.type !== 'Literal' ||
                typeof statement.source.value !== 'string'
              ) {
                continue;
              }

              const match = statement.source.value.match(importPattern);
              if (match?.[1]) lighthouseComponents.add(match[1]);
            }
          }
        }

        for (const component of [...bundledComponents]
          .filter(component => !lighthouseComponents.has(component))
          .sort()) {
          context.report({
            node,
            messageId: 'missing-bundle-test',
            data: {
              component,
              prefix,
              testFile: lighthouseTestFile
            }
          });
        }
      }
    };
  }
};
