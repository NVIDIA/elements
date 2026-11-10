// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';

import '@nvidia-elements/core/dashboard/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/select/define.js';

export default { title: 'Elements/Dashboard', component: 'nve-dashboard' };

/**
 * @summary Arrange panels on a grid while retaining application content.
 */
export const Default = {
  render: () => html`
    <div id="default-dashboard-example" nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:wrap">
        <nve-button id="reset-default-layout">Reset layout</nve-button>
      </div>
      <nve-dashboard id="default-dashboard" rearrangeable style="height:600px;--row-size:90px"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"hero-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"hero-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"hero-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"hero-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"hero-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="hero-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="hero-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="hero-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="hero-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="hero-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const example = document.querySelector('#default-dashboard-example');
        const dashboard = example.querySelector('nve-dashboard');
        const reset = example.querySelector('#reset-default-layout');
        const initialValue = dashboard.getAttribute('value');
        reset.addEventListener('click', () => { dashboard.value = initialValue; });
      </script>
    </div>
  `
};

/**
 * @summary Rearrange and resize panels while retaining application content.
 */
export const Rearrangeable = {
  render: () => html`
    <div id="rearrangeable-dashboard-example" nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:wrap">
        <nve-button id="reset-rearrangeable-layout">Reset layout</nve-button>
        <nve-switch id="toggle-rearrangeable">
          <label>Rearrangeable</label>
          <input type="checkbox" checked />
        </nve-switch>
      </div>
      <nve-dashboard id="rearrangeable-dashboard" rearrangeable style="height:600px;--row-size:90px"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"rearrangeable-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"rearrangeable-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"rearrangeable-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"rearrangeable-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"rearrangeable-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="rearrangeable-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rearrangeable-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rearrangeable-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rearrangeable-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rearrangeable-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const example = document.querySelector('#rearrangeable-dashboard-example');
        const dashboard = example.querySelector('nve-dashboard');
        const toggle = example.querySelector('#toggle-rearrangeable input');
        const initialValue = dashboard.getAttribute('value');
        toggle.addEventListener('change', () => {
          dashboard.rearrangeable = toggle.checked;
        });
        example.querySelector('#reset-rearrangeable-layout').addEventListener('click', () => {
          dashboard.value = initialValue;
        });
      </script>
    </div>
  `
};

/**
 * @summary Grow vertically within bounded columns or horizontally within bounded rows.
 */
export const Flow = {
  render: () => html`
    <div id="flow-example" nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:vertical-center align:wrap">
        <nve-button id="reset-flow-layout">Reset layout</nve-button>
        <nve-select layout="horizontal-inline" fit-content>
          <label>Flow</label>
          <select id="flow-mode">
            <option value="vertical" selected>Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </nve-select>
      </div>
      <nve-dashboard id="flow-dashboard" rearrangeable style="height:600px;--row-size:90px"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"flow-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"flow-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"flow-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"flow-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"flow-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="flow-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="flow-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="flow-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="flow-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="flow-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const example = document.querySelector('#flow-example');
        const dashboard = example.querySelector('nve-dashboard');
        const select = example.querySelector('#flow-mode');
        const initialLayout = JSON.parse(dashboard.getAttribute('value'));
        // Transpose the cells, keeping application content in the same panels.
        function transposeForFlow(layout, flow) {
          if (layout.grid.flow === flow) return layout;
          return {
            ...layout,
            grid: { ...layout.grid, flow },
            items: layout.items.map(item => ({
              ...item,
              column: item.row,
              row: item.column,
              columnSpan: item.rowSpan,
              rowSpan: item.columnSpan
            }))
          };
        }
        select.addEventListener('change', () => {
          const layout = JSON.parse(dashboard.value);
          dashboard.value = JSON.stringify(transposeForFlow(layout, select.value));
        });
        example.querySelector('#reset-flow-layout').addEventListener('click', () => {
          dashboard.value = JSON.stringify(transposeForFlow(initialLayout, select.value));
        });
      </script>
    </div>
  `
};

/**
 * @summary Compare tracks fitted to the viewport with fixed CSS cell dimensions.
 */
// eslint-disable-next-line local-typescript/example-template-size -- Keep the complete sizing controls and five-panel content with the required viewport width.
export const Sizing = {
  render: () => html`
    <div id="sizing-dashboard-example" nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:vertical-center align:wrap">
        <nve-button id="reset-sizing-layout">Reset layout</nve-button>
        <div nve-layout="row gap:md align:vertical-center align:wrap">
          <nve-select layout="horizontal-inline" fit-content>
            <label>Sizing</label>
            <select id="sizing-mode">
              <option value="fit" selected>Fit</option>
              <option value="fixed">Fixed</option>
            </select>
          </nve-select>
          <nve-range layout="horizontal-inline" fit-content style="width:auto">
            <label>Viewport width: <output for="sizing-width">100</output>%</label>
            <input id="sizing-width" type="range" min="50" max="100" value="100" />
          </nve-range>
        </div>
      </div>
      <div id="sizing-viewport" style="width:100%">
        <nve-dashboard id="sizing-dashboard" rearrangeable style="height:600px;--row-size:90px;--column-size:140px"
          value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"sizing-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"sizing-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"sizing-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"sizing-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"sizing-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
          <nve-dashboard-panel id="sizing-baseline" min-column-span="2" min-row-span="2">
            <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
            <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
            <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
          </nve-dashboard-panel>
          <nve-dashboard-panel id="sizing-candidate" min-column-span="2" min-row-span="2">
            <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
            <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
            <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
          </nve-dashboard-panel>
          <nve-dashboard-panel id="sizing-changes" min-column-span="2" min-row-span="2">
            <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
            <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
          </nve-dashboard-panel>
          <nve-dashboard-panel id="sizing-evidence" min-column-span="2" min-row-span="2">
            <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
            <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
          </nve-dashboard-panel>
          <nve-dashboard-panel id="sizing-notes" min-column-span="2" min-row-span="2">
            <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
            <nve-dashboard-panel-content>
              <nve-input>
                <input aria-label="Notes" value="Review findings." />
              </nve-input>
            </nve-dashboard-panel-content>
          </nve-dashboard-panel>
        </nve-dashboard>
      </div>
      <script type="module">
        const example = document.querySelector('#sizing-dashboard-example');
        const dashboard = example.querySelector('nve-dashboard');
        const viewport = example.querySelector('#sizing-viewport');
        const select = example.querySelector('#sizing-mode');
        const range = example.querySelector('#sizing-width');
        const output = example.querySelector('output');
        const initialValue = dashboard.getAttribute('value');
        select.addEventListener('change', () => {
          dashboard.sizing = select.value;
        });
        range.addEventListener('input', () => {
          viewport.style.width = range.value + '%';
          output.value = range.value;
        });
        example.querySelector('#reset-sizing-layout').addEventListener('click', () => {
          dashboard.value = initialValue;
        });
      </script>
    </div>
  `
};

/**
 * @summary Choose when to show the grid guides.
 */
export const Guides = {
  render: () => html`
    <div id="guides-example" nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:vertical-center align:wrap">
        <nve-button id="reset-guides-layout">Reset layout</nve-button>
        <nve-select layout="horizontal-inline" fit-content>
          <label>Guides</label>
          <select id="guides-mode">
            <option value="auto">Auto</option>
            <option value="visible" selected>Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </nve-select>
      </div>
      <nve-dashboard id="guided-dashboard" guides="visible" rearrangeable style="height:702px;--row-size:90px;--guide-size:var(--nve-ref-size-200)"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"guided-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"guided-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"guided-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"guided-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"guided-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="guided-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="guided-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="guided-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="guided-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="guided-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const example = document.querySelector('#guides-example');
        const dashboard = example.querySelector('nve-dashboard');
        const select = example.querySelector('#guides-mode');
        const initialValue = dashboard.getAttribute('value');
        select.addEventListener('change', () => {
          dashboard.guides = select.value;
        });
        example.querySelector('#reset-guides-layout').addEventListener('click', () => {
          dashboard.value = initialValue;
        });
      </script>
    </div>
  `
};

/**
 * @summary Automatically close gaps along the growth axis.
 */
export const AutoSettle = {
  render: () => html`
    <div id="auto-settle-example" nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:vertical-center align:wrap">
        <nve-button id="reset-settle-layout">Reset layout</nve-button>
        <nve-switch id="toggle-auto-settle">
          <label>Auto Settle</label>
          <input type="checkbox" />
        </nve-switch>
      </div>
      <nve-dashboard id="settle-dashboard" guides="visible" rearrangeable style="height:702px;--row-size:90px"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"settle-baseline","column":0,"row":1,"columnSpan":3,"rowSpan":2},{"id":"settle-candidate","column":3,"row":1,"columnSpan":3,"rowSpan":2},{"id":"settle-changes","column":0,"row":3,"columnSpan":3,"rowSpan":2},{"id":"settle-evidence","column":3,"row":3,"columnSpan":3,"rowSpan":2},{"id":"settle-notes","column":0,"row":5,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="settle-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="settle-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="settle-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="settle-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="settle-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const example = document.querySelector('#auto-settle-example');
        const dashboard = example.querySelector('nve-dashboard');
        const toggle = example.querySelector('#toggle-auto-settle input');
        const initialValue = dashboard.getAttribute('value');
        toggle.addEventListener('change', () => {
          dashboard.autoSettle = toggle.checked;
        });
        example.querySelector('#reset-settle-layout').addEventListener('click', () => {
          dashboard.autoSettle = false;
          toggle.checked = false;
          dashboard.value = initialValue;
        });
      </script>
    </div>
  `
};

/**
 * @summary Present one panel in native fullscreen without changing the saved arrangement.
 */
export const Fullscreenable = {
  render: () => html`
    <div id="fullscreen-dashboard-example" nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:wrap">
        <nve-button id="reset-fullscreen-layout">Reset layout</nve-button>
        <nve-switch id="toggle-fullscreenable">
          <label>Fullscreenable</label>
          <input type="checkbox" checked />
        </nve-switch>
      </div>
      <nve-dashboard id="fullscreen-dashboard" fullscreenable rearrangeable style="height:600px;--row-size:90px"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"fullscreen-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"fullscreen-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"fullscreen-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"fullscreen-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"fullscreen-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="fullscreen-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="fullscreen-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="fullscreen-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="fullscreen-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="fullscreen-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const example = document.querySelector('#fullscreen-dashboard-example');
        const dashboard = example.querySelector('nve-dashboard');
        const toggle = example.querySelector('#toggle-fullscreenable input');
        const initialValue = dashboard.getAttribute('value');
        toggle.addEventListener('change', () => {
          dashboard.fullscreenable = toggle.checked;
        });
        example.querySelector('#reset-fullscreen-layout').addEventListener('click', () => {
          dashboard.value = initialValue;
        });
      </script>
    </div>
  `
};

/**
 * @summary Add custom menus that use invoker commands to move and resize panels.
 */
// eslint-disable-next-line local-typescript/example-template-size -- Keep the complete menu composition readable without compressing its markup.
export const CustomPanelActions = {
  render: () => html`
    <nve-dashboard id="actions-dashboard" rearrangeable style="height:600px;--row-size:90px"
      value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"actions-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"actions-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"actions-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"actions-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"actions-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="actions-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>
            Baseline
            <nve-icon-button slot="suffix" icon-name="more-actions" container="flat" size="sm" aria-label="Baseline actions" value="actions-baseline" popovertarget="dashboard-actions-menu"></nve-icon-button>
          </nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="actions-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>
            Candidate
            <nve-icon-button slot="suffix" icon-name="more-actions" container="flat" size="sm" aria-label="Candidate actions" value="actions-candidate" popovertarget="dashboard-actions-menu"></nve-icon-button>
          </nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="actions-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>
            Changes
            <nve-icon-button slot="suffix" icon-name="more-actions" container="flat" size="sm" aria-label="Changes actions" value="actions-changes" popovertarget="dashboard-actions-menu"></nve-icon-button>
          </nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="actions-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>
            Evidence
            <nve-icon-button slot="suffix" icon-name="more-actions" container="flat" size="sm" aria-label="Evidence actions" value="actions-evidence" popovertarget="dashboard-actions-menu"></nve-icon-button>
          </nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="actions-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>
            Notes
            <nve-icon-button slot="suffix" icon-name="more-actions" container="flat" size="sm" aria-label="Notes actions" value="actions-notes" popovertarget="dashboard-actions-menu"></nve-icon-button>
          </nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      <nve-dropdown-group>
        <nve-dropdown id="dashboard-actions-menu">
          <nve-menu>
            <nve-menu-item popovertarget="dashboard-move-menu">
              Move
              <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
            </nve-menu-item>
            <nve-menu-item popovertarget="dashboard-shrink-menu">
              Shrink
              <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
            </nve-menu-item>
            <nve-menu-item popovertarget="dashboard-grow-menu">
              Grow
              <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
            </nve-menu-item>
          </nve-menu>
        </nve-dropdown>
        <nve-dropdown id="dashboard-move-menu" position="right">
          <nve-menu>
            <nve-menu-item commandfor="actions-dashboard" command="--move-to-start">To start</nve-menu-item>
            <nve-menu-item commandfor="actions-dashboard" command="--move-left">Left</nve-menu-item>
            <nve-menu-item commandfor="actions-dashboard" command="--move-right">Right</nve-menu-item>
            <nve-menu-item commandfor="actions-dashboard" command="--move-up">Up</nve-menu-item>
            <nve-menu-item commandfor="actions-dashboard" command="--move-down">Down</nve-menu-item>
          </nve-menu>
        </nve-dropdown>
        <nve-dropdown id="dashboard-shrink-menu" position="right">
          <nve-menu>
            <nve-menu-item commandfor="actions-dashboard" command="--decrease-width">Width</nve-menu-item>
            <nve-menu-item commandfor="actions-dashboard" command="--decrease-height">Height</nve-menu-item>
          </nve-menu>
        </nve-dropdown>
        <nve-dropdown id="dashboard-grow-menu" position="right">
          <nve-menu>
            <nve-menu-item commandfor="actions-dashboard" command="--increase-width">Width</nve-menu-item>
            <nve-menu-item commandfor="actions-dashboard" command="--increase-height">Height</nve-menu-item>
          </nve-menu>
        </nve-dropdown>
      </nve-dropdown-group>
      <script type="module">
        const dashboard = document.querySelector('#actions-dashboard');
        const dropdownGroup = dashboard.querySelector('nve-dropdown-group');
        let panelId = 'actions-baseline';
        function refresh() {
          for (const item of dropdownGroup.querySelectorAll('[command]')) {
            item.value = panelId;
            item.disabled = !dashboard.isCommandAvailable(item.command, { value: panelId });
          }
          for (const trigger of dropdownGroup.querySelectorAll('[popovertarget]')) {
            const items = trigger.popoverTargetElement.querySelectorAll('[command]');
            trigger.disabled = [...items].every(item => item.disabled);
          }
        }
        dropdownGroup.addEventListener('beforetoggle', event => {
          if (event.newState !== 'open') return;
          if (event.target.id === 'dashboard-actions-menu') panelId = event.source?.value ?? panelId;
          refresh();
        }, true);
        dashboard.addEventListener('commandavailabilitychange', refresh);
        dashboard.addEventListener('change', event => {
          if (event.target === dashboard) dropdownGroup.close();
        });
        refresh();
      </script>
    </nve-dashboard>
  `
};

/**
 * @summary Add and remove panels through the DOM while preserving application content.
 */
export const DynamicPanels = {
  render: () => html`
    <div id="dynamic-panels-example" nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:wrap">
        <nve-button id="reset-dynamic-layout">Reset layout</nve-button>
        <div nve-layout="row gap:sm">
          <nve-button id="add-dynamic-notes">Add Notes</nve-button>
          <nve-button id="remove-dynamic-notes" disabled>Remove Notes</nve-button>
        </div>
      </div>
      <nve-dashboard id="dynamic-dashboard" rearrangeable style="height:400px;--row-size:90px"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"dynamic-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"dynamic-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2}]}'>
        <nve-dashboard-panel id="dynamic-baseline" min-column-span="3" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="dynamic-candidate" min-column-span="3" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
      </nve-dashboard>
      <template id="dynamic-notes-template">
        <nve-dashboard-panel id="dynamic-notes" min-column-span="3" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </template>
      <script type="module">
        const example = document.querySelector('#dynamic-panels-example');
        const dashboard = example.querySelector('nve-dashboard');
        const add = example.querySelector('#add-dynamic-notes');
        const remove = example.querySelector('#remove-dynamic-notes');
        const notes = example.querySelector('#dynamic-notes-template').content.firstElementChild;
        const initialValue = dashboard.getAttribute('value');

        add.addEventListener('click', () => {
          dashboard.append(notes);
          add.disabled = true;
          remove.disabled = false;
        });

        remove.addEventListener('click', () => {
          notes.remove();
          add.disabled = false;
          remove.disabled = true;
        });

        example.querySelector('#reset-dynamic-layout').addEventListener('click', () => {
          dashboard.value = initialValue;
        });
      </script>
    </div>
  `
};

/**
 * @summary Save and restore panel placement without recreating application content.
 */
export const SaveRestore = {
  render: () => html`
    <div nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:wrap">
        <nve-button id="reset-layout">Reset layout</nve-button>
        <div nve-layout="row gap:sm">
          <nve-button id="save-layout">Save layout</nve-button>
          <nve-button id="restore-layout">Restore layout</nve-button>
        </div>
      </div>
      <nve-dashboard id="saved-layout" rearrangeable style="height:600px;--row-size:90px" value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"saved-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"saved-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"saved-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"saved-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"saved-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="saved-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="saved-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="saved-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="saved-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="saved-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const dashboard = document.querySelector('#saved-layout');
        const save = document.querySelector('#save-layout');
        const restore = document.querySelector('#restore-layout');
        const reset = document.querySelector('#reset-layout');
        const initialValue = dashboard.getAttribute('value');
        let savedValue = initialValue;
        save.addEventListener('click', () => { savedValue = dashboard.value; });
        restore.addEventListener('click', () => { dashboard.value = savedValue; });
        reset.addEventListener('click', () => { dashboard.value = initialValue; });
      </script>
    </div>
  `
};

/**
 * @summary Match the surrounding layout with inset, flat, or full container framing.
 */
export const Container = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-dashboard container="inset" rearrangeable style="height:260px" value='{"version":1,"grid":{"flow":"vertical","tracks":2},"items":[{"id":"inset-baseline","column":0,"row":0,"columnSpan":1,"rowSpan":2},{"id":"inset-candidate","column":1,"row":0,"columnSpan":1,"rowSpan":2}]}'>
        <nve-dashboard-panel id="inset-baseline"><nve-dashboard-panel-header>Baseline (inset)</nve-dashboard-panel-header><nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content><nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer></nve-dashboard-panel>
        <nve-dashboard-panel id="inset-candidate"><nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header><nve-dashboard-panel-content>Current run</nve-dashboard-panel-content><nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer></nve-dashboard-panel>
      </nve-dashboard>
      <nve-dashboard container="flat" rearrangeable style="height:260px" value='{"version":1,"grid":{"flow":"vertical","tracks":2},"items":[{"id":"flat-baseline","column":0,"row":0,"columnSpan":1,"rowSpan":2},{"id":"flat-candidate","column":1,"row":0,"columnSpan":1,"rowSpan":2}]}'>
        <nve-dashboard-panel id="flat-baseline"><nve-dashboard-panel-header>Baseline (flat)</nve-dashboard-panel-header><nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content><nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer></nve-dashboard-panel>
        <nve-dashboard-panel id="flat-candidate"><nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header><nve-dashboard-panel-content>Current run</nve-dashboard-panel-content><nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer></nve-dashboard-panel>
      </nve-dashboard>
      <nve-dashboard container="full" rearrangeable style="height:260px" value='{"version":1,"grid":{"flow":"vertical","tracks":2},"items":[{"id":"full-baseline","column":0,"row":0,"columnSpan":1,"rowSpan":2},{"id":"full-candidate","column":1,"row":0,"columnSpan":1,"rowSpan":2}]}'>
        <nve-dashboard-panel id="full-baseline"><nve-dashboard-panel-header>Baseline (full)</nve-dashboard-panel-header><nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content><nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer></nve-dashboard-panel>
        <nve-dashboard-panel id="full-candidate"><nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header><nve-dashboard-panel-content>Current run</nve-dashboard-panel-content><nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer></nve-dashboard-panel>
      </nve-dashboard>
    </div>
  `
};

/**
 * @summary Customize header and footer spacing, control sizes, and panel corners for a compact dashboard.
 * @tags theme
 */
export const CompactStyling = {
  render: () => html`
    <div id="compact-dashboard-example" nve-layout="column gap:md">
      <nve-button>Reset layout</nve-button>
      <style>
        #condensed-dashboard > nve-dashboard-panel {
          --box-shadow: none;
          --border-radius: 0;
          --control-width: var(--nve-ref-size-600);
          --control-height: var(--nve-ref-size-800);
        }
        #condensed-dashboard nve-dashboard-panel-header {
          --min-height: var(--nve-ref-size-800);
          --suffix-padding: var(--nve-ref-size-50);
          --padding: var(--nve-ref-size-100) var(--nve-ref-size-100) var(--nve-ref-size-100) var(--nve-ref-size-250);
        }
        #condensed-dashboard nve-dashboard-panel-footer {
          --suffix-padding: var(--nve-ref-size-50);
          --padding: var(--nve-ref-size-100) var(--nve-ref-size-250);
        }
      </style>
      <nve-dashboard id="condensed-dashboard" rearrangeable style="height:480px;--gap:0px;--row-size:80px"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"condensed-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"condensed-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"condensed-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"condensed-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"condensed-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="condensed-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header><span nve-text="label sm semibold">Baseline</span></nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer><span nve-text="body sm">Complete</span></nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="condensed-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header><span nve-text="label sm semibold">Candidate</span></nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer><span nve-text="body sm">Complete</span></nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="condensed-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header><span nve-text="label sm semibold">Changes</span></nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="condensed-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header><span nve-text="label sm semibold">Evidence</span></nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="condensed-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header><span nve-text="label sm semibold">Notes</span></nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const example = document.querySelector('#compact-dashboard-example');
        const dashboard = example.querySelector('nve-dashboard');
        const initialValue = dashboard.getAttribute('value');
        example.querySelector('nve-button').addEventListener('click', () => {
          dashboard.value = initialValue;
        });
      </script>
    </div>
  `
};

/**
 * @summary Adjust spacing between panels with --gap. Zero joins borders with matching widths.
 * @tags test-case
 */
export const Gap = {
  render: () => html`
    <div id="dashboard-gap-example" nve-layout="column gap:md">
      <nve-range>
        <label>
          Gap:
          <output for="dashboard-gap-range">0</output>
          px
        </label>
        <input id="dashboard-gap-range" type="range" min="0" max="24" value="0" />
      </nve-range>
      <nve-dashboard id="gap-dashboard" container="full" rearrangeable style="height:600px;--row-size:90px;--gap:0px"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"gap-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"gap-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"gap-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"gap-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"gap-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="gap-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="gap-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="gap-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="gap-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="gap-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const example = document.querySelector('#dashboard-gap-example');
        const dashboard = example.querySelector('nve-dashboard');
        const range = example.querySelector('input[type="range"]');
        const output = example.querySelector('output');
        range.addEventListener('input', () => {
          dashboard.style.setProperty('--gap', range.value + 'px');
          output.value = range.value;
        });
      </script>
    </div>
  `
};

/**
 * @summary Mirror panel placement and controls with the reading direction.
 * @tags test-case
 */
export const RightToLeft = {
  render: () => html`
    <div id="rtl-dashboard-example" nve-layout="column gap:md">
      <div nve-layout="row gap:md align:space-between align:wrap">
        <nve-button id="reset-rtl-layout">Reset layout</nve-button>
      </div>
      <nve-dashboard id="rtl-dashboard" dir="rtl" rearrangeable guides="visible" style="height:600px;--row-size:90px"
        value='{"version":1,"grid":{"flow":"vertical","tracks":6},"items":[{"id":"rtl-baseline","column":0,"row":0,"columnSpan":3,"rowSpan":2},{"id":"rtl-candidate","column":3,"row":0,"columnSpan":3,"rowSpan":2},{"id":"rtl-changes","column":0,"row":2,"columnSpan":3,"rowSpan":2},{"id":"rtl-evidence","column":3,"row":2,"columnSpan":3,"rowSpan":2},{"id":"rtl-notes","column":0,"row":4,"columnSpan":6,"rowSpan":2}]}'>
        <nve-dashboard-panel id="rtl-baseline" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Reference run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rtl-candidate" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Current run</nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rtl-changes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Changes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Comparison</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rtl-evidence" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Evidence</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Test cases</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="rtl-notes" min-column-span="2" min-row-span="2">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <nve-input>
              <input aria-label="Notes" value="Review findings." />
            </nve-input>
          </nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
      <script type="module">
        const example = document.querySelector('#rtl-dashboard-example');
        const dashboard = example.querySelector('nve-dashboard');
        const reset = example.querySelector('#reset-rtl-layout');
        const initialValue = dashboard.getAttribute('value');
        reset.addEventListener('click', () => { dashboard.value = initialValue; });
      </script>
    </div>
  `
};
