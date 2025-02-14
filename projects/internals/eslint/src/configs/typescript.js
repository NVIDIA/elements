import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

const source = ['**/src/**/*.ts', '**/src/**/*.tsx', '**/src/**/*.d.ts'];
const tests = ['**/src/test/*.ts', '**/*.test.ts', '**/*.test.axe.ts', '**/*.test.ssr.ts'];
const stories = ['**/*.stories.ts'];
const ignores = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.lighthouse/**', '**/.wireit/**'];

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
    '@typescript-eslint/no-explicit-any': 'off', // TODO
    '@typescript-eslint/consistent-type-imports': 'off', // TODO
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: 'Demo|Test|T' }] // ignore demo/test components that do not need to be exported
  }
};

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
];

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
