// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveControllerHost } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import type { I18nStrings } from '@nvidia-elements/core/internal';
import type { WorkspaceChrome } from './workspace-chrome.controller.js';
import type { WorkspaceNode } from './workspace-layout.utils.js';
import type { WorkspacePanel } from './workspace-panel.js';
import type { WorkspacePlacedGroup } from './workspace-placement.utils.js';
import type { WorkspaceRect } from './workspace-rearrange.controller.js';
import { presentedTabActive, tabStripGripWidth } from './workspace-tabs.utils.js';

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
  source: string[];
  gripWidth: number;
}): WorkspaceTabGroup[] {
  return input.groups.map(({ key, pane, rect }) => ({
    key,
    rect,
    active: pane.active,
    gripWidth: tabStripGripWidth({
      root: input.root,
      members: pane.panels,
      source: input.source,
      width: input.gripWidth
    }),
    panels: pane.panels.flatMap(id => input.panels.filter(panel => panel.id === id))
  }));
}

interface TabStripPresentation {
  group: WorkspaceTabGroup;
  identity: string;
  chrome: WorkspaceChrome;
  width: number;
  scroll: number;
  source: string[];
  reserved: boolean;
  rearrangeable: boolean;
  closable: boolean;
  strings: Partial<I18nStrings>;
  label(id: string): string;
  scrollChanged(): void;
  select(id: string): void;
  close(id: string): void;
  actions(id: string, trigger: HTMLElement): void;
}

/** Renders one stable native-scroll strip from the current tab allocation. */
export function renderTabStrip(input: TabStripPresentation) {
  const { group, width, scroll, chrome, source, rearrangeable, closable, strings } = input;
  const { headerHeight, actionWidth } = chrome;
  const actions = Number(rearrangeable) + Number(closable);
  const carried = input.reserved && group.panels.every(panel => source.includes(panel.id));
  return html`<div class="tabs" ?data-carried-reservation=${carried} ?inert=${carried} aria-hidden=${ifDefined(carried ? 'true' : undefined)} style=${`left:${group.rect.x}px;top:${group.rect.y}px;width:${group.rect.width}px;height:${headerHeight}px;--_action-width:${actionWidth}px`}>
    ${rearrangeable && group.gripWidth > 0 ? html`<nve-drag-handle part="drag-handle" data-drag-group=${group.panels[0]?.id ?? ''} draggable="false" aria-label=${ifDefined(strings.workspaceDragGroup)} @click=${(event: Event) => event.preventDefault()}></nve-drag-handle>` : null}
    <div class="tablist" role="tablist" data-group=${input.identity} aria-label=${ifDefined(strings.workspacePanels)} @scroll=${input.scrollChanged}>
      <div class="tab-track" style=${`width:${group.panels.length * width}px`}>${repeat(
        group.panels,
        panel => panel.id,
        (panel, index) =>
          renderTab(panel, {
            active: group.active,
            carried: source.includes(panel.id),
            left: index * width,
            width,
            select: input.select
          })
      )}</div>
    </div>
    <div class="tab-actions-viewport" style=${`left:${group.gripWidth}px;width:${Math.max(0, group.rect.width - group.gripWidth)}px`}>
      <div class="tab-actions-track" style=${`transform:translateX(${-scroll}px)`}>${repeat(
        group.panels,
        panel => panel.id,
        (
          panel,
          index
        ) => html`<div class="tab-actions" ?data-carried-tab=${source.includes(panel.id)} ?inert=${source.includes(panel.id)} aria-hidden=${ifDefined(source.includes(panel.id) ? 'true' : undefined)} style=${`left:${(index + 1) * width - actions * actionWidth}px`}>
        ${
          rearrangeable
            ? html`<button type="button" class="tab-action" tabindex=${panel.id === group.active ? 0 : -1} data-move=${panel.id} aria-label=${`${strings.workspaceArrange} ${input.label(panel.id)}`} popovertarget="workspace-actions" @click=${(
                event: Event
              ) => {
                if (event.currentTarget instanceof HTMLElement) input.actions(panel.id, event.currentTarget);
              }}>⋯</button>`
            : null
        }
        ${closable ? html`<button type="button" class="tab-action" tabindex=${panel.id === group.active ? 0 : -1} data-close=${panel.id} aria-label=${`${strings.close} ${input.label(panel.id)}`} @click=${() => input.close(panel.id)}>×</button>` : null}
      </div>`
      )}</div>
    </div>
  </div>`;
}

function renderTab(
  panel: WorkspacePanel,
  input: { active: string; carried: boolean; left: number; width: number; select(id: string): void }
) {
  return html`<button type="button" role="tab" data-panel=${panel.id} ?data-carried-tab=${input.carried} ?inert=${input.carried} aria-hidden=${ifDefined(input.carried ? 'true' : undefined)} style=${`left:${input.left}px;width:${input.width}px`} aria-label=${panel.id} aria-selected=${input.active === panel.id} tabindex=${input.active === panel.id ? 0 : -1} @click=${() => input.select(panel.id)}></button>`;
}

/** Reads the supplied noninteractive label without relocating its nodes. */
export function panelLabel(panels: WorkspacePanel[], id: string) {
  const panel = panels.find(item => item.id === id);
  return (
    [...(panel?.querySelectorAll(':scope > [slot="label"]') ?? [])]
      .map(item => item.textContent)
      .join(' ')
      .trim() || id
  );
}

export function renderChromeProbe(input: { rearrangeable: boolean; closable: boolean }) {
  return html`<div class="chrome" data-chrome inert aria-hidden="true"><div class="chrome-header"><button class="tab-probe" tabindex="-1">&nbsp;</button>${input.rearrangeable ? html`<nve-drag-handle part="drag-handle" draggable="false"></nve-drag-handle><button class="tab-action" tabindex="-1">⋯</button>` : null}${input.closable ? html`<button class="tab-action" tabindex="-1">×</button>` : null}</div></div>`;
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

export function navigateTabStrip(
  host: HTMLElement & ReactiveControllerHost,
  event: KeyboardEvent,
  {
    panels,
    groups,
    select
  }: {
    panels: WorkspacePanel[];
    groups: WorkspaceTabGroup[];
    select: (event: CustomEvent<string>) => void;
  }
) {
  const button = event
    .composedPath()
    .find((item): item is HTMLButtonElement => item instanceof HTMLButtonElement && item.hasAttribute('data-panel'));
  const panel = panels.find(item => item.id === button?.dataset.panel);
  if (!panel || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const group = groups.find(item => item.panels.includes(panel));
  if (!group) return;
  event.preventDefault();
  const index = group.panels.indexOf(panel);
  const nextIndex = nextTabIndex(event.key, index, group.panels.length);
  const next = group.panels[nextIndex];
  if (!next) return;
  select(new CustomEvent('nve-workspace-select', { detail: next.id }));
  void host.updateComplete
    .then(() => next.updateComplete)
    .then(() => {
      const tab = host.shadowRoot?.querySelector<HTMLButtonElement>(`[data-panel="${CSS.escape(next.id)}"]`);
      tab?.focus();
      tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
}

function nextTabIndex(key: string, index: number, count: number) {
  switch (key) {
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    case 'ArrowRight':
      return (index + 1) % count;
    default:
      return (index - 1 + count) % count;
  }
}
