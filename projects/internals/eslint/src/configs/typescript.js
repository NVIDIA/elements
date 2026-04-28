import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import deadCode from '../local/dead-code.js';
import exampleMetadata from '../local/example-metadata.js';
import exampleNaming from '../local/example-naming.js';
import exampleTemplateSize from '../local/example-template-size.js';
import exampleCssQuality from '../local/example-css-quality.js';
import exampleApprovedDomains from '../local/example-approved-domains.js';
import requireFixtureCleanup from '../local/require-fixture-cleanup.js';
import requireElementStable from '../local/require-element-stable.js';
import requireListenerCleanup from '../local/require-listener-cleanup.js';
import requireObserverCleanup from '../local/require-observer-cleanup.js';
import requireTimerCleanup from '../local/require-timer-cleanup.js';
import requireSpdxHeader from '../local/require-spdx-header.js';

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
        'example-template-size': exampleTemplateSize,
        'example-css-quality': exampleCssQuality,
        'example-approved-domains': exampleApprovedDomains,
        'require-fixture-cleanup': requireFixtureCleanup,
        'require-element-stable': requireElementStable,
        'require-listener-cleanup': requireListenerCleanup,
        'require-observer-cleanup': requireObserverCleanup,
        'require-timer-cleanup': requireTimerCleanup,
        'require-spdx-header': requireSpdxHeader
      }
    }
  },
  rules: {
    ...Object.assign({}, ...tseslint.configs.strictTypeChecked.map(c => c.rules)),
    complexity: ['error', { max: 10 }], // https://en.wikipedia.org/wiki/Cyclomatic_complexity
    eqeqeq: 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector:
          ':matches(PropertyDefinition, MethodDefinition)[accessibility="private"]:not(:has(Decorator)):not([kind="constructor"])',
        message: 'Use #private instead'
      }
    ],
    'prefer-const': 'error',
    'no-useless-catch': 'error',
    'no-unreachable': 'error',
    'no-useless-return': 'error',
    'no-param-reassign': 'error',
    'no-warning-comments': 'error',
    'no-shadow': ['error', { allow: ['_', 'args', 'resolve', 'cwd'] }], // globals and a few large refactors
    'no-restricted-imports': ['error', { patterns: ['**/dist/**', '**/node_modules/**'] }],
    'max-params': ['error', 3],
    'max-lines': ['error', 1000],
    'max-lines-per-function': ['error', 50],
    'max-statements-per-line': ['error', { max: 1 }],
    'import/extensions': ['error', 'ignorePackages', { js: 'always', 'css?inline': 'never' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/only-throw-error': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_|Demo|Test|T', argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    '@typescript-eslint/switch-exhaustiveness-check': ['error', { requireDefaultForNonUnion: false }],
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    // prevent usage of overlapping/conflicting type annotations between jsdoc and TypeScript metadata
    'jsdoc/no-types': 'error',
    'jsdoc/valid-types': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/informative-docs': 'error',
    'local-typescript/no-dead-code': ['warn'], // todo, this should be migrated to the internal playground template config
    'local-typescript/require-listener-cleanup': 'error',
    'local-typescript/require-observer-cleanup': 'error',
    'local-typescript/require-timer-cleanup': 'error',

    // todo: enable these rules incrementally as the codebase is cleaned up
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/await-thenable': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/prefer-promise-reject-errors': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-useless-default-assignment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-unnecessary-template-expression': 'off',
    '@typescript-eslint/no-deprecated': 'off',
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
    '@typescript-eslint/no-unnecessary-type-conversion': 'off',
    '@typescript-eslint/prefer-reduce-type-parameter': 'off',
    '@typescript-eslint/no-unnecessary-type-parameters': 'off',
    '@typescript-eslint/prefer-readonly': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'id-length': ['off', { min: 2, exceptions: ['_'] }],
    'max-statements': ['error', 20], // goal 15
    'max-depth': ['off', 3],
    'max-nested-callbacks': ['off', 3]
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
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-deprecated': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'local-typescript/require-fixture-cleanup': ['error'],
      'local-typescript/require-element-stable': ['off'], // temporarily disabled, will enable in followup
      'local-typescript/require-listener-cleanup': ['off'],
      'local-typescript/require-observer-cleanup': ['off'],
      'local-typescript/require-timer-cleanup': ['off']
    }
  },
  {
    files: ['**/*.examples.ts'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'jsdoc/informative-docs': 'off',
      'local-typescript/example-metadata': ['error'],
      'local-typescript/example-naming': ['error'],
      'local-typescript/example-template-size': ['error'],
      'local-typescript/example-css-quality': ['error'],
      'local-typescript/example-approved-domains': ['error']
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
      '@typescript-eslint/no-unused-expressions': 'off',
      'max-lines': 'off',
      'max-statements': 'off',
      'max-lines-per-function': 'off',
      'local-typescript/require-fixture-cleanup': ['error'],
      'local-typescript/require-element-stable': ['off'], // temporarily disabled, will enable in followup
      'local-typescript/require-listener-cleanup': ['off'],
      'local-typescript/require-observer-cleanup': ['off'],
      'local-typescript/require-timer-cleanup': ['off']
    }
  },
  {
    files: ['**/*.examples.ts'],
    rules: {
      'max-lines': 'off',
      'jsdoc/informative-docs': 'off',
      'local-typescript/example-metadata': ['error'],
      'local-typescript/example-naming': ['error'],
      'local-typescript/example-template-size': ['error'],
      'local-typescript/example-css-quality': ['error'],
      'local-typescript/example-approved-domains': ['error']
    }
  }
];
