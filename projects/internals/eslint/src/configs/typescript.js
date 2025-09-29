import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import deadCode from '../local/dead-code.js';

const source = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.d.ts'];
const tests = [
  'src/test/*.ts',
  '**/*.test.ts',
  '**/*.test.visual.ts',
  '**/*.test.lighthouse.ts',
  '**/*.test.axe.ts',
  '**/*.test.ssr.ts'
];
const stories = ['**/*.stories.ts'];
const ignores = [
  'node_modules/',
  'coverage/',
  'dist/',
  'build/',
  'src/vendor/',
  '.visual/',
  '.lighthouse/',
  '.wireit/',
  '.11ty-vite/'
];

/** @type {import('eslint').Linter.Config[]} */
const config = {
  files: [...source, ...tests, ...stories],
  ignores,
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    import: importPlugin,
    jsdoc,
    'local-typescript': {
      rules: {
        'no-dead-code': deadCode
      }
    }
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    'import/extensions': ['error', 'ignorePackages', { js: 'always', 'css?inline': 'never' }],
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_|Demo|Test|T', argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error'],
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    'no-restricted-syntax': [
      'error',
      {
        selector:
          ':matches(PropertyDefinition, MethodDefinition)[accessibility="private"]:not(:has(Decorator)):not([kind="constructor"])',
        message: 'Use #private instead'
      }
    ],
    // prevent usage of overlapping/conflicting type annotations between jsdoc and TypeScript metadata
    'jsdoc/no-types': ['error'],
    'jsdoc/valid-types': ['error'],
    'jsdoc/check-tag-names': ['error'],
    'local-typescript/no-dead-code': ['error']
  },
  settings: {
    jsdoc: {
      structuredTags: {
        internal: { name: true },
        element: { name: true },
        slot: { name: true },
        cssprop: { name: true },
        entrypoint: { name: true },
        tags: { name: true },
        aria: { name: true },
        internal: { name: true },
        experimental: { name: true },
        alpha: { name: true },
        beta: { name: true },
        stable: { name: true },
        themes: { name: true },
        responsive: { name: true },
        storybook: { name: true },
        figma: { name: true }
      }
    }
  }
};

/** @type {import('eslint').Linter.Config[]} */
export const browserTypescriptConfig = [
  {
    ignores // https://github.com/eslint/eslint/discussions/18304
  },
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
];

/** @type {import('eslint').Linter.Config[]} */
export const nodeTypescriptConfig = [
  {
    ignores // https://github.com/eslint/eslint/discussions/18304
  },
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
