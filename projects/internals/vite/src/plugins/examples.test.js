// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { examplesToJSON } from './examples.js';

test('example metadata preserves exact native textarea content', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'elements-textarea-example-'));
  const id = join(directory, 'src', 'editor.examples.ts');
  try {
    await mkdir(join(directory, 'src'));
    await writeFile(
      id,
      `import { html } from 'lit';
export const Default = {
  render: () => html\`<textarea name="source">  # Title\n\n~~~typescript\n  const answer = 42;\n~~~\n</textarea>\`
};
export default { component: 'nve-code-textarea' };
`
    );
    const plugin = examplesToJSON({ name: '@nvidia-elements/code' });
    assert.ok(await plugin.transform('', id));
    const result = JSON.parse(await readFile(join(directory, 'dist', 'editor.examples.json'), 'utf8'));
    assert.equal(
      result.items[0].template.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/)[1],
      '  # Title\n\n~~~typescript\n  const answer = 42;\n~~~\n'
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
