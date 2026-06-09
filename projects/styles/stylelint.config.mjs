import baseConfig from '../../stylelint.config.mjs';

/** @type {import("stylelint").Config} */
export default {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['define-mixin', 'each', 'mixin']
      }
    ],
    'at-rule-empty-line-before': null,
    'custom-property-pattern': null,
    'media-query-no-invalid': null
  }
};
