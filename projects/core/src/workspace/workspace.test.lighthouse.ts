// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { lighthouseRunner } from '@internals/vite';

describe('workspace lighthouse', () => {
  it('meets performance, accessibility, and best-practice scores with operable arrangement controls', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-workspace',
      /* html */ `
        <nve-workspace fullscreenable groupable rearrangeable closable resizable style="height:250px"
          value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[1,1],"children":[{"type":"group","panels":["editor","notes"],"active":"editor"},{"type":"group","panels":["preview"],"active":"preview"}]}}'>
          <nve-workspace-panel id="editor">
            <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
            <textarea aria-label="Editor">Preserved text</textarea>
          </nve-workspace-panel>
          <nve-workspace-panel id="notes">
            <nve-workspace-panel-header>Notes</nve-workspace-panel-header>Notes content
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
    expect(report.payload.javascript.kb).toBeLessThanOrEqual(73.7);
  });
});
