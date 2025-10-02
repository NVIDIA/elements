import type { Linter } from 'eslint';
import htmlParser from '@html-eslint/parser';
import noDeprecatedTags from '../rules/no-deprecated-tags.js';
import noDeprecatedAttributes from '../rules/no-deprecated-attributes.js';
import noDeprecatedIconNames from '../rules/no-deprecated-icon-names.js';
import noDeprecatedPopoverAttributes from '../rules/no-deprecated-popover-attributes.js';
import noUnexpectedGlobalAttributeValue from '../rules/no-unexpected-global-attribute-value.js';
import noUnexpectedStyleCustomization from '../rules/no-unexpected-style-customization.js';
import noDeprecatedGlobalAttributes from '../rules/no-deprecated-global-attributes.js';
import noRestrictedAttributes from '../rules/no-restricted-attributes.js';

const source = ['src/**/*.html', 'src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx'];

const ignores = [
  'node_modules/',
  'coverage/',
  'dist/',
  'build/',
  'src/vendor/',
  '.visual/',
  '.lighthouse/',
  '.wireit/',
  '.11ty-vite/',
  'src/**/*.snippets.html'
];

export const elementsHtmlConfig: Linter.Config = {
  files: [...source],
  ignores,
  languageOptions: {
    parser: htmlParser,
    parserOptions: {
      frontmatter: true
    }
  },
  plugins: {
    '@nvidia-elements/lint': {
      rules: {
        'no-deprecated-tags': noDeprecatedTags,
        'no-deprecated-attributes': noDeprecatedAttributes,
        'no-deprecated-icon-names': noDeprecatedIconNames,
        'no-deprecated-popover-attributes': noDeprecatedPopoverAttributes,
        'no-deprecated-global-attributes': noDeprecatedGlobalAttributes,
        'no-unexpected-global-attribute-value': noUnexpectedGlobalAttributeValue,
        'no-unexpected-style-customization': noUnexpectedStyleCustomization,
        'no-restricted-attributes': noRestrictedAttributes
      }
    }
  },
  rules: {
    '@nvidia-elements/lint/no-unexpected-style-customization': ['off'],
    '@nvidia-elements/lint/no-deprecated-tags': ['error'],
    '@nvidia-elements/lint/no-deprecated-attributes': ['error'],
    '@nvidia-elements/lint/no-deprecated-icon-names': ['error'],
    '@nvidia-elements/lint/no-deprecated-popover-attributes': ['error'],
    '@nvidia-elements/lint/no-deprecated-global-attributes': ['error'],
    '@nvidia-elements/lint/no-unexpected-global-attribute-value': ['error'],
    '@nvidia-elements/lint/no-restricted-attributes': ['error']
  }
};
