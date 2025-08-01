import { browserJavaScriptConfig, browserTypescriptConfig, appConfig, htmlConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...browserJavaScriptConfig,
  ...browserTypescriptConfig,
  ...appConfig,
  ...htmlConfig,
  {
    files: ['src/_internal/canvas-editable/canvas-editable.ts'],
    rules: {
      'no-inline-css/no-restricted-imports': 'off' // temporary workaround as latest version of responsive.css is not published yet, and needs a direct ?inline import for the iFramed editable canvas example of Combined Layout
    }
  }
];
