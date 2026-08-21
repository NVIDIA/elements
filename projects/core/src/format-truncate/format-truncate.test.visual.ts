// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('format-truncate visual', () => {
  test('format-truncate should match visual baseline', async () => {
    const report = await visualRunner.render('format-truncate', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('format-truncate should match visual baseline in dark theme', async () => {
    const report = await visualRunner.render('format-truncate.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(2);
  });
});

function template(theme: '' | 'dark' = ''): string {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/format-truncate/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="column gap:sm pad:sm" style="width: 240px; background: var(--nve-sys-layer-container-background)">
      <nve-format-truncate position="start">training-pipeline-2026-08-05-production</nve-format-truncate>
      <h2 nve-text="heading lg"><nve-format-truncate position="center">training-pipeline-2026-08-05-production</nve-format-truncate></h2>
      <nve-format-truncate position="center" bias="start">training-pipeline-2026-08-05-production</nve-format-truncate>
      <nve-format-truncate position="center" strategy="word" preserve="3">NVIDIA autonomous vehicle training pipeline</nve-format-truncate>
      <nve-format-truncate position="center" strategy="path" preserve="2">/models/checkpoints/production/model.bin</nve-format-truncate>
      <nve-format-truncate position="end">training-pipeline-2026-08-05-production</nve-format-truncate>
      <nve-format-truncate position="center">short text</nve-format-truncate>
    </div>
  `;
}
