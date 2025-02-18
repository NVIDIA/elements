import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

const source = ['**/src/**/*.ts', '**/src/**/*.tsx', '**/src/**/*.d.ts'];
const tests = ['**/src/test/*.ts', '**/*.test.ts', '**/*.test.axe.ts', '**/*.test.ssr.ts'];
const stories = ['**/*.stories.ts'];
const ignores = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.lighthouse/**', '**/.wireit/**'];

/** @type {import('eslint').Linter.Config[]} */
const config = {
  files: [...source, ...tests, ...stories],
  ignores,
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    import: importPlugin
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    'import/extensions': ['error', 'ignorePackages', { js: 'always', 'css?inline': 'never' }],
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/consistent-type-imports': ['error'],
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_|Demo|Test|T' }]
  }
};

/** @type {import('eslint').Linter.Config[]} */
export const browserTypescriptConfig = [
  {
    ...config,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser
      }
    }
  }
  // todo: enable this config for all source ts files
  // {
  //   files: [...source],
  //   ignores: [...ignores],
  //   plugins: {
  //     '@typescript-eslint': tseslint.plugin,
  //     import: importPlugin
  //   },
  //   rules: {
  //     '@typescript-eslint/no-explicit-any': ['error']
  //   }
  // }
];

/** @type {import('eslint').Linter.Config[]} */
export const nodeTypescriptConfig = [
  {
    ...config,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.node
      }
    }
  }
];
