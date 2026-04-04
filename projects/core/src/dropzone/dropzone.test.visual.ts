// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('dropzone visual', () => {
  test('dropzone should match visual baseline', async () => {
    const report = await visualRunner.render('dropzone', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dropzone should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('dropzone.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import { I18nService } from '@nvidia-elements/core';
    import '@nvidia-elements/core/dropzone/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');

    I18nService.update({
      dragAndDrop: '•︎•︎•︎•︎ •︎•︎•︎ •︎•︎•︎•︎ •︎•︎•︎•︎•︎ •︎•︎•︎•︎',
      browseFiles: '•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎',
      maxFileSize: '•︎•︎•︎ •︎•︎•︎•︎ •︎•︎•︎•︎•︎ •︎•︎•︎',
      files: '•︎•︎•︎•︎•︎',
      or: '•︎•︎'
    });
  </script>

  <nve-dropzone accept="•︎•︎•︎" max-file-size="0" name="files"></nve-dropzone>
  `;
}
