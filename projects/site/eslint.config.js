import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, appConfig, htmlConfig, jsonConfig } from '@internals/eslint';

htmlConfig[1].rules['html/element-newline'] = 'off'; // todo
htmlConfig[1].rules['html/require-img-alt'] = 'off'; // disabled due to not following role presentation

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...htmlConfig,
  ...browserTypescriptConfig,
  ...appConfig,
  ...jsonConfig,
  {
    // These examples intentionally demonstrate incomplete and hypothetical component APIs.
    files: ['src/docs/api-design/**/*.md', 'src/docs/internal/guidelines/**/*.md'],
    rules: {
      '@nvidia-elements/lint/no-missing-control-label': 'off',
      '@nvidia-elements/lint/no-missing-slotted-elements': 'off',
      '@nvidia-elements/lint/no-unknown-tags': 'off'
    }
  },
  {
    // These examples intentionally demonstrate deprecated APIs.
    files: ['src/docs/about/migration.md'],
    rules: {
      '@nvidia-elements/lint/no-deprecated-tags': 'off',
      '@nvidia-elements/lint/no-deprecated-attributes': 'off',
      '@nvidia-elements/lint/no-deprecated-global-attributes': 'off',
      '@nvidia-elements/lint/no-deprecated-popover-attributes': 'off',
      '@nvidia-elements/lint/no-deprecated-icon-names': 'off',
      '@nvidia-elements/lint/no-unexpected-attribute-value': 'off',
      '@nvidia-elements/lint/no-unstyled-typography': 'off',
      '@nvidia-elements/lint/no-missing-control-label': 'off',
      '@nvidia-elements/lint/no-missing-slotted-elements': 'off',
      '@nvidia-elements/lint/no-unexpected-global-attribute-value': 'off',
      '@nvidia-elements/lint/no-restricted-container-full': 'off',
      '@nvidia-elements/lint/no-unknown-tags': 'off'
    }
  },
  {
    files: ['src/_11ty/**/*.js'],
    rules: {
      '@nvidia-elements/lint/no-unstyled-typography': 'off'
    }
  },
  {
    files: ['src/_internal/**/*.ts', 'src/_11ty/**/*.ts'],
    rules: {
      // internal demo/doc components and 11ty layout scripts are naturally long
      'max-lines-per-function': 'off',
      'max-statements': 'off'
    }
  }
];
