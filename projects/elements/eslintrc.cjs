module.exports = {
  root: true,
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/storybook-static/**'],
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:wc/recommended',
    'plugin:lit/recommended',
    'plugin:lit-a11y/recommended'
  ],
  overrides: [
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'lit-a11y'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off', // TODO: would like to enable
    'lit-a11y/anchor-has-content': 'off', // rule does not check for aria-label
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: 'Demo|Test' }], // ignore demo/test components that do not need to be exported
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'lit/decorators', message: 'import individual decorators https://lit.dev/docs/components/decorators/#importing-decorators' },
          { name: 'lit/decorators.js', message: 'import individual decorators https://lit.dev/docs/components/decorators/#importing-decorators' }
        ],
        patterns: ['lit-element', 'lit-element/*', 'lit-html', 'lit-html/*'],
      },
    ],
  }
}
