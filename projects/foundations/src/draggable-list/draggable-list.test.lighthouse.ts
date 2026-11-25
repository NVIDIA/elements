// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('draggable list lighthouse report', () => {
  test('meets standalone budgets', async () => {
    const report = await lighthouseRunner.getReport('nve-draggable-list', `
      <nve-draggable-list style="--gap: var(--nve-ref-size-300)">
        <button>Prepare data</button><button>Train model</button><button nve-draggable="dropzone">Move to end</button>
      </nve-draggable-list>
      <script type="module">import '@nvidia-elements/foundations/draggable-list/define.js';</script>`);
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(13.6);
  });
});
