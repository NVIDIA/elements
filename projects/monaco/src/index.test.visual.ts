// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';
import { template as inputTemplate, readyCheck as inputReadyCheck } from './input/input.test.visual.js';
import { template as editorTemplate, readyCheck as editorReadyCheck } from './editor/editor.test.visual.js';
import {
  template as diffEditorTemplate,
  readyCheck as diffEditorReadyCheck
} from './diff-editor/diff-editor.test.visual.js';
import {
  template as diffInputTemplate,
  readyCheck as diffInputReadyCheck
} from './diff-input/diff-input.test.visual.js';
import { template as problemsTemplate, readyCheck as problemsReadyCheck } from './problems/problems.test.visual.js';

describe('monaco input visual', () => {
  test('input should match visual baseline', async () => {
    const report = await visualRunner.render('monaco', template(''), { network: true, waitFor: readyCheck });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });

  test('input should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('monaco.dark', template('dark'), { network: true, waitFor: readyCheck });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });
});

async function readyCheck(evaluate: (fn: () => boolean) => Promise<boolean>) {
  await inputReadyCheck(evaluate);
  await editorReadyCheck(evaluate);
  await diffEditorReadyCheck(evaluate);
  await diffInputReadyCheck(evaluate);
  await problemsReadyCheck(evaluate);
}

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/forms/define.js';
    import '@nvidia-elements/monaco/input/define.js';
    import '@nvidia-elements/monaco/editor/define.js';
    import '@nvidia-elements/monaco/diff-editor/define.js';
    import '@nvidia-elements/monaco/diff-input/define.js';
    import '@nvidia-elements/monaco/problems/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme} reduced-motion');
  </script>
  <div nve-layout="column gap:lg align:stretch">
    ${inputTemplate()}
    ${editorTemplate()}
    ${diffEditorTemplate()}
    ${diffInputTemplate()}
    ${problemsTemplate()}
  </div>`;
}
