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
      <nve-tree-node expanded>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>
          <a href="#" nve-text="link">•︎•︎•︎•︎•︎•︎</a>
        </nve-tree-node>
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
      </nve-tree>
    </section>

    <!-- selectable expanded -->
    <nve-tree selectable="single">
      <nve-tree-node selected expanded>
        •︎•︎•︎•︎•︎•︎
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
        <nve-tree-node>•︎•︎•︎•︎•︎•︎</nve-tree-node>
      </nve-tree-node>
    </nve-tree>
  `;
}
