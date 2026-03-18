import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import deadCode from '../local/dead-code.js';
import exampleMetadata from '../local/example-metadata.js';
import exampleNaming from '../local/example-naming.js';
import requireFixtureCleanup from '../local/require-fixture-cleanup.js';
import requireElementStable from '../local/require-element-stable.js';

const source = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.d.ts'];
const tests = [
  'src/test/*.ts',
  '**/*.test.ts',
  '**/*.test.visual.ts',
  '**/*.test.lighthouse.ts',
  '**/*.test.axe.ts',
  '**/*.test.ssr.ts'
];
const examples = ['**/*.examples.ts'];
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
  files: [...source, ...tests, ...examples],
  ignores,
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    import: importPlugin,
    jsdoc,
    'local-typescript': {
      rules: {
        'no-dead-code': deadCode,
        'example-metadata': exampleMetadata,
        'example-naming': exampleNaming,
        'require-fixture-cleanup': requireFixtureCleanup,
        'require-element-stable': requireElementStable
      }
    }
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    complexity: ['error', { max: 10 }], // https://en.wikipedia.org/wiki/Cyclomatic_complexity
    'import/extensions': ['error', 'ignorePackages', { js: 'always', 'css?inline': 'never' }],
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_|Demo|Test|T', argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error'],
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    '@typescript-eslint/switch-exhaustiveness-check': ['error', { requireDefaultForNonUnion: false }],
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
    'local-typescript/no-dead-code': ['warn'] // todo, this should be migrated to the internal playground template config
  },
  settings: {
    jsdoc: {
      structuredTags: {
        internal: { name: true },
        element: { name: true },
        event: { name: 'text' },
        slot: { name: true },
        cssprop: { name: true },
        csspart: { name: true },
        command: { name: true },
        entrypoint: { name: true },
        tags: { name: true },
        aria: { name: true },
        internal: { name: true },
        experimental: { name: true },
        alpha: { name: true },
        beta: { name: true },
        stable: { name: true },
        themes: { name: true },
        responsive: { name: true }
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
  },
  {
    files: [...tests],
    rules: {
      'local-typescript/require-fixture-cleanup': ['error'],
      'local-typescript/require-element-stable': ['off'] // temporarily disabled, will enable in followup
    }
  },
  {
    files: ['**/*.examples.ts'],
    rules: {
      'local-typescript/example-metadata': ['error'],
      'local-typescript/example-naming': ['error']
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
  },
  {
    files: [...tests],
    rules: {
      'local-typescript/require-fixture-cleanup': ['error'],
      'local-typescript/require-element-stable': ['off'] // temporarily disabled, will enable in followup
    }
  },
  {
    files: ['**/*.examples.ts'],
    rules: {
      'local-typescript/example-metadata': ['error'],
      'local-typescript/example-naming': ['error']
    }
  }
];
