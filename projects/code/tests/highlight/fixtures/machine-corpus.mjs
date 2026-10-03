// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { scriptCases, yamlCases, tomlCases, pythonCases, cssCases, markupCases, goCases } from './corpus.mjs';
import { bashCases, shellCases } from './bash-corpus.mjs';
import { pythonProfileCases } from './python-corpus.mjs';
import { markdownCases } from './markdown-corpus.mjs';

export const machineCases = [
  ...scriptCases,
  ...yamlCases,
  ...tomlCases,
  ...pythonCases,
  ...cssCases,
  ...markupCases,
  ...goCases,
  ...bashCases,
  ...shellCases,
  ...markdownCases,
  ...pythonProfileCases.map(sample => ({ ...sample, language: 'python' })),
  { language: 'json', name: 'JSON Unicode and nested values', text: '{"GPU": [42, true, null, "\\u1234"]}\n{}' }
];
