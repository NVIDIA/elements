// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import { getActiveElement } from '@nvidia-elements/core/internal';

import { focusWorkspacePanel, getPanelLabel } from '../utils/presentation/composition.utils.js';
import { getAllocatedTabWidth, getTabStripIdentity } from '../utils/presentation/groups.utils.js';

import type { WorkspaceDragPreview } from '../utils/interaction/drag-preview.utils.js';
import type { WorkspaceLayout } from '../utils/model/layout.utils.js';
import type { WorkspacePresentedGroup } from '../utils/presentation/groups.utils.js';
import type { WorkspaceMeasurements } from '../utils/presentation/measurements.utils.js';

import type { WorkspacePanelHeader } from '../panel-header/panel-header.js';
import type { WorkspacePanel } from '../panel/panel.js';

export interface WorkspacePanelTransitionTargets {
  element: WorkspacePanel;
  header: ReturnType<WorkspacePanelHeader['_getTransitionTargets']> | undefined;
}

export interface WorkspaceTransitionTargets {
  panels: ReadonlyMap<string, WorkspacePanelTransitionTargets>;
  groups: { element: HTMLElement; tabs: ReadonlyMap<string, HTMLElement> }[];
  gutters: ReadonlyMap<string, HTMLElement>;
}

interface WorkspaceCompositionDelegate {
  readonly getPanels: () => WorkspacePanel[];
  readonly getGroups: () => WorkspacePresentedGroup[];
  readonly getLayout: () => WorkspaceLayout | undefined;
  readonly getPreview: () => WorkspaceDragPreview | undefined;
  readonly scrollChanged: () => void;
}

interface WorkspaceCompositionPresentation {
  groups: WorkspacePresentedGroup[];
  extent: { width: number; height: number };
  container?: 'inset' | 'flat' | 'full';
  measurements: WorkspaceMeasurements;
  closable: boolean;
  animate: boolean;
  source: string[];
  scroll(group: WorkspacePresentedGroup): number;
}

interface HeaderFocus {
  element: HTMLElement;
  id: string;
  close: boolean;
  members: string[];
}

/** Synchronizes supplied panels and projected headers with their computed group presentation. */
export class WorkspaceCompositionController {
  readonly #host: HTMLElement & ReactiveControllerHost;
  readonly #delegate: WorkspaceCompositionDelegate;
  #headerFocus?: HeaderFocus;

  constructor(host: HTMLElement & ReactiveControllerHost, delegate: WorkspaceCompositionDelegate) {
    this.#host = host;
    this.#delegate = delegate;
    host.addController(this);
  }

  hostDisconnected() {
    this.#headerFocus = undefined;
  }

  captureFocus() {
    this.#headerFocus = this.#delegate.getPreview() ? undefined : captureHeaderFocus(this.#host);
  }

  applyPresentation(input: WorkspaceCompositionPresentation) {
    const presentations = input.groups.map(group => ({ group, scrollLeft: input.scroll(group) }));
    for (const { group, scrollLeft } of presentations) {
      configureGroup(input, group, scrollLeft);
    }
    const visible = new Set(input.groups.flatMap(group => group.panels));
    this.#delegate.getPanels().forEach(panel => {
      panel._present(visible.has(panel) && !input.source.includes(panel.id));
    });
  }

  sync() {
    const panels = this.#delegate.getPanels();
    const groups = this.#delegate.getGroups();
    const preview = this.#delegate.getPreview();
    bindTabScroll(
      panels,
      groups.map(group => ({ group, strip: this.findTabStrip(group) }))
    );
    configureSemantics(this.#host, groups, { panels, carried: id => preview?.source.includes(id) ?? false });
    if (!preview) {
      recoverHeaderFocus(this.#host, groups, this.#headerFocus);
    }
    this.#headerFocus = undefined;
  }

  getTransitionTargets(): WorkspaceTransitionTargets {
    const panels = new Map<string, WorkspacePanelTransitionTargets>();
    for (const panel of this.#delegate.getPanels()) {
      if (!panel.checkVisibility()) continue;
      const header = panel.querySelector<WorkspacePanelHeader>(':scope > nve-workspace-panel-header');
      panels.set(panel.id, { element: panel, header: header?._getTransitionTargets() });
    }
    const gutters = new Map<string, HTMLElement>();
    for (const handle of this.#host.shadowRoot?.querySelectorAll<HTMLElement>('[data-boundary]') ?? []) {
      if (handle.parentElement) {
        gutters.set(handle.dataset.boundary!, handle.parentElement);
      }
    }
    return { panels, groups: getGroupTransitionTargets(this.#host), gutters };
  }

  getGroupIdentity(group: WorkspacePresentedGroup) {
    return getTabStripIdentity(
      this.#delegate.getLayout()?.root ?? null,
      group.panels.map(panel => panel.id),
      this.#delegate.getPreview()?.source ?? []
    );
  }

  findTabStrip(group: WorkspacePresentedGroup) {
    return this.#host.shadowRoot?.querySelector<HTMLElement>(
      `[data-group="${CSS.escape(this.getGroupIdentity(group))}"]`
    );
  }

  handleScroll(group: WorkspacePresentedGroup, event: Event) {
    const strip = event.currentTarget;
    if (!(strip instanceof HTMLElement)) return;
    const offset = strip.scrollLeft;
    for (const panel of group.panels) {
      panel.querySelector<WorkspacePanelHeader>(':scope > nve-workspace-panel-header')?._scroll(offset);
    }
    this.#delegate.scrollChanged();
  }

  setHeaderHovered(id: string, hovered: boolean) {
    this.#delegate
      .getPanels()
      .find(panel => panel.id === id)
      ?.querySelector<WorkspacePanelHeader>(':scope > nve-workspace-panel-header')
      ?._hover(hovered);
  }
}

function configureGroup(input: WorkspaceCompositionPresentation, group: WorkspacePresentedGroup, scrollLeft: number) {
  const { headerHeight, actionWidth } = input.measurements;
  const tabWidth = getAllocatedTabWidth(group, input.measurements);
  const groupActionWidth = input.measurements.groupActionWidth ?? 0;
  const suffixWidth = (input.measurements.panels?.[group.active]?.suffixWidth ?? 0) + groupActionWidth;
  group.panels.forEach((panel, index) => {
    if (input.source.includes(panel.id)) return;
    if (input.container && panel.getAttribute('container') !== input.container) {
      panel.setAttribute('container', input.container);
    } else if (!input.container) {
      panel.removeAttribute('container');
    }
    panel.setAttribute('role', group.tabbed ? 'tabpanel' : 'group');
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
      input.measurements.gap === 0 && rect.x + rect.width < input.extent.width - 0.000001 ? 'none' : 'var(--border)'
    );
    panel.style.setProperty(
      '--_workspace-border-bottom',
      input.measurements.gap === 0 && rect.y + rect.height < input.extent.height - 0.000001 ? 'none' : 'var(--border)'
    );
    panel._configure({
      selected: group.active === panel.id,
      offset: group.gripWidth + index * tabWidth,
      scrollLeft,
      animate: input.animate,
      tabWidth: Math.max(0, tabWidth - actionWidth * Number(input.closable)),
      headerHeight,
      suffixEnd: groupActionWidth,
      clipLeft: group.gripWidth,
      clipWidth: Math.max(0, rect.width - group.gripWidth - suffixWidth)
    });
  });
}

function bindTabScroll(
  panels: WorkspacePanel[],
  groups: { group: WorkspacePresentedGroup; strip: HTMLElement | null | undefined }[]
) {
  const bindings = new Map<WorkspacePanel, { source: HTMLElement; extent: number }>();
  for (const { group, strip } of groups) {
    if (!strip || group.panels.length < 2) continue;
    const binding = { source: strip, extent: Math.max(0, strip.scrollWidth - strip.clientWidth) };
    for (const panel of group.panels) {
      bindings.set(panel, binding);
    }
  }
  for (const panel of panels) {
    const binding = bindings.get(panel);
    panel
      .querySelector<WorkspacePanelHeader>(':scope > nve-workspace-panel-header')
      ?._bindScroll(binding?.source, binding?.extent ?? 0);
  }
}

function configureSemantics(
  host: HTMLElement,
  groups: WorkspacePresentedGroup[],
  options: { panels: WorkspacePanel[]; carried: (id: string) => boolean }
) {
  options.panels.forEach(panel => {
    if (panel.hasAttribute('aria-labelledby')) {
      panel.removeAttribute('aria-labelledby');
    }
  });
  groups.forEach(group =>
    group.panels.forEach(panel => {
      if (options.carried(panel.id)) return;
      const title = host.shadowRoot?.querySelector<HTMLElement>(`[data-panel="${CSS.escape(panel.id)}"]`);
      const name = getPanelLabel(options.panels, panel.id);
      panel.setAttribute('aria-label', name);
      if (group.tabbed && title?.localName === 'nve-tabs-item') {
        title.ariaControlsElements = [panel];
        title.setAttribute('aria-label', name);
      }
    })
  );
}

function captureHeaderFocus(host: HTMLElement): HeaderFocus | undefined {
  const element = host.shadowRoot?.activeElement;
  if (!element || !(element instanceof HTMLElement) || !element.closest('.tabs')) return;
  const id = element.dataset.panel ?? element.dataset.close ?? element.dataset.dragGroup;
  if (!id) return;
  return {
    element,
    id,
    close: element.hasAttribute('data-close'),
    members: [...(element.closest('.tabs')?.querySelectorAll<HTMLElement>('[data-panel]') ?? [])].map(
      item => item.dataset.panel!
    )
  };
}

function recoverHeaderFocus(
  host: HTMLElement & ReactiveControllerHost,
  groups: WorkspacePresentedGroup[],
  previous: HeaderFocus | undefined
) {
  if (!previous || !shouldRecoverHeaderFocus(host, previous)) return;
  const group =
    groups.find(item => item.panels.some(panel => panel.id === previous.id)) ??
    groups.find(item => item.panels.some(panel => previous.members.includes(panel.id)));
  if (!group) return;
  const id = group.panels.some(panel => panel.id === previous.id) ? previous.id : group.active;
  const close =
    previous.close && id === previous.id
      ? host.shadowRoot?.querySelector<HTMLElement>(`[data-close="${CSS.escape(id)}"]`)
      : undefined;
  if (close) {
    close.focus({ preventScroll: true });
  } else {
    void focusWorkspacePanel(host, { id, preserveScroll: true });
  }
}

function shouldRecoverHeaderFocus(host: HTMLElement, previous: HeaderFocus): boolean {
  if (previous.element.isConnected && !previous.element.closest('[inert]')) {
    return false;
  }
  const active = getActiveElement(host.ownerDocument);
  if (!active || [host, host.ownerDocument.body, previous.element].some(element => element === active)) {
    return true;
  }
  if (active.isConnected && !active.closest('[inert]')) {
    return false;
  }
  return true;
}

function getGroupTransitionTargets(host: HTMLElement): WorkspaceTransitionTargets['groups'] {
  const groups: WorkspaceTransitionTargets['groups'] = [];
  for (const element of host.shadowRoot?.querySelectorAll<HTMLElement>('.group-chrome') ?? []) {
    const tabs = new Map<string, HTMLElement>();
    for (const tab of element.querySelectorAll<HTMLElement>('[data-panel]')) {
      const entry = tab.closest<HTMLElement>('.tab-entry');
      if (entry && tab.dataset.panel) {
        tabs.set(tab.dataset.panel, entry);
      }
    }
    groups.push({ element, tabs });
  }
  return groups;
}
