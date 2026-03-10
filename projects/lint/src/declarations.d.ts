declare module '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

declare module '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';

declare module '*.json?inline' {
  const content: { [key: string]: unknown };
  export = content;
}
