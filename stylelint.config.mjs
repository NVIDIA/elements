/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.wireit/**',
    '**/.eslintcache/**',
    '**/coverage/**',
    '**/src/vendor/**',
    '**/src/css/**' // elements legacy css
  ],
  // elements specific rules and best practices are managed by @nvidia-elements/lint
  rules: {
    'alpha-value-notation': 'number',
    'hue-degree-notation': 'number',
    'property-no-vendor-prefix': null, // custom internals style
    'declaration-empty-line-before': null, // prettier
    'custom-property-empty-line-before': null, // prettier
    'import-notation': null, // vite
    'custom-property-pattern': '^(_?[a-z][a-z0-9]*(-[a-z0-9]+)*|vscode-.+)$', // convention
    'value-keyword-case': ['lower', { ignoreKeywords: ['Roboto', 'currentColor'] }], // convention
    'declaration-block-no-redundant-longhand-properties': [true, { ignoreShorthands: ['grid-template'] }], // grid layouts are more readable as separate long hand syntax
    'no-duplicate-selectors': null, // selectors repeated across sections for readability
    'no-descending-specificity': null, // repeated across sections for readability
    'comment-empty-line-before': null,
    'property-disallowed-list': [
      // logical properties are required for internationalization
      'margin-left',
      'margin-right',
      'margin-top',
      'margin-bottom',
      'padding-left',
      'padding-right',
      'padding-top',
      'padding-bottom'
    ],
    'declaration-property-value-disallowed-list': [
      {
        '/^(margin|padding)(-(top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end))?$/': [
          '/(?<!\\w)\\d+px/'
        ],
        '/^(gap|row-gap|column-gap)$/': ['/(?<!\\w)\\d+px/'],
        '/^(top|right|bottom|left)$/': ['/(?<!\\w)\\d+px/'],
        '/^inset(-(inline|block)(-(start|end))?)?$/': ['/(?<!\\w)\\d+px/']
      },
      { message: 'Use a design token (--nve-ref-size-*, --nve-ref-space-*) instead of a hardcoded pixel value.' }
    ]
  }
};
