// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Linter } from 'eslint';

/** Directory ignore patterns shared by Elements ESLint configs. */
export const elementsIgnorePatterns = [
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

export const elementsGlobalIgnoresConfig: Linter.Config = {
  ignores: elementsIgnorePatterns
};
