import { config } from '@weiran.zsd/multi-eslint-rule-config'; // https://github.com/eslint/eslint/issues/19013

const source = ['src/**/*.ts', 'src/**/*.js', 'src/**/*.tsx', 'src/**/*.d.ts'];
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
export const libraryConfig = [
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
      ]
    }
  },
  {
    files: [...source],
    ignores: ['**/src/**/bundle.ts', ...ignores, ...tests, ...stories],
    ...config([
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
                  '@nvidia-elements/styles/**/*.css?inline',
                  '@nvidia-elements/themes/**/*.css',
                  '@nvidia-elements/themes/**/*.css?inline'
                ],
                message:
                  'Inline CSS utils are not allowed in library APIs to prevent performance issues, use shadow DOM encapsulated CSS instead'
              },
              {
                group: ['@internals/'],
                message: 'Repository internal utilities and libraries cannot be used in published packages.'
              }
            ]
          }
        ]
      }
    ])
  },
  {
    files: [...source],
    ignores: [
      '**/src/**/define.ts',
      '**/src/**/define.js',
      '**/src/**/define.tsx',
      '**/src/**/define.d.ts',
      '**/src/**/bundle.ts',
      ...tests,
      ...stories,
      ...ignores
    ],
    ...config(
      [
        {
          rule: 'no-restricted-imports',
          ruleConfig: [
            'error',
            {
              patterns: [
                {
                  group: ['@nvidia-elements/core/**/define.js'],
                  message: 'Side effect imports should only exist in "define.js" entrypoints'
                }
              ]
            }
          ]
        }
      ],
      'no-side-effect-imports'
    )
  }
];
