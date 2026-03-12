/**
 * ESLint rule that ensures component source files have all required sibling test files.
 * When linting `src/<name>/<name>.ts`, checks that the following sibling test files exist:
 * - `<name>.test.ts`
 * - `<name>.test.axe.ts`
 * - `<name>.test.visual.ts`
 * - `<name>.test.ssr.ts`
 * - `<name>.test.lighthouse.ts`
 *
 * Exemptions:
 * - Classes in `/internal/` or `/polyfills/` paths
 * - Class names starting with `Base`
 * - Sub-components nested under a parent directory (e.g., `src/grid/cell/cell.ts`)
 * - Files not matching the `src/<name>/<name>.ts` pattern
 * - Components listed in the `exclude` option
 * - Test suffixes listed in the `skipSuffixes` option
 *
 * @type {import('eslint').Rule.RuleModule}
 */
import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const REQUIRED_TEST_SUFFIXES = ['.test.ts', '.test.axe.ts', '.test.visual.ts', '.test.ssr.ts', '.test.lighthouse.ts'];

export default {
  meta: {
    type: 'problem',
    name: 'require-test-completeness',
    docs: {
      description: 'Ensures component source files have all required sibling test files.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        properties: {
          exclude: {
            type: 'array',
            items: { type: 'string' },
            description: 'Component directory names to exclude from the check.'
          },
          skipSuffixes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Test suffixes to skip (e.g., [".test.ssr.ts"]).'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      'missing-test-file': 'Component `{{componentName}}` is missing test file: `{{missingFile}}`.'
    }
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    const options = context.options[0] || {};
    const exclude = options.exclude || [];
    const skipSuffixes = new Set(options.skipSuffixes || []);

    if (filename.includes('/internal/') || filename.includes('/polyfills/') || filename.includes('/test/')) {
      return {};
    }

    const dir = dirname(filename);
    const file = basename(filename);
    const dirName = basename(dir);

    if (exclude.includes(dirName)) {
      return {};
    }

    if (file !== `${dirName}.ts`) {
      return {};
    }

    if (!filename.includes('/src/')) {
      return {};
    }

    // Skip sub-components: only enforce on direct children of src/.
    // e.g., src/grid/grid.ts is checked, src/grid/cell/cell.ts is not.
    const srcIndex = filename.lastIndexOf('/src/');
    const pathAfterSrc = filename.slice(srcIndex + 5); // after "/src/"
    const segments = pathAfterSrc.split('/');
    if (segments.length > 2) {
      return {};
    }

    const suffixes = REQUIRED_TEST_SUFFIXES.filter(s => !skipSuffixes.has(s));

    return {
      ClassDeclaration(node) {
        if (!node.superClass) {
          return;
        }

        const className = node.id ? node.id.name : '';
        if (className.startsWith('Base')) {
          return;
        }

        for (const suffix of suffixes) {
          const testFile = join(dir, `${dirName}${suffix}`);
          if (!existsSync(testFile)) {
            context.report({
              node,
              messageId: 'missing-test-file',
              data: {
                componentName: className,
                missingFile: `${dirName}${suffix}`
              }
            });
          }
        }
      }
    };
  }
};
