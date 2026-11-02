// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/foundations/virtual-list/define.js';

export default { title: 'Elements/Virtual List', component: 'nve-virtual-list' };

/**
 * @summary Only visible items render from a 10,000-item dataset. Use fixed-height rows to keep long lists responsive.
 * @tags pattern
 */
export const Default = {
  render: () => html`
    <nve-virtual-list id="demo-list" item-count="10000" item-height="44" style="--scroll-height: 300px"></nve-virtual-list>
    <script type="module">
      import '@nvidia-elements/foundations/virtual-list/define.js';
      const list = document.querySelector('#demo-list');
      const data = Array.from({ length: 10000 }, (_, i) => 'Item ' + i);
      function draw(range) {
        list.innerHTML = data.slice(range.start, range.end)
          .map(item => '<div>' + item + '</div>')
          .join('');
      }
      await list.updateComplete;
      list.addEventListener('virtual-change', event => draw(event.detail));
      draw(list.range);
    </script>
  `
};

/**
 * @summary Scheduled rendering ignores obsolete range requests. Use this pattern to update a list after asynchronous work.
 * @tags pattern
 */
export const ScheduledRender = {
  render: () => html`
    <nve-virtual-list id="scheduled-viewport" item-count="10000" item-height="44" style="--scroll-height: 240px"></nve-virtual-list>
    <script type="module">
      import '@nvidia-elements/foundations/virtual-list/define.js';
      const list = document.querySelector('#scheduled-viewport');
      const data = Array.from({ length: 10000 }, (_, i) => 'Item ' + i);
      function draw(range) {
        queueMicrotask(() => {
          if (list.range !== range) return;
          list.innerHTML = data.slice(range.start, range.end)
            .map(item => '<div>' + item + '</div>')
            .join('');
        });
      }
      await list.updateComplete;
      list.addEventListener('virtual-change', event => draw(event.detail));
      draw(list.range);
    </script>
  `
};

/**
 * @summary Native command buttons jump to an item by index. Use these controls to navigate long lists.
 * @tags pattern
 */
export const Commands = {
  render: () => html`
    <div nve-layout="row gap:sm pad-bottom:md">
      <nve-button commandfor="command-viewport" command="--scroll-to-index" value="500">Scroll to 500</nve-button>
      <nve-button commandfor="command-viewport" command="--scroll-to-index" value="0">Scroll to first</nve-button>
      <nve-button commandfor="command-viewport" command="--scroll-to-index" value="9999">Scroll to last</nve-button>
    </div>
    <nve-virtual-list id="command-viewport" item-count="10000" item-height="44" style="--scroll-height: 250px"></nve-virtual-list>
    <script type="module">
      import '@nvidia-elements/core/button/define.js';
      import '@nvidia-elements/foundations/virtual-list/define.js';
      const list = document.querySelector('#command-viewport');
      const data = Array.from({ length: 10000 }, (_, i) => 'Item ' + i);
      function draw(range) {
        list.innerHTML = data.slice(range.start, range.end)
          .map(item => '<div>' + item + '</div>')
          .join('');
      }
      await list.updateComplete;
      list.addEventListener('virtual-change', event => draw(event.detail));
      draw(list.range);
    </script>
  `
};
