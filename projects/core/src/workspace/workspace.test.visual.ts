// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { visualRunner } from '@internals/vite';

describe('workspace visual', () => {
  for (const theme of ['', 'dark']) {
    it(`renders ${theme || 'light'} arrangements`, async () => {
      const report = await visualRunner.render(
        `workspace${theme ? '.dark' : ''}`,
        /* html */ `
        <script type="module">
          import '@nvidia-elements/core/workspace/define.js';
          import '@nvidia-elements/core/icon-button/define.js';
          document.documentElement.setAttribute('nve-theme', '${theme}');
        </script>
        <div nve-layout="row gap:md pad:sm align:wrap" style="width:1120px">
          ${[
            { name: 'Default', container: '', radius: '' },
            { name: 'Custom', container: '', radius: '--border-radius:var(--nve-ref-border-radius-xs)' },
            { name: 'Flat', container: 'flat', radius: '' },
            { name: 'Full', container: 'full', radius: '' }
          ]
            .map(
              ({ name, container, radius }) => `
            <nve-workspace ${container ? `container="${container}"` : ''} rearrangeable resizable closable style="width:540px;height:320px;${radius};${container === 'full' ? '--gap:0' : ''}" value='${JSON.stringify(
              {
                version: 1,
                closed: [],
                root: {
                  type: 'split',
                  axis: 'horizontal',
                  weights: [1, 1, 1],
                  children: [
                    { type: 'group', panels: [`${name}-first`, `${name}-second`], active: `${name}-first` },
                    {
                      type: 'split',
                      axis: 'vertical',
                      weights: [3, 2],
                      children: [
                        { type: 'group', panels: [`${name}-third`], active: `${name}-third` },
                        { type: 'group', panels: [`${name}-fourth`], active: `${name}-fourth` }
                      ]
                    },
                    { type: 'group', panels: [`${name}-fifth`], active: `${name}-fifth` }
                  ]
                }
              }
            )}'>
              ${['first', 'second', 'third', 'fourth', 'fifth']
                .map(
                  panel => `
                <nve-workspace-panel id="${name}-${panel}" ${name === 'Custom' && panel === 'first' ? 'style="--border:var(--nve-ref-border-width-md) solid var(--nve-ref-border-color-emphasis)"' : ''}>
                  <nve-workspace-panel-header>•︎•︎•︎${panel === 'third' ? '<nve-icon-button slot="suffix" icon-name="more-actions" aria-label="Actions"></nve-icon-button>' : ''}</nve-workspace-panel-header>
                  <nve-workspace-panel-content>•︎•︎•︎</nve-workspace-panel-content>
                  ${panel === 'first' ? '<nve-workspace-panel-footer>•︎•︎•︎</nve-workspace-panel-footer>' : ''}
                </nve-workspace-panel>
              `
                )
                .join('')}
            </nve-workspace>
          `
            )
            .join('')}
        </div>
        `
      );
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });

    it(`renders ${theme || 'light'} fullscreen controls`, async () => {
      const report = await visualRunner.render(
        `workspace.fullscreen${theme ? '.dark' : ''}`,
        /* html */ `
        <script type="module">
          import '@nvidia-elements/core/workspace/define.js';
          import '@nvidia-elements/core/icon-button/define.js';
          document.documentElement.setAttribute('nve-theme', '${theme}');
        </script>
        <div nve-layout="column gap:md pad:sm" style="width:500px">
          ${[false, true]
            .map(
              enabled => `
            <nve-workspace ${enabled ? 'fullscreenable' : ''} closable rearrangeable style="height:220px" value='{"version":1,"closed":[],"root":{"type":"split","axis":"vertical","weights":[1,1],"children":[{"type":"group","panels":["${enabled}-a","${enabled}-b"],"active":"${enabled}-a"},{"type":"group","panels":["${enabled}-c"],"active":"${enabled}-c"}]}}'>
              ${['a', 'b', 'c']
                .map(
                  id => `
                <nve-workspace-panel id="${enabled}-${id}">
                  <nve-workspace-panel-header>•︎•︎•︎${id === 'a' ? '<nve-icon-button slot="suffix" icon-name="more-actions" container="flat" size="sm" aria-label="Actions"></nve-icon-button>' : ''}</nve-workspace-panel-header>
                  <nve-workspace-panel-content>•︎•︎•︎</nve-workspace-panel-content>
                </nve-workspace-panel>
              `
                )
                .join('')}
            </nve-workspace>
          `
            )
            .join('')}
        </div>
        `,
        {
          waitFor: wait =>
            wait(() => {
              const workspace = document.querySelector('nve-workspace[fullscreenable]');
              const groups = workspace?.shadowRoot?.querySelectorAll('.group-chrome');
              return (
                groups?.length === 2 &&
                [...groups].every(group => {
                  const action = group.querySelector('.group-actions');
                  return (
                    action &&
                    Math.abs(action.getBoundingClientRect().right - group.getBoundingClientRect().right) < 0.01
                  );
                }) &&
                !!workspace?.shadowRoot?.querySelector('.group-actions[data-authored-suffix]')
              );
            })
        }
      );
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });
  }
});
