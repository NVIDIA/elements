// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parser as source, GFM, parseCode } from '@lezer/markdown';
import { parser as go } from '@lezer/go';
import { parser as json } from '@lezer/json';
import { parser as python } from '@lezer/python';
import { parser as xml } from '@lezer/xml';
import { parser as yaml } from '@lezer/yaml';
import { css, html, javascript, tsx, typescript } from '../internal/highlight/mixed-parsers.js';
import { registerLanguage } from '../internal/highlight/language-registry.js';

const fences = new Map([
  ['css', css],
  ['go', go],
  ['html', html],
  ['javascript', javascript],
  ['js', javascript],
  ['json', json],
  ['python', python],
  ['py', python],
  ['tsx', tsx],
  ['typescript', typescript],
  ['ts', typescript],
  ['xml', xml],
  ['yaml', yaml],
  ['yml', yaml]
]);

const markdown = source.configure([
  GFM,
  parseCode({
    codeParser: info => {
      const [language = ''] = info.trimStart().split(/\s+/, 1);
      return fences.get(language.toLowerCase()) ?? null;
    },
    htmlParser: html
  })
]);

registerLanguage('markdown', markdown);
