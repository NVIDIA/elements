// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ESLint } from 'eslint';
import { afterEach, describe, expect, it } from 'vitest';
import { elementsHtmlConfig, elementsRecommended, VERSION } from './index.js';

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

describe('elementsRecommended', () => {
  let fixtureRoot: string | undefined;
  let ignoredDirectory: string | undefined;

  afterEach(async () => {
    if (ignoredDirectory) {
      await chmod(ignoredDirectory, 0o755).catch(() => undefined);
      ignoredDirectory = undefined;
    }

    if (fixtureRoot) {
      await rm(fixtureRoot, { recursive: true, force: true });
      fixtureRoot = undefined;
    }
  });

  it('should export a global ignores-only config for generated directories', () => {
    const [globalIgnores] = elementsRecommended;

    expect(Object.keys(globalIgnores)).toEqual(['ignores']);
    expect(globalIgnores.ignores).toEqual(expect.arrayContaining(['.11ty-vite/', 'dist/', '.wireit/']));
  });

  it('should lint a project without scanning an unreadable .11ty-vite directory', async () => {
    fixtureRoot = await mkdtemp(join(tmpdir(), 'elements-lint-11ty-vite-'));
    await mkdir(join(fixtureRoot, 'src'));
    await writeFile(join(fixtureRoot, 'src/index.js'), 'export const title = "ok";\n');
    ignoredDirectory = join(fixtureRoot, '.11ty-vite');
    await mkdir(ignoredDirectory);
    await writeFile(join(ignoredDirectory, 'generated.js'), 'export default 1;\n');
    await chmod(ignoredDirectory, 0o000);

    const eslint = new ESLint({
      cwd: fixtureRoot,
      overrideConfigFile: true,
      overrideConfig: elementsRecommended
    });

    const results = await eslint.lintFiles(['.']);

    expect(results.some(result => result.filePath.includes('.11ty-vite'))).toBe(false);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filePath: join(fixtureRoot, 'src/index.js')
        })
      ])
    );
  });
});
