import { config } from '@weiran.zsd/multi-eslint-rule-config'; // https://github.com/eslint/eslint/issues/19013

const source = ['src/**/*.ts', 'src/**/*.d.ts'];
const ignores = ['node_modules/', 'coverage/', 'dist/', 'build/', '.visual/', '.lighthouse/', '.wireit/'];

/** @type {import('eslint').Linter.Config[]} */
export const appConfig = [
  {
    files: [...source],
    ignores: [...ignores],
    rules: {
      'no-implicit-globals': ['error'],
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'Use globalThis instead.' },
        { name: 'location', message: 'Use globalThis.location instead.' },
        { name: 'document', message: 'Use globalThis.document instead.' }
      ]
    }
  },
  {
    files: [...source],
    ignores: [...ignores],
    ...config(
      [
        {
          rule: 'no-restricted-imports',
          ruleConfig: [
            'error',
            {
              patterns: [
                {
                  group: [
                    '@nvidia-elements/core/**/*.css',
                    '@nvidia-elements/core/**/*.css?inline',
                    '@nvidia-elements/styles/**/*.css',
                    '@nvidia-elements/styles/**/*.css?inline'
                  ],
                  message:
                    'Inline CSS utils are not allowed to prevent performance issues, use shadow DOM encapsulated CSS instead'
                }
              ]
            }
          ]
        }
      ],
      'no-inline-css'
    )
  }
];
