// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Linter } from 'eslint';
import json from '@eslint/json';
import noUnexpectedLibraryDependencies from '../rules/no-unexpected-library-dependencies.js';
import noDeprecatedPackages from '../rules/no-deprecated-packages.js';
import { elementsIgnorePatterns } from './ignores.js';

const source = ['package.json'];
const ignores = [...elementsIgnorePatterns];

export const elementsJsonConfig: Linter.Config = {
  files: [...source],
  ignores,
  language: 'json/json',
  plugins: {
    json,
    '@nvidia-elements/lint': {
      rules: {
        'no-unexpected-library-dependencies': noUnexpectedLibraryDependencies,
        'no-deprecated-packages': noDeprecatedPackages
      }
    }
  },
  rules: {
    '@nvidia-elements/lint/no-unexpected-library-dependencies': ['error'],
    '@nvidia-elements/lint/no-deprecated-packages': ['error']
  }
};
