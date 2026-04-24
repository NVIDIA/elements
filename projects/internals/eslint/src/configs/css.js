import noHostMargin from '../local/no-host-margin.js';
import requireSpdxHeader from '../local/require-spdx-header.js';

const source = ['src/**/*.css'];
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
export const cssConfig = [
  {
    ignores // https://github.com/eslint/eslint/discussions/18304
  },
  {
    files: [...source],
    ignores,
    language: 'css/css',
    plugins: {
      'local-css': {
        rules: {
          'no-host-margin': noHostMargin,
          'require-spdx-header': requireSpdxHeader
        }
      }
    },
    rules: {
      'local-css/no-host-margin': ['warn'],
      'local-css/require-spdx-header': ['error']
    }
  }
];
