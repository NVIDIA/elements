import js from '@eslint/js';

const source = ['**/src/**/*.ts', '**/src/**/*.js', '**/src/**/*.tsx', '**/src/**/*.d.ts'];
const tests = ['**/src/test/*.ts', '**/*.test.ts', '**/*.test.axe.ts'];
const stories = ['**/*.stories.ts'];
const ignores = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.lighthouse/**'];

export const libraryConfig = [
  {
    files: [...source],
    rules: js.configs.recommended.rules
  },
  {
    files: [...source],
    ignores: [...ignores, ...tests, ...stories],
    rules: {
      'no-implicit-globals': ['error'],
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'Use globalThis instead.' },
        { name: 'location', message: 'Use globalThis.location instead.' },
        { name: 'document', message: 'Use globalThis.document instead.' }
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@elements/elements/**/*.css',
                '@elements/elements/**/*.css?inline',
                '@nvidia-elements/core/**/*.css',
                '@nvidia-elements/core/**/*.css?inline'
              ],
              message:
                'inline CSS utils are not allowed in library APIs to prevent performance issues, use shadow DOM encapsulated CSS instead'
            }
          ]
        }
      ]
    }
  }
];
