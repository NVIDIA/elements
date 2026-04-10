// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Linter } from 'eslint';
import { CSSLanguage } from '@eslint/css';
import noUnexpectedCssVariable from '../rules/no-unexpected-css-variable.js';
import noUnexpectedCssValue from '../rules/no-unexpected-css-value.js';
import noUnknownCssVariable from '../rules/no-unknown-css-variable.js';
import noDeprecatedCssVariable from '../rules/no-deprecated-css-variable.js';
import noDeprecatedCssImports from '../rules/no-deprecated-css-imports.js';

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
  '.11ty-vite/',
  'src/**/*.snippets.html'
];

export const elementsCssConfig: Linter.Config = {
  files: [...source],
  ignores,
  language: 'css/css',
  languageOptions: {
    tolerant: true
  },
  plugins: {
    css: {
      languages: {
        css: new CSSLanguage()
      }
    },
    '@nvidia-elements/lint': {
      rules: {
        'no-unexpected-css-variable': noUnexpectedCssVariable,
        'no-unexpected-css-value': noUnexpectedCssValue,
        'no-unknown-css-variable': noUnknownCssVariable,
        'no-deprecated-css-variable': noDeprecatedCssVariable,
        'no-deprecated-css-imports': noDeprecatedCssImports
      }
    }
  },
  rules: {
    '@nvidia-elements/lint/no-unexpected-css-variable': ['error'],
    '@nvidia-elements/lint/no-unexpected-css-value': ['error'],
    '@nvidia-elements/lint/no-unknown-css-variable': ['error'],
    '@nvidia-elements/lint/no-deprecated-css-variable': ['error'],
    '@nvidia-elements/lint/no-deprecated-css-imports': ['error']
  }
};
