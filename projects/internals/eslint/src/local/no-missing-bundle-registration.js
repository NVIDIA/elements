import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DEFAULT_IMPORT_PREFIX = '@nvidia-elements/core';

function getPackageName(startDirectory) {
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
    if (parentDirectory === directory) {
      return undefined;
    }

    directory = parentDirectory;
  }
}

/**
 * ESLint rule that ensures public components with a `define.ts` entry are
 * imported in `src/bundle.ts` so they are registered in the bundled build.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'no-missing-bundle-registration',
    docs: {
      description: 'Ensures components with define.ts are imported in bundle.ts.',
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
          exclude: {
            type: 'array',
            items: { type: 'string' },
            description: 'Component directory names to exclude from the check.'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      'missing-bundle-registration':
        "Component `{{component}}` has a define.ts but is not imported in bundle.ts. Add `import '{{prefix}}/{{component}}/define.js';`."
    }
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.endsWith('bundle.ts')) {
      return {};
    }

    const options = context.options[0] || {};
    const prefix = options.importPrefix || getPackageName(dirname(filename)) || DEFAULT_IMPORT_PREFIX;
    const exclude = new Set(options.exclude || []);
    const importedComponents = new Set();
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const importPattern = new RegExp(`^${escapedPrefix}/([^/]+)/define\\.js$`);

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') {
          return;
        }

        const match = source.match(importPattern);
        if (match?.[1]) {
          importedComponents.add(match[1]);
        }
      },
      'Program:exit'(node) {
        const sourceDirectory = dirname(filename);
        const missingComponents = readdirSync(sourceDirectory, { withFileTypes: true })
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name)
          .filter(component => existsSync(join(sourceDirectory, component, 'define.ts')))
          .filter(component => !exclude.has(component))
          .filter(component => !importedComponents.has(component))
          .sort();

        for (const component of missingComponents) {
          context.report({
            node,
            messageId: 'missing-bundle-registration',
            data: {
              component,
              prefix
            }
          });
        }
      }
    };
  }
};
