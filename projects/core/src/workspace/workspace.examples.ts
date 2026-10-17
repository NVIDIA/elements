// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/workspace/define.js';

export default { title: 'Elements/Workspace', component: 'nve-workspace' };

/**
 * @summary Resizable workspace with independent separators. Adjust neighboring panes while preserving the remaining pane's size.
 */
export const Resizable = {
  render: () =>
    html`<nve-workspace resizable value='{"version":1,"root":{"type":"split","axis":"horizontal","weights":[1,1,1],"children":[{"type":"pane","panels":["editor"],"active":"editor"},{"type":"pane","panels":["preview"],"active":"preview"},{"type":"pane","panels":["terminal"],"active":"terminal"}]},"closed":[]}'  style="height:300px"><nve-workspace-panel id="editor"><span slot="label">Editor</span><textarea aria-label="Editor">State remains here</textarea></nve-workspace-panel><nve-workspace-panel id="preview"><span slot="label">Preview</span>Preview content</nve-workspace-panel><nve-workspace-panel id="terminal"><span slot="label">Terminal</span>Terminal content</nve-workspace-panel></nve-workspace>`
};

/**
 * @summary Tabbed workspace for related views that share one region. Supply stable panel IDs and labels to keep application content when switching views.
 */
export const Tabs = {
  render: () =>
    html`<nve-workspace style="height:250px"><nve-workspace-panel id="first"><strong slot="label">First</strong><input aria-label="Persistent content" value="Edit me"></nve-workspace-panel><nve-workspace-panel id="second"><span slot="label">Second</span>Second content</nve-workspace-panel></nve-workspace>`
};

/**
 * @summary Workspace with drag handles and action menus for moving, splitting, and closing views. Enable rearrangement, resizing, and closing independently to suit the application.
 */
export const Rearrangeable = {
  render: () =>
    html`<nve-workspace rearrangeable closable resizable style="height:300px"><nve-workspace-panel id="editor"><span slot="label">Editor</span><textarea aria-label="Editor">Preserved content</textarea></nve-workspace-panel><nve-workspace-panel id="preview"><span slot="label">Preview</span>Preview content</nve-workspace-panel><nve-workspace-panel id="terminal"><span slot="label">Terminal</span>Terminal content</nve-workspace-panel></nve-workspace>`
};

/**
 * @summary Constrained workspace with panel minimum heights. Keep views usable when the available space is too small, and join tabs to reduce overflow.
 */
export const Overflow = {
  render: () =>
    html`<nve-workspace rearrangeable resizable style="height:180px" value='{"version":1,"root":{"type":"split","axis":"vertical","weights":[1,1],"children":[{"type":"pane","panels":["top"],"active":"top"},{"type":"pane","panels":["bottom"],"active":"bottom"}]},"closed":[]}'><nve-workspace-panel id="top" min-height="110"><span slot="label">Top</span>Top content</nve-workspace-panel><nve-workspace-panel id="bottom" min-height="110"><span slot="label">Bottom</span>Bottom content</nve-workspace-panel></nve-workspace>`
};

/**
 * @summary Scrollable tab strip for views in a narrow workspace. Use horizontal scrolling or keyboard selection to reach tabs beyond the visible area.
 */
export const ScrollableTabs = {
  render: () =>
    html`<nve-workspace rearrangeable closable style="width:260px;height:200px">${Array.from({ length: 8 }, (_, index) => html`<nve-workspace-panel id=${`view-${index}`}><strong slot="label">View ${index + 1}</strong>Content ${index + 1}</nve-workspace-panel>`)}</nve-workspace>`
};

/**
 * @summary Saved arrangement with a closed preview pane. Open and close the preview with invoker commands to see neighboring panes resize without losing its position or edited content.
 */
export const ClosedView = {
  render: () =>
    html`<div nve-layout="column gap:md">
      <div nve-layout="row gap:sm">
        <nve-button command="--open" commandfor="restorable-preview">Open preview</nve-button>
        <nve-button command="--close" commandfor="restorable-preview">Close preview</nve-button>
      </div>
      <nve-workspace closable resizable style="height:250px" value='{"version":1,"root":{"type":"split","axis":"horizontal","weights":[1,1,1],"children":[{"type":"pane","panels":["retained-editor"],"active":"retained-editor"},{"type":"pane","panels":["restorable-preview"],"active":"restorable-preview"},{"type":"pane","panels":["retained-terminal"],"active":"retained-terminal"}]},"closed":["restorable-preview"]}'>
        <nve-workspace-panel id="retained-editor"><span slot="label">Editor</span>Editor content</nve-workspace-panel>
        <nve-workspace-panel id="restorable-preview"><span slot="label">Preview</span><input aria-label="Retained preview content" value="Edit, close, and reopen me"></nve-workspace-panel>
        <nve-workspace-panel id="retained-terminal"><span slot="label">Terminal</span>Terminal content</nve-workspace-panel>
      </nve-workspace>
    </div>`
};

/**
 * @summary Restorable workspace arrangement with tabs, pane proportions, and closed views. Save the value, change the layout, then restore it without recreating application content.
 */
export const SaveRestore = {
  render: () => html`<div nve-layout="column gap:md">
    <div nve-layout="row gap:sm">
      <nve-button id="save-arrangement">Save layout</nve-button>
      <nve-button id="restore-arrangement" disabled>Restore layout</nve-button>
      <nve-button id="reset-arrangement">Reset layout</nve-button>
    </div>
    <nve-workspace id="saved-arrangement" rearrangeable closable resizable style="height:300px" value='{"version":1,"root":{"type":"split","axis":"horizontal","weights":[2,1],"children":[{"type":"pane","panels":["saved-editor","saved-notes"],"active":"saved-editor"},{"type":"pane","panels":["saved-preview"],"active":"saved-preview"}]},"closed":[]}'>
      <nve-workspace-panel id="saved-editor"><span slot="label">Editor</span><textarea aria-label="Retained editor content">Edit me before restoring the layout</textarea></nve-workspace-panel>
      <nve-workspace-panel id="saved-notes"><span slot="label">Notes</span>Notes content</nve-workspace-panel>
      <nve-workspace-panel id="saved-preview"><span slot="label">Preview</span>Preview content</nve-workspace-panel>
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
