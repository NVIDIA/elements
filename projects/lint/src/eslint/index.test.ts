// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { elementsHtmlConfig, VERSION } from './index.js';

describe('VERSION', () => {
  it('should export a VERSION const', () => {
    expect(VERSION).toBe('0.0.0');
  });
});

describe('elementsHtmlConfig', () => {
  it('should lint rendered and fenced HTML in Markdown files', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [elementsHtmlConfig]
    });
    const markdown = `---
title: Example
---

<nve-invalid-rendered></nve-invalid-rendered>

\`\`\`html
<nve-invalid-fenced></nve-invalid-fenced>
\`\`\``;

    const [result] = await eslint.lintText(markdown, { filePath: 'src/example.md' });

    expect(result.messages).toEqual([
      expect.objectContaining({
        ruleId: '@nvidia-elements/lint/no-unknown-tags',
        line: 5
      }),
      expect.objectContaining({
        ruleId: '@nvidia-elements/lint/no-unknown-tags',
        line: 8
      })
    ]);
  });
});
