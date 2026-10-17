// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/dropdown-group/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/textarea/define.js';
import '@nvidia-elements/core/workspace/define.js';

export default { title: 'Elements/Workspace', component: 'nve-workspace' };

/**
 * @summary Arrange panels in nested groups while retaining application content. Drag panel headers or tabs to move panels, group handles to move tabs together, and separators to resize.
 */
export const Default = {
  render: () => html`
    <nve-workspace
      groupable
      rearrangeable
      resizable
      style="height:600px"
      value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[1,4],"children":[{"type":"group","panels":["workspace-outline"],"active":"workspace-outline"},{"type":"split","axis":"vertical","weights":[3,2],"children":[{"type":"split","axis":"horizontal","weights":[3,2],"children":[{"type":"group","panels":["workspace-editor"],"active":"workspace-editor"},{"type":"group","panels":["workspace-preview"],"active":"workspace-preview"}]},{"type":"group","panels":["workspace-notes","workspace-activity","workspace-tasks"],"active":"workspace-notes"}]}]}}'>
      <nve-workspace-panel id="workspace-outline">
        <nve-workspace-panel-header>Outline</nve-workspace-panel-header>
        <nve-workspace-panel-content>Outline content</nve-workspace-panel-content>
      </nve-workspace-panel>
      <nve-workspace-panel id="workspace-editor">
        <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
        <nve-workspace-panel-content>
          <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
        </nve-workspace-panel-content>
        <nve-workspace-panel-footer>Ready</nve-workspace-panel-footer>
      </nve-workspace-panel>
      <nve-workspace-panel id="workspace-preview">
        <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
        <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
      </nve-workspace-panel>
      <nve-workspace-panel id="workspace-notes">
        <nve-workspace-panel-header>Notes</nve-workspace-panel-header>
        <nve-workspace-panel-content>Notes content</nve-workspace-panel-content>
      </nve-workspace-panel>
      <nve-workspace-panel id="workspace-activity">
        <nve-workspace-panel-header>Activity</nve-workspace-panel-header>
        <nve-workspace-panel-content>Activity content</nve-workspace-panel-content>
      </nve-workspace-panel>
      <nve-workspace-panel id="workspace-tasks">
        <nve-workspace-panel-header>Tasks</nve-workspace-panel-header>
        <nve-workspace-panel-content>Tasks content</nve-workspace-panel-content>
      </nve-workspace-panel>
    </nve-workspace>
  `
};

/**
 * @summary Organize panels as tabs with headers, content, and optional footers. Switching tabs retains edited content.
 */
export const Tabs = {
  render: () => html`
    <nve-workspace style="height:360px">
      <nve-workspace-panel id="first">
        <nve-workspace-panel-header>
          <nve-icon slot="prefix" name="code"></nve-icon>
          Editor
        </nve-workspace-panel-header>
        <nve-workspace-panel-content>
          <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
        </nve-workspace-panel-content>
        <nve-workspace-panel-footer>Ready</nve-workspace-panel-footer>
      </nve-workspace-panel>
      <nve-workspace-panel id="second">
        <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
        <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
      </nve-workspace-panel>
    </nve-workspace>
  `
};

/**
 * @summary Resize panels within a fixed arrangement.
 */
export const Resizable = {
  render: () => html`
    <nve-workspace
      resizable
      value='{"version":1,"root":{"type":"split","axis":"horizontal","weights":[1,1,1],"children":[{"type":"group","panels":["editor"],"active":"editor"},{"type":"group","panels":["preview"],"active":"preview"},{"type":"group","panels":["terminal"],"active":"terminal"}]},"closed":[]}'
      style="height:420px">
      <nve-workspace-panel id="editor">
        <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
        <nve-workspace-panel-content>
          <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
        </nve-workspace-panel-content>
      </nve-workspace-panel>
      <nve-workspace-panel id="preview">
        <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
        <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
      </nve-workspace-panel>
      <nve-workspace-panel id="terminal">
        <nve-workspace-panel-header>Terminal</nve-workspace-panel-header>
        <nve-workspace-panel-content>Terminal content</nve-workspace-panel-content>
      </nve-workspace-panel>
    </nve-workspace>
  `
};

/**
 * @summary Rearrange panels while keeping tabbed panels together.
 */
export const Rearrangeable = {
  render: () => html`
    <nve-workspace
      rearrangeable
      resizable
      style="height:420px"
      value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[2,1],"children":[{"type":"group","panels":["editor","terminal"],"active":"editor"},{"type":"group","panels":["preview"],"active":"preview"}]}}'>
      <nve-workspace-panel id="editor">
        <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
        <nve-workspace-panel-content>
          <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
        </nve-workspace-panel-content>
      </nve-workspace-panel>
      <nve-workspace-panel id="preview">
        <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
        <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
      </nve-workspace-panel>
      <nve-workspace-panel id="terminal">
        <nve-workspace-panel-header>Terminal</nve-workspace-panel-header>
        <nve-workspace-panel-content>Terminal content</nve-workspace-panel-content>
      </nve-workspace-panel>
    </nve-workspace>
  `
};

/**
 * @summary Group panels as tabs or separate them into new splits.
 */
export const Groupable = {
  render: () => html`
    <div id="regroup-example" nve-layout="column gap:md">
      <nve-button>Reset layout</nve-button>
      <nve-workspace
        rearrangeable
        groupable
        resizable
        style="height:420px"
        value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[2,1],"children":[{"type":"group","panels":["group-editor","group-notes"],"active":"group-editor"},{"type":"group","panels":["group-preview"],"active":"group-preview"}]}}'>
        <nve-workspace-panel id="group-editor">
          <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
          <nve-workspace-panel-content>
            <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
          </nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="group-notes">
          <nve-workspace-panel-header>Notes</nve-workspace-panel-header>
          <nve-workspace-panel-content>Notes content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="group-preview">
          <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
          <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
        </nve-workspace-panel>
      </nve-workspace>
      <script type="module">
        const example = document.querySelector('#regroup-example');
        const workspace = example.querySelector('nve-workspace');
        const initialValue = workspace.getAttribute('value');
        example.querySelector('nve-button').addEventListener('click', () => {
          workspace.value = initialValue;
        });
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
      ${['inset', 'flat', 'full'].map(
        container => html`
          <nve-workspace
            container=${container}
            resizable
            style="height:220px"
            value=${JSON.stringify({
              version: 1,
              closed: [],
              root: {
                type: 'split',
                axis: 'horizontal',
                weights: [1, 1],
                children: [
                  { type: 'group', panels: [`container-${container}`], active: `container-${container}` },
                  {
                    type: 'group',
                    panels: [`container-${container}-preview`],
                    active: `container-${container}-preview`
                  }
                ]
              }
            })}>
            <nve-workspace-panel id=${`container-${container}`}>
              <nve-workspace-panel-header>Editor (${container})</nve-workspace-panel-header>
              <nve-workspace-panel-content><nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea></nve-workspace-panel-content>
              <nve-workspace-panel-footer>Ready</nve-workspace-panel-footer>
            </nve-workspace-panel>
            <nve-workspace-panel id=${`container-${container}-preview`}>
              <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
              <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
            </nve-workspace-panel>
          </nve-workspace>
        `
      )}
    </div>
  `
};

/**
 * @summary Customize header spacing, control sizes, and panel corners for a compact workspace.
 * @tags theme
 */
export const CustomHeaders = {
  render: () => html`
    <div id="compact-example" nve-layout="column gap:md">
      <nve-button>Reset layout</nve-button>
      <style>
        #condensed-workspace > nve-workspace-panel {
          --box-shadow: none;
        }
        #condensed-workspace::part(close-button),
        #condensed-workspace nve-icon-button {
          --width: var(--nve-ref-size-600);
          --height: var(--nve-ref-size-600);
        }
        #condensed-workspace nve-workspace-panel-header {
          --min-height: var(--nve-ref-size-800);
          --padding: var(--nve-ref-size-100) var(--nve-ref-size-100) var(--nve-ref-size-100) var(--nve-ref-size-200);
          --suffix-padding: 0 var(--nve-ref-size-100);
        }
      </style>
      <nve-workspace
        id="condensed-workspace"
        rearrangeable
        groupable
        closable
        resizable
        style="--gap:0;--border-radius:0;--close-button-inset:var(--nve-ref-size-100);height:300px"
        value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[2,1],"children":[{"type":"group","panels":["condensed-editor","condensed-notes"],"active":"condensed-editor"},{"type":"group","panels":["condensed-preview"],"active":"condensed-preview"}]}}'>
        <nve-workspace-panel id="condensed-editor">
          <nve-workspace-panel-header>
            Editor
            <nve-icon-button
              slot="suffix"
              icon-name="maximize"
              container="flat"
              size="sm"
              command="--toggle-fullscreen"
              commandfor="condensed-editor"
              aria-label="Fullscreen"></nve-icon-button>
          </nve-workspace-panel-header>
          <nve-workspace-panel-content>
            <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
          </nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="condensed-notes">
          <nve-workspace-panel-header>Notes</nve-workspace-panel-header>
          <nve-workspace-panel-content>Notes content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="condensed-preview">
          <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
          <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
        </nve-workspace-panel>
      </nve-workspace>
      <script type="module">
        const example = document.querySelector('#compact-example');
        const workspace = example.querySelector('nve-workspace');
        const initialValue = workspace.getAttribute('value');
        example.querySelector('nve-button').addEventListener('click', () => {
          workspace.value = initialValue;
        });
      </script>
    </div>
  `
};

/**
 * @summary Close and reopen panels while retaining their positions and edited content.
 */
export const Closable = {
  render: () => html`
    <div id="open-close-example" nve-layout="column gap:md">
      <div nve-layout="row gap:sm">
        <nve-button command="--open" commandfor="retained-editor">Open editor</nve-button>
        <nve-button command="--close" commandfor="retained-editor">Close editor</nve-button>
        <nve-button id="reset-open-close">Reset layout</nve-button>
      </div>
      <nve-workspace
        closable
        resizable
        style="height:360px"
        value='{"version":1,"root":{"type":"split","axis":"horizontal","weights":[1,1,1],"children":[{"type":"group","panels":["retained-editor"],"active":"retained-editor"},{"type":"group","panels":["restorable-preview"],"active":"restorable-preview"},{"type":"group","panels":["retained-terminal"],"active":"retained-terminal"}]},"closed":["retained-editor"]}'>
        <nve-workspace-panel id="retained-editor">
          <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
          <nve-workspace-panel-content>
            <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
          </nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="restorable-preview">
          <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
          <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="retained-terminal">
          <nve-workspace-panel-header>Terminal</nve-workspace-panel-header>
          <nve-workspace-panel-content>Terminal content</nve-workspace-panel-content>
        </nve-workspace-panel>
      </nve-workspace>
      <script type="module">
        const example = document.querySelector('#open-close-example');
        const workspace = example.querySelector('nve-workspace');
        const initialValue = workspace.getAttribute('value');
        example.querySelector('#reset-open-close').addEventListener('click', () => {
          workspace.value = initialValue;
        });
      </script>
    </div>
  `
};

/**
 * @summary Save and restore groups, split proportions, and closed panels without recreating application content.
 */
export const SaveRestore = {
  render: () => html`
    <div nve-layout="column gap:md">
      <div nve-layout="row gap:sm">
        <nve-button id="save-arrangement">Save layout</nve-button>
        <nve-button id="restore-arrangement" disabled>Restore layout</nve-button>
        <nve-button id="reset-arrangement">Reset layout</nve-button>
      </div>
      <nve-workspace
        id="saved-arrangement"
        groupable
        rearrangeable
        closable
        resizable
        style="height:420px"
        value='{"version":1,"root":{"type":"split","axis":"horizontal","weights":[2,1],"children":[{"type":"group","panels":["saved-editor","saved-notes"],"active":"saved-editor"},{"type":"group","panels":["saved-preview"],"active":"saved-preview"}]},"closed":[]}'>
        <nve-workspace-panel id="saved-editor">
          <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
          <nve-workspace-panel-content>
            <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
          </nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="saved-notes">
          <nve-workspace-panel-header>Notes</nve-workspace-panel-header>
          <nve-workspace-panel-content>Notes content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="saved-preview">
          <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
          <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
        </nve-workspace-panel>
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
          workspace.animateTo(savedValue);
        });
        reset.addEventListener('click', () => {
          workspace.animateTo(initialValue);
        });
      </script>
    </div>
  `
};

/**
 * @summary Add application menus to the active panel in each group. Use invoker commands to move, split, close, or reopen panels and toggle group fullscreen.
 */
// eslint-disable-next-line local-typescript/example-template-size -- Keep the complete menu composition readable without compressing its markup.
export const PanelActions = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-button id="a-reopen" popovertarget="a-open" disabled>Reopen</nve-button>
      <nve-workspace id="a-demo" groupable rearrangeable closable resizable style="height:360px">
        ${['Editor', 'Notes', 'Preview'].map(
          title => html`
            <nve-workspace-panel id=${`a-${title.toLowerCase()}`}>
              <nve-workspace-panel-header>
                ${title}
                <nve-icon-button
                  slot="suffix"
                  icon-name="more-actions"
                  container="flat"
                  aria-label=${`${title} actions`}
                  value=${`a-${title.toLowerCase()}`}
                  popovertarget="a-menu"></nve-icon-button>
              </nve-workspace-panel-header>
              <nve-workspace-panel-content>
                ${title === 'Editor' ? html`<nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>` : `${title} content`}
              </nve-workspace-panel-content>
            </nve-workspace-panel>
          `
        )}
        <nve-dropdown-group>
          <nve-dropdown id="a-menu">
            <nve-menu>
              <nve-menu-item command="--toggle-fullscreen">Fullscreen</nve-menu-item>
              ${[
                ['a-move', 'Move to'],
                ['a-split', 'Split']
              ].map(
                ([id, label]) => html`
                  <nve-menu-item popovertarget=${id}>
                    ${label}
                    <nve-icon name="caret" direction="right" size="sm" slot="suffix"></nve-icon>
                  </nve-menu-item>
                `
              )}
              <nve-menu-item command="--close">Close</nve-menu-item>
            </nve-menu>
          </nve-dropdown>
          ${[
            ['a-move', '--place'],
            ['a-open', '--open']
          ].map(
            ([id, command]) => html`
              <nve-dropdown id=${id} position=${id === 'a-move' ? 'right' : 'bottom'}>
                <nve-menu>
                  ${['Editor', 'Notes', 'Preview'].map(
                    title => html`
                      <nve-menu-item command=${command} data-target=${`a-${title.toLowerCase()}`}>${title}</nve-menu-item>
                    `
                  )}
                </nve-menu>
              </nve-dropdown>
            `
          )}
          <nve-dropdown id="a-split" position="right">
            <nve-menu>
              ${['Left', 'Right', 'Above', 'Below'].map(
                (label, index) => html`
                  <nve-menu-item command="--place" data-side=${['left', 'right', 'top', 'bottom'][index]}>${label}</nve-menu-item>
                `
              )}
            </nve-menu>
          </nve-dropdown>
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
          const labels = new Map(
            [...workspace.querySelectorAll(':scope > nve-workspace-panel')].map(panel => [panel.id, panel.firstElementChild.textContent])
          );
          const known = id => labels.has(id);
          const groups = getGroups(root).map(group => group.panels.filter(id => known(id) && !closed.includes(id)));
          const current = groups.find(ids => ids.includes(panelId));
          const target = current?.find(id => id !== panelId);
          for (const item of group.querySelectorAll('[command]')) {
            const id = item.dataset.target;
            item.commandForElement = workspace;
            item.value = item.command === '--open' ? id : panelId;
            if (item.dataset.side) item.placement = { operation: 'split', target, position: item.dataset.side };
            if (id) {
              const members = groups.find(ids => ids[0] === id && ids !== current);
              const visible = item.command === '--open' ? known(item.value) && closed.includes(item.value) : !!members;
              item.style.display = visible ? '' : 'none';
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
          reopen.disabled = !closed.some(known);
        }
        group.addEventListener(
          'beforetoggle',
          event => {
            if (event.newState !== 'open') return;
            if (event.target.id === 'a-menu') panelId = event.source?.value;
            refresh();
          },
          true
        );
        workspace.addEventListener('commandavailabilitychange', refresh);
        workspace.addEventListener('command', () => group.close());
      </script>
    </div>
  `
};

/**
 * @summary The workspace scrolls when panel minimum heights exceed the available space. Increasing its height restores resizing.
 * @tags test-case
 */
export const ConstrainedSpace = {
  render: () => html`
    <div id="constrained-example" nve-layout="column gap:md">
      <nve-range>
        <label>
          Workspace height:
          <output for="workspace-height">180</output>
          px
        </label>
        <input id="workspace-height" type="range" min="180" max="420" value="180" />
      </nve-range>
      <nve-button>Reset layout</nve-button>
      <nve-workspace
        groupable
        rearrangeable
        resizable
        style="height:180px"
        value='{"version":1,"root":{"type":"split","axis":"vertical","weights":[1,1],"children":[{"type":"group","panels":["top"],"active":"top"},{"type":"group","panels":["bottom"],"active":"bottom"}]},"closed":[]}'>
        <nve-workspace-panel id="top" min-height="110">
          <nve-workspace-panel-header>Top</nve-workspace-panel-header>
          <nve-workspace-panel-content>Top content</nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="bottom" min-height="110">
          <nve-workspace-panel-header>Bottom</nve-workspace-panel-header>
          <nve-workspace-panel-content>Bottom content</nve-workspace-panel-content>
        </nve-workspace-panel>
      </nve-workspace>
      <script type="module">
        const example = document.querySelector('#constrained-example');
        const workspace = example.querySelector('nve-workspace');
        const range = example.querySelector('input');
        const output = example.querySelector('output');
        const initialValue = workspace.getAttribute('value');
        const updateHeight = () => {
          workspace.style.height = range.value + 'px';
          output.value = range.value;
        };
        range.addEventListener('input', updateHeight);
        example.querySelector('nve-button').addEventListener('click', () => {
          workspace.value = initialValue;
          range.value = '180';
          updateHeight();
        });
      </script>
    </div>
  `
};

/**
 * @summary Keep tab titles readable in a narrow group with scrolling and keyboard selection.
 */
export const TabOverflow = {
  render: () => html`
    <nve-workspace style="width:260px;height:260px">
      ${[
        'Editor',
        'Preview',
        'Terminal',
        'Notes',
        'Project outline',
        'Recent activity',
        'Task history',
        'Search results'
      ].map(
        (title, index) => html`
          <nve-workspace-panel id=${`view-${index}`}>
            <nve-workspace-panel-header>${title}</nve-workspace-panel-header>
            <nve-workspace-panel-content>
              ${title === 'Editor' ? html`<nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>` : `${title} content`}
            </nve-workspace-panel-content>
          </nve-workspace-panel>
        `
      )}
    </nve-workspace>
  `
};

/**
 * @summary Adjust spacing between groups with --gap. Zero joins the group frames.
 */
export const Gap = {
  render: () => html`
    <div id="workspace-gap-example" nve-layout="column gap:md">
      <nve-range>
        <label>
          Gap:
          <output for="workspace-gap-range">0</output>
          px
        </label>
        <input id="workspace-gap-range" type="range" min="0" max="24" value="0" />
      </nve-range>
      <nve-workspace
        container="full"
        resizable
        style="--gap:0px;height:360px"
        value='{"version":1,"closed":[],"root":{"type":"split","axis":"horizontal","weights":[1,1],"children":[{"type":"group","panels":["gap-editor"],"active":"gap-editor"},{"type":"group","panels":["gap-preview"],"active":"gap-preview"}]}}'>
        <nve-workspace-panel id="gap-editor">
          <nve-workspace-panel-header>Editor</nve-workspace-panel-header>
          <nve-workspace-panel-content>
            <nve-textarea><textarea aria-label="Editor">Editor content</textarea></nve-textarea>
          </nve-workspace-panel-content>
        </nve-workspace-panel>
        <nve-workspace-panel id="gap-preview">
          <nve-workspace-panel-header>Preview</nve-workspace-panel-header>
          <nve-workspace-panel-content>Preview content</nve-workspace-panel-content>
        </nve-workspace-panel>
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
    </div>
  `
};
