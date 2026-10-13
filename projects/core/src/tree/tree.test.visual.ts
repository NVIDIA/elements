// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('tree visual', () => {
  test('tree should match visual baseline', async () => {
    const report = await visualRunner.render('tree', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('tree should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('tree.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test.each(['', 'dark'] as const)('tree should truncate long labels within its width in theme=%s', async theme => {
    const label =
      '•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎_•︎•︎•︎•︎•︎•︎';
    const report = await visualRunner.render(
      `tree.truncate${theme ? '.dark' : ''}`,
      `
      <script type="module">
        import '@nvidia-elements/core/tree/define.js';
        document.documentElement.setAttribute('nve-theme', '${theme}');
      </script>
      <section nve-layout="column gap:lg" style="width: 600px;">
        <nve-tree style="max-width: 500px; outline: 1px dashed red;">
          <nve-tree-node style="outline: 1px dashed blue;">
            <p nve-text="label truncate">${label}</p>
          </nve-tree-node>
        </nve-tree>
        <nve-tree selectable="multi" style="width: 500px; outline: 1px dashed red;">
          <nve-tree-node expanded style="outline: 1px dashed blue;">
            <p nve-text="label truncate">${label}</p>
            <nve-tree-node style="outline: 1px dashed blue;">
              <p nve-text="label truncate">${label}</p>
            </nve-tree-node>
          </nve-tree-node>
        </nve-tree>
      </section>
      `
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('tree should preserve tree node title block rendering', async () => {
    const report = await visualRunner.render(
      'tree.title-block',
      `
      <script type="module">
        import '@nvidia-elements/core/tree/define.js';
      </script>
      <nve-tree>
        <nve-tree-node>
          <!-- inline content is side by side -->
          <span>•︎•︎•︎•︎•︎•︎</span><span>•︎•︎•︎•︎•︎•︎</span>
        </nve-tree-node>
        <nve-tree-node>
          <!-- block content is stacked -->
          <div>•︎•︎•︎•︎•︎•︎</div><div>•︎•︎•︎•︎•︎•︎</div>
        </nve-tree-node>
      </nve-tree>
    `
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('slotted link ::after should fill visible node space', async () => {
    const report = await visualRunner.render(
      'tree.slotted-link-after',
      `
      <script type="module">
        import '@nvidia-elements/core/tree/define.js';
      </script>
      <style>
        nve-tree-node a::after {
          background: oklch(0.63 0.26 29.23 / 0.5);
          color: white;
        }
      </style>
      <nve-tree>
        <nve-tree-node>
          <!-- link ::after should fill visible space -->
          <a href="#">•︎•︎•︎•︎•︎•︎</a>
        </nve-tree-node>
      </nve-tree>
    `
    );
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/tree/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <section nve-layout="column gap:lg">
    <nve-tree behavior-expand>
      <nve-tree-node expanded>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>
          •︎•︎•︎•︎•︎•︎
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
      </nve-tree-node>
    </nve-tree>

    <!-- border -->
    <nve-tree behavior-expand border>
      <nve-tree-node expanded>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node expanded>
          •︎•︎•︎•︎•︎•︎
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
      •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
      </nve-tree-node>
    </nve-tree>

    <!-- selectable -->
    <nve-tree selectable="single" behavior-expand behavior-select border>
      <nve-tree-node expanded>
      •︎•︎•︎•︎•︎•︎
        <nve-tree-node selected>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>
          •︎•︎•︎•︎•︎•︎
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
      </nve-tree-node>
    </nve-tree>

    <!-- selectable multiple -->
    <nve-tree selectable="multi" behavior-expand behavior-select border>
      <nve-tree-node expanded>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node selected>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>
          •︎•︎•︎•︎•︎•︎
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
      </nve-tree-node>
    </nve-tree>

    <!-- highlight -->
    <nve-tree behavior-expand border>
      <nve-tree-node expanded>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node highlighted>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node expanded>
          •︎•︎•︎•︎•︎•︎
          <nve-tree-node highlighted>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node highlighted>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
      </nve-tree-node>
    </nve-tree>

    <!-- links -->
    <nve-tree behavior-expand>
      <nve-tree-node><a href="#">•︎•︎•︎•︎•︎•︎</a></nve-tree-node>
      <nve-tree-node><a href="#">•︎•︎•︎•︎•︎•︎</a></nve-tree-node>
      <nve-tree-node expanded>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node><a href="#">•︎•︎•︎•︎•︎•︎</a></nve-tree-node>
        <nve-tree-node><a href="#">•︎•︎•︎•︎•︎•︎</a></nve-tree-node>
        <nve-tree-node><a href="#">•︎•︎•︎•︎•︎•︎</a></nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node><a href="#">•︎•︎•︎•︎•︎•︎</a></nve-tree-node>
        <nve-tree-node><a href="#">•︎•︎•︎•︎•︎•︎</a></nve-tree-node>
        <nve-tree-node><a href="#">•︎•︎•︎•︎•︎•︎</a></nve-tree-node>
      </nve-tree-node>
    </nve-tree>

    <!-- node content -->
    <nve-tree selectable="multi" border behavior-expand behavior-select>
      <nve-tree-node>
        <a href="#" nve-text="link">•︎•︎•︎•︎•︎•︎</a>
      </nve-tree-node>
      <!-- inline content in the default slot should remain inline -->
      <nve-tree-node>
        <span>•︎•︎•︎•︎•︎•︎</span><span>•︎•︎•︎•︎•︎•︎</span>
      </nve-tree-node>
      <!-- block content in the default slot should remain block and stack -->
      <nve-tree-node>
        <p nve-text="body sm">•︎•︎•︎•︎•︎•︎</p><p nve-text="body sm">•︎•︎•︎•︎•︎•︎</p>
      </nve-tree-node>
      <nve-tree-node expanded>
        <div nve-text="body sm muted" nve-layout="pad-bottom:xs">•︎•︎•︎•︎•︎•︎</div>
        <p nve-text="body sm">•︎•︎•︎•︎•︎•︎</p>
      </nve-tree-node>
      <nve-tree-node expanded>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>
          •︎•︎•︎•︎•︎•︎
          <div slot="content" nve-layout="column gap:sm">
            <a href="#" nve-text="link">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</a>
            <a href="#" nve-text="link">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</a>
            <a href="#" nve-text="link">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</a>
          </div>
        </nve-tree-node>
        <nve-tree-node>
          •︎•︎•︎•︎•︎•︎
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
          <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        </nve-tree-node>
      </nve-tree-node>
    </nve-tree>

    <!-- selectable expanded -->
    <nve-tree selectable="single">
      <nve-tree-node selected expanded>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  </section>
  `;
}
