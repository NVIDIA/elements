// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/textarea/define.js';
import '@nvidia-elements/core/workspace/define.js';

export default { title: 'Elements/Workspace', component: 'nve-workspace' };

/**
 * @summary Workspace with outline, editor, and preview panels, plus tabbed supporting panels. Drag panels or groups and resize groups to adapt the arrangement without recreating their content.
 */
export const Default = {
  render: () => html`<nve-workspace rearrangeable resizable style="height:600px" value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[1,4],"children":[{"type":"group","panels":["workspace-outline"],"active":"workspace-outline"},{"type":"split","axis":"vertical","weights":[3,2],"children":[{"type":"split","axis":"horizontal","weights":[3,2],"children":[{"type":"group","panels":["workspace-editor"],"active":"workspace-editor"},{"type":"group","panels":["workspace-preview"],"active":"workspace-preview"}]},{"type":"group","panels":["workspace-notes","workspace-activity","workspace-tasks"],"active":"workspace-notes"}]}]}}'>
    <nve-workspace-panel id="workspace-outline">
      <nve-workspace-panel-header>Outline</nve-workspace-panel-header>
      <nve-workspace-panel-content><ul nve-text="body"><li>Introduction</li><li>Layout</li><li>Interactions</li></ul></nve-workspace-panel-content>
    </nve-workspace-panel>
    <nve-workspace-panel id="workspace-editor">
      <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
      <nve-workspace-panel-content><nve-textarea><textarea aria-label="Editor" rows="8">Edit application content here.</textarea></nve-textarea></nve-workspace-panel-content>
      <nve-workspace-panel-footer>Ready</nve-workspace-panel-footer>
    </nve-workspace-panel>
    <nve-workspace-panel id="workspace-preview">
      <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
      <nve-workspace-panel-content>Preview content occupies its own group.</nve-workspace-panel-content>
    </nve-workspace-panel>
    <nve-workspace-panel id="workspace-notes">
      <nve-workspace-panel-header>Notes</nve-workspace-panel-header>
      <nve-workspace-panel-content><nve-textarea><textarea aria-label="Notes" rows="3">Keep notes beneath the editor and preview.</textarea></nve-textarea></nve-workspace-panel-content>
    </nve-workspace-panel>
    <nve-workspace-panel id="workspace-activity">
      <nve-workspace-panel-header>Activity</nve-workspace-panel-header>
      <nve-workspace-panel-content>Review recent activity in this group.</nve-workspace-panel-content>
    </nve-workspace-panel>
    <nve-workspace-panel id="workspace-tasks">
      <nve-workspace-panel-header>Tasks</nve-workspace-panel-header>
      <nve-workspace-panel-content>Track work items without leaving the current arrangement.</nve-workspace-panel-content>
    </nve-workspace-panel>
  </nve-workspace>`
};

/**
 * @summary Tabbed workspace for related panels that share one group. Supply stable panel IDs and headers to keep application content when switching views.
 */
export const Tabs = {
  render: () =>
    html`<nve-workspace style="height:360px"><nve-workspace-panel id="first"><nve-workspace-panel-header>First</nve-workspace-panel-header><nve-workspace-panel-content><nve-input><input aria-label="Persistent content" value="Edit me"></nve-input></nve-workspace-panel-content></nve-workspace-panel><nve-workspace-panel id="second"><nve-workspace-panel-header>Second</nve-workspace-panel-header><nve-workspace-panel-content>Second content</nve-workspace-panel-content></nve-workspace-panel></nve-workspace>`
};

/**
 * @summary Workspace with drag handles for moving and splitting views. Enable rearrangement, resizing, and closing independently to suit the application.
 */
export const Rearrangeable = {
  render: () =>
    html`<nve-workspace rearrangeable closable resizable style="height:420px"><nve-workspace-panel id="editor"><nve-workspace-panel-header>Editor</nve-workspace-panel-header><nve-workspace-panel-content><nve-textarea><textarea aria-label="Editor">Preserved content</textarea></nve-textarea></nve-workspace-panel-content></nve-workspace-panel><nve-workspace-panel id="preview"><nve-workspace-panel-header>Preview</nve-workspace-panel-header><nve-workspace-panel-content>Preview content</nve-workspace-panel-content></nve-workspace-panel><nve-workspace-panel id="terminal"><nve-workspace-panel-header>Terminal</nve-workspace-panel-header><nve-workspace-panel-content>Terminal content</nve-workspace-panel-content></nve-workspace-panel></nve-workspace>`
};

/**
 * @summary Resizable workspace with independent separators. Adjust neighboring groups while preserving the remaining group's size.
 */
export const Resizable = {
  render: () =>
    html`<nve-workspace resizable value='{"version":1,"root":{"type":"split","axis":"horizontal","weights":[1,1,1],"children":[{"type":"group","panels":["editor"],"active":"editor"},{"type":"group","panels":["preview"],"active":"preview"},{"type":"group","panels":["terminal"],"active":"terminal"}]},"closed":[]}'  style="height:420px"><nve-workspace-panel id="editor"><nve-workspace-panel-header>Editor</nve-workspace-panel-header><nve-workspace-panel-content><nve-textarea><textarea aria-label="Editor">State remains here</textarea></nve-textarea></nve-workspace-panel-content></nve-workspace-panel><nve-workspace-panel id="preview"><nve-workspace-panel-header>Preview</nve-workspace-panel-header><nve-workspace-panel-content>Preview content</nve-workspace-panel-content></nve-workspace-panel><nve-workspace-panel id="terminal"><nve-workspace-panel-header>Terminal</nve-workspace-panel-header><nve-workspace-panel-content>Terminal content</nve-workspace-panel-content></nve-workspace-panel></nve-workspace>`
};

/**
 * @summary Constrained workspace with panel minimum heights. Keep views usable when the available space is too small, and join tabs to reduce overflow.
 */
export const Overflow = {
  render: () =>
    html`<nve-workspace rearrangeable resizable style="height:180px" value='{"version":1,"root":{"type":"split","axis":"vertical","weights":[1,1],"children":[{"type":"group","panels":["top"],"active":"top"},{"type":"group","panels":["bottom"],"active":"bottom"}]},"closed":[]}'><nve-workspace-panel id="top" min-height="110"><nve-workspace-panel-header>Top</nve-workspace-panel-header><nve-workspace-panel-content>Top content</nve-workspace-panel-content></nve-workspace-panel><nve-workspace-panel id="bottom" min-height="110"><nve-workspace-panel-header>Bottom</nve-workspace-panel-header><nve-workspace-panel-content>Bottom content</nve-workspace-panel-content></nve-workspace-panel></nve-workspace>`
};

/**
 * @summary Scrollable tab strip for views in a narrow workspace. Use horizontal scrolling or keyboard selection to reach tabs beyond the visible area.
 */
export const ScrollableTabs = {
  render: () =>
    html`<nve-workspace rearrangeable closable style="width:260px;height:260px">${Array.from({ length: 8 }, (_, index) => html`<nve-workspace-panel id=${`view-${index}`}><nve-workspace-panel-header>View ${index + 1}</nve-workspace-panel-header><nve-workspace-panel-content>Content ${index + 1}</nve-workspace-panel-content></nve-workspace-panel>`)}</nve-workspace>`
};

/**
 * @summary Saved arrangement with a closed preview panel. Open and close the preview with invoker commands to see neighboring groups resize without losing its position or edited content.
 */
export const ClosedView = {
  render: () =>
    html`<div nve-layout="column gap:md">
      <div nve-layout="row gap:sm">
        <nve-button command="--open" commandfor="restorable-preview">Open preview</nve-button>
        <nve-button command="--close" commandfor="restorable-preview">Close preview</nve-button>
      </div>
      <nve-workspace closable resizable style="height:360px" value='{"version":1,"root":{"type":"split","axis":"horizontal","weights":[1,1,1],"children":[{"type":"group","panels":["retained-editor"],"active":"retained-editor"},{"type":"group","panels":["restorable-preview"],"active":"restorable-preview"},{"type":"group","panels":["retained-terminal"],"active":"retained-terminal"}]},"closed":["restorable-preview"]}'>
        <nve-workspace-panel id="retained-editor"><nve-workspace-panel-header>Editor</nve-workspace-panel-header><nve-workspace-panel-content>Editor content</nve-workspace-panel-content></nve-workspace-panel>
        <nve-workspace-panel id="restorable-preview"><nve-workspace-panel-header>Preview</nve-workspace-panel-header><nve-workspace-panel-content><nve-input><input aria-label="Retained preview content" value="Edit, close, and reopen me"></nve-input></nve-workspace-panel-content></nve-workspace-panel>
        <nve-workspace-panel id="retained-terminal"><nve-workspace-panel-header>Terminal</nve-workspace-panel-header><nve-workspace-panel-content>Terminal content</nve-workspace-panel-content></nve-workspace-panel>
      </nve-workspace>
    </div>`
};

/**
 * @summary Restorable workspace arrangement with groups, split proportions, and closed panels. Save the value, change the layout, then restore it without recreating application content.
 */
export const SaveRestore = {
  render: () => html`<div nve-layout="column gap:md">
    <div nve-layout="row gap:sm">
      <nve-button id="save-arrangement">Save layout</nve-button>
      <nve-button id="restore-arrangement" disabled>Restore layout</nve-button>
      <nve-button id="reset-arrangement">Reset layout</nve-button>
    </div>
    <nve-workspace id="saved-arrangement" rearrangeable closable resizable style="height:420px" value='{"version":1,"root":{"type":"split","axis":"horizontal","weights":[2,1],"children":[{"type":"group","panels":["saved-editor","saved-notes"],"active":"saved-editor"},{"type":"group","panels":["saved-preview"],"active":"saved-preview"}]},"closed":[]}'>
      <nve-workspace-panel id="saved-editor"><nve-workspace-panel-header>Editor</nve-workspace-panel-header><nve-workspace-panel-content><nve-textarea><textarea aria-label="Retained editor content">Edit me before restoring the layout</textarea></nve-textarea></nve-workspace-panel-content></nve-workspace-panel>
      <nve-workspace-panel id="saved-notes"><nve-workspace-panel-header>Notes</nve-workspace-panel-header><nve-workspace-panel-content>Notes content</nve-workspace-panel-content></nve-workspace-panel>
      <nve-workspace-panel id="saved-preview"><nve-workspace-panel-header>Preview</nve-workspace-panel-header><nve-workspace-panel-content>Preview content</nve-workspace-panel-content></nve-workspace-panel>
    </nve-workspace>
    <script type="module">
      const workspace = document.querySelector('#saved-arrangement');
      const save = document.querySelector('#save-arrangement');
      const restore = document.querySelector('#restore-arrangement');
      const reset = document.querySelector('#reset-arrangement');
      const initialValue = workspace.getAttribute('value');
      let savedValue;
      save.addEventListener('click', () => {
        savedValue = workspace.value;
        restore.disabled = false;
      });
      restore.addEventListener('click', () => {
        workspace.value = savedValue;
      });
      reset.addEventListener('click', () => {
        workspace.value = initialValue;
      });
    </script>
  </div>`
};

/**
 * @summary Composable view headers, content, and footers. Supply a title and prefix decoration, pad the body, and keep status content outside its scrolling area.
 */
export const Composition = {
  render: () => html`<nve-workspace style="height:360px">
    <nve-workspace-panel id="composed-editor">
      <nve-workspace-panel-header><nve-icon slot="prefix" name="code"></nve-icon>Editor</nve-workspace-panel-header>
      <nve-workspace-panel-content><nve-textarea><textarea aria-label="Editor content">Retained application content</textarea></nve-textarea></nve-workspace-panel-content>
      <nve-workspace-panel-footer>Ready</nve-workspace-panel-footer>
    </nve-workspace-panel>
  </nve-workspace>`
};

/**
 * @summary Container framing for contained, embedded, and edge-to-edge workspaces. Set container to inset, flat, or full to match the surrounding layout.
 */
export const Container = {
  render: () => html`<div nve-layout="column gap:md">${['inset', 'flat', 'full'].map(container => html`<nve-workspace container=${container} resizable style="height:220px" value=${JSON.stringify({ version: 1, closed: [], root: { type: 'split', axis: 'horizontal', weights: [1, 1], children: [{ type: 'group', panels: [`container-${container}`], active: `container-${container}` }, { type: 'group', panels: [`container-${container}-preview`], active: `container-${container}-preview` }] } })}>
    <nve-workspace-panel id=${`container-${container}`}><nve-workspace-panel-header>${container}</nve-workspace-panel-header><nve-workspace-panel-content>View content</nve-workspace-panel-content><nve-workspace-panel-footer>View status</nve-workspace-panel-footer></nve-workspace-panel>
    <nve-workspace-panel id=${`container-${container}-preview`}><nve-workspace-panel-header>Preview</nve-workspace-panel-header><nve-workspace-panel-content>Preview content</nve-workspace-panel-content></nve-workspace-panel>
  </nve-workspace>`)}</div>`
};

/**
 * @summary Configurable spacing between groups. Adjust --gap with the slider; zero makes adjoining groups.
 */
export const Gap = {
  render: () => html`<div id="workspace-gap-example" nve-layout="column gap:md">
    <nve-range>
      <label>Gap: <output for="workspace-gap-range">0</output> px</label>
      <input id="workspace-gap-range" type="range" min="0" max="24" value="0" />
    </nve-range>
    <nve-workspace container="full" resizable rearrangeable style="--gap:0px;height:360px" value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[1,1],"children":[{"type":"group","panels":["gap-editor"],"active":"gap-editor"},{"type":"group","panels":["gap-preview"],"active":"gap-preview"}]}}'>
      <nve-workspace-panel id="gap-editor"><nve-workspace-panel-header>Editor</nve-workspace-panel-header><nve-workspace-panel-content>Editor content</nve-workspace-panel-content></nve-workspace-panel>
      <nve-workspace-panel id="gap-preview"><nve-workspace-panel-header>Preview</nve-workspace-panel-header><nve-workspace-panel-content>Preview content</nve-workspace-panel-content></nve-workspace-panel>
    </nve-workspace>
    <script type="module">
      const example = document.querySelector('#workspace-gap-example');
      const workspace = example.querySelector('nve-workspace');
      const range = example.querySelector('input');
      const output = example.querySelector('output');
      range.addEventListener('input', () => {
        workspace.style.setProperty('--gap', range.value + 'px');
        output.value = range.value;
      });
    </script>
  </div>`
};

/**
 * @summary Group corners that match the surrounding application. Set --border-radius on Workspace to adjust the complete header, content, and footer frame.
 */
export const BorderRadius = {
  render: () => html`<nve-workspace style="height:360px;--border-radius:var(--nve-ref-border-radius-sm)">
    <nve-workspace-panel id="radius-editor"><nve-workspace-panel-header>Editor</nve-workspace-panel-header><nve-workspace-panel-content>Editor content</nve-workspace-panel-content><nve-workspace-panel-footer>Ready</nve-workspace-panel-footer></nve-workspace-panel>
    <nve-workspace-panel id="radius-preview"><nve-workspace-panel-header>Preview</nve-workspace-panel-header><nve-workspace-panel-content>Preview content</nve-workspace-panel-content></nve-workspace-panel>
  </nve-workspace>`
};

/**
 * @summary Application menus for moving and closing views. Split separates a panel, Move to joins another group, and Reopen restores closed views; Fullscreen presents the whole group.
 */
export const Actions = {
  render: () => html`
  <nve-button id="a-reopen" popovertarget="a-open" disabled>Reopen</nve-button>
  <nve-workspace id="a-demo" rearrangeable closable style="height:360px">
  ${['Editor', 'Notes', 'Preview'].map(title => html`<nve-workspace-panel id=${`a-${title.toLowerCase()}`}><nve-workspace-panel-header>${title}<nve-icon-button slot="suffix" icon-name="more-actions" container="flat" aria-label=${`${title} actions`} value=${`a-${title.toLowerCase()}`} popovertarget="a-menu"></nve-icon-button></nve-workspace-panel-header><nve-workspace-panel-content>${title}</nve-workspace-panel-content></nve-workspace-panel>`)}
  <nve-dropdown-group>
  <nve-dropdown id="a-menu"><nve-menu>
  <nve-menu-item command="--toggle-fullscreen">Fullscreen</nve-menu-item>
  ${[['a-move', 'Move to'], ['a-split', 'Split']].map(([id, label]) => html`<nve-menu-item popovertarget=${id}>${label}<nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon></nve-menu-item>`)}
  <nve-menu-item command="--close">Close</nve-menu-item>
  </nve-menu></nve-dropdown>
  ${[['a-move', '--place'], ['a-open', '--open']].map(([id, command]) => html`<nve-dropdown id=${id} position=${id === 'a-move' ? 'right' : 'bottom'}><nve-menu>${['Editor', 'Notes', 'Preview'].map(title => html`<nve-menu-item command=${command} data-target=${`a-${title.toLowerCase()}`}>${title}</nve-menu-item>`)}</nve-menu></nve-dropdown>`)}
  <nve-dropdown id="a-split" position="right"><nve-menu>${['Left', 'Right', 'Above', 'Below'].map((label, index) => html`<nve-menu-item command="--place" data-side=${['left', 'right', 'top', 'bottom'][index]}>${label}</nve-menu-item>`)}</nve-menu></nve-dropdown>
  </nve-dropdown-group>
  </nve-workspace>
  <script type="module">
  const workspace = document.querySelector('#a-demo');
  const group = workspace.querySelector('nve-dropdown-group');
  const reopen = document.querySelector('#a-reopen');
  let panelId;
  function getGroups(node) {
    if (!node) return [];
    return node.type === 'group' ? [node] : node.children.flatMap(getGroups);
  }
  function refresh() {
    const { root, closed } = JSON.parse(workspace.value);
    const labels = new Map([...workspace.querySelectorAll(':scope > nve-workspace-panel')].map(panel => [panel.id, panel.firstElementChild.textContent]));
    const supplied = id => labels.has(id);
    const groups = getGroups(root).map(group => group.panels.filter(id => supplied(id) && !closed.includes(id)));
    const current = groups.find(ids => ids.includes(panelId));
    const target = current?.find(id => id !== panelId);
    for (const item of group.querySelectorAll('[command]')) {
      const id = item.dataset.target;
      item.commandForElement = workspace;
      item.value = item.command === '--open' ? id : panelId;
      if (item.dataset.side) item.placement = { operation: 'split', target, position: item.dataset.side };
      if (id) {
        const members = groups.find(ids => ids[0] === id && ids !== current);
        item.style.display = (item.command === '--open' ? supplied(item.value) && closed.includes(item.value) : !!members) ? '' : 'none';
        if (item.command === '--place') {
          if (members) item.textContent = members.map(id => labels.get(id)).join(', ');
          item.placement = { operation: 'join', target: id };
        }
      }
      item.disabled = item.style.display === 'none' || !workspace.isCommandAvailable(item.command, item);
    }
    for (const trigger of group.querySelectorAll('[popovertarget]')) {
      trigger.disabled = [...trigger.popoverTargetElement.querySelectorAll('[command]')].every(item => item.disabled);
    }
    reopen.disabled = !closed.some(supplied);
  }
  group.addEventListener('beforetoggle', event => {
    if (event.newState !== 'open') return;
    if (event.target.id === 'a-menu') panelId = event.source?.value;
    refresh();
  }, true);
  workspace.addEventListener('commandavailabilitychange', refresh);
  workspace.addEventListener('command', () => group.close());
  </script>
  `
};

/**
 * @summary Native fullscreen for a group of panels. Invoke fullscreen from a panel, then exit to return to the saved arrangement without recreating its content.
 */
export const Fullscreen = {
  render: () => html`<div nve-layout="column gap:md">
    <nve-button command="--enter-fullscreen" commandfor="fullscreen-editor">Enter editor full screen</nve-button>
    <nve-workspace style="height:360px" value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[2,1],"children":[{"type":"group","panels":["fullscreen-editor","fullscreen-notes"],"active":"fullscreen-editor"},{"type":"group","panels":["fullscreen-preview"],"active":"fullscreen-preview"}]}}'>
      <nve-workspace-panel id="fullscreen-editor"><nve-workspace-panel-header>Editor<nve-button slot="suffix" command="--toggle-fullscreen" commandfor="fullscreen-editor">Toggle full screen</nve-button></nve-workspace-panel-header><nve-workspace-panel-content><nve-input><input aria-label="Retained fullscreen content" value="Edit me"></nve-input></nve-workspace-panel-content></nve-workspace-panel>
      <nve-workspace-panel id="fullscreen-notes"><nve-workspace-panel-header>Notes</nve-workspace-panel-header><nve-workspace-panel-content>Notes content</nve-workspace-panel-content></nve-workspace-panel>
      <nve-workspace-panel id="fullscreen-preview"><nve-workspace-panel-header>Preview</nve-workspace-panel-header><nve-workspace-panel-content>Preview content</nve-workspace-panel-content></nve-workspace-panel>
    </nve-workspace>
  </div>`
};
