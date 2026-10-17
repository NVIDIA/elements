// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('workspace lighthouse', () => {
  it('meets performance, accessibility, and best-practice scores with operable arrangement controls', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-workspace',
      /* html */ `
        <nve-workspace groupable rearrangeable closable resizable style="height:250px">
          <nve-workspace-panel id="editor">
            <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
            <textarea aria-label="Editor">Preserved text</textarea>
          </nve-workspace-panel>
          <nve-workspace-panel id="preview">
            <nve-workspace-panel-header>Preview</nve-workspace-panel-header>Preview content</nve-workspace-panel>
          </nve-workspace>
          <script type="module">
            import '@nvidia-elements/core/workspace/define.js';
          </script>
        `
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
