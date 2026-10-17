// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { I18nStrings } from '@nvidia-elements/core/internal';
import type { WorkspaceChrome } from './workspace-chrome.controller.js';
import type { WorkspaceNode } from './workspace-layout.utils.js';
import type { WorkspacePanel } from './workspace-panel.js';
import type { WorkspacePlacedGroup } from './workspace-placement.utils.js';
import type { WorkspaceRect } from './workspace-rearrange.controller.js';
import { allocatedTabWidth, presentedTabActive, tabStripGripWidth } from './workspace-tabs.utils.js';

export interface WorkspaceTabGroup {
  key: string;
  panels: WorkspacePanel[];
  rect: WorkspaceRect;
  active: string;
  gripWidth: number;
}

/** Binds supplied panels and committed header ownership to the computed allocation. */
export function createTabGroups(input: {
  groups: WorkspacePlacedGroup[];
  panels: WorkspacePanel[];
  root: WorkspaceNode | null;
  closed: string[];
  source: string[];
  gripWidth: number;
}): WorkspaceTabGroup[] {
  const visible = input.panels.map(panel => panel.id).filter(id => !input.closed.includes(id));
  return input.groups.map(({ key, group, rect }) => ({
    key,
    rect,
    active: group.active,
    gripWidth: tabStripGripWidth({
      root: input.root,
      members: group.panels,
      source: input.source,
      visible,
      width: input.gripWidth
    }),
    panels: group.panels.flatMap(id => input.panels.filter(panel => panel.id === id))
  }));
}

interface TabGroupPresentation {
  groups: { group: WorkspaceTabGroup; scrollLeft: number }[];
  extent: { width: number; height: number };
  container?: 'inset' | 'flat' | 'full';
  chrome: WorkspaceChrome;
  closable: boolean;
  animate: boolean;
  source: string[];
}

/** Applies already-computed group and header presentation after browser reads are complete. */
export function configureTabGroups(input: TabGroupPresentation) {
  input.groups.forEach(({ group, scrollLeft }) => configureTabGroup(input, group, scrollLeft));
}

function configureTabGroup(input: TabGroupPresentation, group: WorkspaceTabGroup, scrollLeft: number) {
  const { headerHeight, actionWidth } = input.chrome;
  const tabWidth = allocatedTabWidth(group, input.chrome);
  const suffixWidth = input.chrome.panels?.[group.active]?.suffixWidth ?? 0;
  group.panels.forEach((panel, index) => {
    if (input.source.includes(panel.id)) return;
    if (input.container && panel.getAttribute('container') !== input.container)
      panel.setAttribute('container', input.container);
    else if (!input.container) panel.removeAttribute('container');
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-hidden', String(group.active !== panel.id));
    const rect = group.rect;
    Object.assign(panel.style, {
      left: `${rect.x}px`,
      top: `${rect.y}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
    panel.style.setProperty(
      '--_workspace-border-right',
      input.chrome.gap === 0 && rect.x + rect.width < input.extent.width - 0.000001 ? 'none' : 'var(--border)'
    );
    panel.style.setProperty(
      '--_workspace-border-bottom',
      input.chrome.gap === 0 && rect.y + rect.height < input.extent.height - 0.000001 ? 'none' : 'var(--border)'
    );
    panel._configure({
      selected: group.active === panel.id,
      offset: group.gripWidth + index * tabWidth,
      scrollLeft,
      animate: input.animate,
      tabWidth: Math.max(0, tabWidth - actionWidth * Number(input.closable)),
      headerHeight,
      clipLeft: group.gripWidth,
      clipWidth: Math.max(0, rect.width - group.gripWidth - suffixWidth)
    });
  });
}

interface TabStripPresentation {
  group: WorkspaceTabGroup;
  identity: string;
  chrome: WorkspaceChrome;
  width: number;
  source: string[];
  reserved: boolean;
  rearrangeable: boolean;
  closable: boolean;
  strings: Partial<I18nStrings>;
  label(id: string): string;
  scrollChanged(): void;
  select(id: string, event?: Event): void;
  hover(id: string, hovered: boolean): void;
  close(id: string): void;
  suffixWidth: number;
}

/** Renders one stable native-scroll strip from the current tab allocation. */
export function renderTabStrip(input: TabStripPresentation) {
  const { group, width, chrome, source, rearrangeable, closable, strings } = input;
  const { headerHeight } = chrome;
  const carried = input.reserved && group.panels.every(panel => source.includes(panel.id));
  return html`<div class="group-chrome" style=${`left:${group.rect.x}px;top:${group.rect.y}px;width:${group.rect.width}px;height:${group.rect.height}px`}><div class="tabs" ?data-carried-reservation=${carried} ?inert=${carried} aria-hidden=${ifDefined(carried ? 'true' : undefined)} style=${`height:${headerHeight}px`}>
    ${rearrangeable && group.gripWidth > 0 ? html`<nve-drag-handle part="drag-handle" data-drag-group=${group.panels[0]?.id ?? ''} draggable="false" aria-label=${ifDefined(strings.move)} @click=${(event: Event) => event.preventDefault()}></nve-drag-handle>` : null}
    <div class="tablist" style=${`margin-right:${input.suffixWidth}px`} data-group=${input.identity} @scroll=${input.scrollChanged}>
      <nve-tabs part="tabs" class="tab-track" ?borderless=${group.panels.length === 1} @nve-key-change=${(
        event: CustomEvent<{ activeItem: HTMLElement }>
      ) => {
        const id = event.detail.activeItem.dataset.panel;
        if (id) input.select(id, event);
      }} style=${`width:${group.panels.length * width}px`}>${repeat(
        group.panels,
        panel => panel.id,
        (panel, index) =>
          renderTab(panel, {
            active: group.active,
            carried: source.includes(panel.id),
            left: index * width,
            width,
            height: headerHeight,
            select: input.select,
            hover: input.hover,
            closable,
            closeLabel: closable ? `${strings.close} ${input.label(panel.id)}` : '',
            close: input.close
          })
      )}</nve-tabs>
    </div>
  </div></div>`;
}

function renderTab(
  panel: WorkspacePanel,
  input: {
    active: string;
    carried: boolean;
    left: number;
    width: number;
    height: number;
    select(id: string, event?: Event): void;
    hover(id: string, hovered: boolean): void;
    closable: boolean;
    closeLabel: string;
    close(id: string): void;
  }
) {
  return html`<nve-tabs-item-group part="tabs-item-group" class="tab-entry" ?data-carried-tab=${input.carried} ?inert=${input.carried} aria-hidden=${ifDefined(input.carried ? 'true' : undefined)} style=${styleMap({ left: `${input.left}px`, width: `${input.width}px`, '--height': `${input.height}px` })}>
    <nve-tabs-item part="tab" data-panel=${panel.id} ?selected=${input.active === panel.id} aria-label=${panel.id} tabindex=${input.active === panel.id ? 0 : -1} @pointerenter=${() => input.hover(panel.id, true)} @pointerleave=${() => input.hover(panel.id, false)} @click=${(event: Event) => input.select(panel.id, event)}>${panel.querySelector(':scope > nve-workspace-panel-header') ? null : panel.id}</nve-tabs-item>
    ${input.closable ? html`<nve-icon-button slot="suffix" part="close-button" icon-name="cancel" container="flat" size="sm" tabindex=${input.active === panel.id ? 0 : -1} data-close=${panel.id} aria-label=${input.closeLabel} @click=${() => input.close(panel.id)}></nve-icon-button>` : null}
  </nve-tabs-item-group>`;
}

/** Reads the supplied noninteractive label without relocating its nodes. */
export function panelLabel(panels: WorkspacePanel[], id: string) {
  const panel = panels.find(item => item.id === id);
  const header = panel?.querySelector(':scope > nve-workspace-panel-header');
  return (
    [...(header?.childNodes ?? [])]
      .filter(node => !(node instanceof Element) || !node.hasAttribute('slot'))
      .map(node => node.textContent)
      .join(' ')
      .trim() || id
  );
}

export function renderChromeProbe(input: { rearrangeable: boolean; closable: boolean }) {
  return html`<div class="chrome" data-chrome inert aria-hidden="true"><div class="gap-probe"></div><div class="chrome-header"><nve-tabs part="tabs"><nve-tabs-item-group part="tabs-item-group" class="tab-entry tab-probe"><nve-tabs-item part="tab" tabindex="-1">&nbsp;</nve-tabs-item>${input.closable ? html`<nve-icon-button slot="suffix" part="close-button" icon-name="cancel" container="flat" size="sm" tabindex="-1"></nve-icon-button>` : null}</nve-tabs-item-group></nve-tabs>${input.rearrangeable ? html`<nve-drag-handle part="drag-handle" draggable="false"></nve-drag-handle>` : null}</div></div>`;
}

/** Keeps the surviving recipient active while carrying one of its panels. */
export function presentedTabGroups(groups: WorkspaceTabGroup[], root: WorkspaceNode | null, source?: string[]) {
  return source
    ? groups.map(group => ({
        ...group,
        active: presentedTabActive({ root, source, members: group.panels.map(panel => panel.id), active: group.active })
      }))
    : groups;
}
