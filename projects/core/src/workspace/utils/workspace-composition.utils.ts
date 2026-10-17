// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';
import { getActiveElement, isFocusable } from '@nvidia-elements/core/internal';
import { WorkspacePanel } from '../panel/panel.js';
import { panelLabel, type WorkspaceTabGroup } from './workspace-tabstrip.utils.js';

export interface WorkspaceHeaderFocus {
  element: HTMLElement;
  id: string;
  close: boolean;
  members: string[];
}

/** Labels supplied panels and connects tabbed groups to their selection controls. */
export function configureWorkspaceSemantics(
  host: HTMLElement,
  groups: WorkspaceTabGroup[],
  options: { panels: WorkspacePanel[]; carried: (id: string) => boolean }
) {
  options.panels.forEach(panel => {
    if (panel.hasAttribute('aria-labelledby')) panel.removeAttribute('aria-labelledby');
  });
  groups.forEach(group =>
    group.panels.forEach(panel => {
      if (options.carried(panel.id)) return;
      const title = host.shadowRoot?.querySelector<HTMLElement>(`[data-panel="${CSS.escape(panel.id)}"]`);
      const name = panelLabel(options.panels, panel.id);
      panel.setAttribute('aria-label', name);
      if (group.tabbed && title?.localName === 'nve-tabs-item') {
        title.ariaControlsElements = [panel];
        title.setAttribute('aria-label', name);
      }
    })
  );
}

/** Recognizes authored chrome mutations while excluding nested workspace content. */
export function workspaceCompositionChanged(host: HTMLElement, record: MutationRecord) {
  const owns = (node: Node | null | undefined) => node instanceof WorkspacePanel && node.parentElement === host;
  if (owns(record.target))
    return [...record.addedNodes, ...record.removedNodes].some(
      node =>
        node instanceof Element && ['nve-workspace-panel-header', 'nve-workspace-panel-footer'].includes(node.localName)
    );
  const element = record.target instanceof Element ? record.target : record.target.parentElement;
  if (record.attributeName === 'slot' && owns(element?.parentElement)) return true;
  return owns(element?.closest('nve-workspace-panel-header')?.parentElement);
}

export function captureWorkspaceFocus(host: HTMLElement): (() => void) | undefined {
  const document = host.ownerDocument;
  const previous = getActiveElement(document);
  if (!(previous instanceof HTMLElement) || [document.body, document.documentElement, host].includes(previous)) return;
  const selector = focusControlSelector(previous, host);
  return () => {
    if (!host.isConnected || host.ownerDocument !== document) return;
    const active = getActiveElement(document);
    if (active === previous || meaningfulFocus(active, host)) return;
    const target = capturedFocusTarget(host, previous, selector);
    if (
      target &&
      target.ownerDocument === document &&
      isFocusable(target) &&
      target.checkVisibility({ visibilityProperty: true })
    )
      target.focus({ preventScroll: true });
  };
}

export function captureWorkspaceHeaderFocus(host: HTMLElement): WorkspaceHeaderFocus | undefined {
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

export function recoverWorkspaceHeaderFocus(
  host: HTMLElement & ReactiveControllerHost,
  groups: WorkspaceTabGroup[],
  previous: WorkspaceHeaderFocus | undefined
) {
  if (!previous || headerFocusRemainsValid(host, previous)) return;
  const group =
    groups.find(item => item.panels.some(panel => panel.id === previous.id)) ??
    groups.find(item => item.panels.some(panel => previous.members.includes(panel.id)));
  if (!group) return;
  const id = group.panels.some(panel => panel.id === previous.id) ? previous.id : group.active;
  const close =
    previous.close && id === previous.id
      ? host.shadowRoot?.querySelector<HTMLElement>(`[data-close="${CSS.escape(id)}"]`)
      : undefined;
  if (close) close.focus({ preventScroll: true });
  else void focusWorkspacePanel(host, { id, preserveScroll: true });
}

export function workspaceCloseNeedsFocus(host: HTMLElement, id: string): boolean {
  if (!host.ownerDocument.activeElement || host.ownerDocument.activeElement === host.ownerDocument.body) return true;
  if (workspacePanel(host, id)?.matches(':focus-within')) return true;
  const active = host.shadowRoot?.activeElement;
  return active instanceof HTMLElement && (active.dataset.panel === id || active.dataset.close === id);
}

export async function focusWorkspacePanel(
  host: HTMLElement & ReactiveControllerHost,
  options: { id?: string; group?: boolean; preserveScroll?: boolean } = {}
) {
  await host.updateComplete;
  const id = options.id ?? selectedWorkspacePanel(host);
  if (!id) return;
  const target = workspacePanelFocusTarget(host, id, options.group);
  if (!target) return;
  target.focus({ preventScroll: options.preserveScroll });
  if (!options.preserveScroll) scrollWorkspaceHeaderIntoView(host, id);
}

function capturedFocusTarget(host: HTMLElement, previous: HTMLElement, selector: string | undefined) {
  if (previous.isConnected) return previous;
  return selector ? host.shadowRoot?.querySelector<HTMLElement>(selector) : undefined;
}

function meaningfulFocus(element: Element | null, host: HTMLElement) {
  return (
    element instanceof HTMLElement &&
    element !== host &&
    element !== host.ownerDocument.body &&
    element !== host.ownerDocument.documentElement &&
    element.isConnected &&
    isFocusable(element) &&
    element.checkVisibility({ visibilityProperty: true })
  );
}

function focusControlSelector(element: HTMLElement, host: HTMLElement) {
  if (element.getRootNode() !== host.shadowRoot) return undefined;
  const attribute = element.hasAttribute('data-panel') ? 'data-panel' : 'data-drag-group';
  const id = element.getAttribute(attribute);
  return id ? `${element.localName}[${attribute}="${CSS.escape(id)}"]` : undefined;
}

function headerFocusRemainsValid(host: HTMLElement, previous: WorkspaceHeaderFocus): boolean {
  if (previous.element.isConnected && !previous.element.closest('[inert]')) return true;
  const active = getActiveElement(host.ownerDocument);
  if (!active || [host, host.ownerDocument.body, previous.element].some(element => element === active)) return false;
  return active.isConnected && !active.closest('[inert]');
}

function workspacePanel(host: HTMLElement, id: string): WorkspacePanel | undefined {
  return [...host.children].find(
    (child): child is WorkspacePanel => child instanceof WorkspacePanel && child.id === id
  );
}

function selectedWorkspacePanel(host: HTMLElement): string | undefined {
  return host.shadowRoot?.querySelector<HTMLElement>('nve-tabs-item[selected], .panel-title')?.dataset.panel;
}

function workspacePanelFocusTarget(host: HTMLElement, id: string, group?: boolean): HTMLElement | null | undefined {
  const root = host.shadowRoot;
  if (!root) return;
  const escaped = CSS.escape(id);
  if (group) {
    const grip = root.querySelector<HTMLElement>(`[data-drag-group="${escaped}"]`);
    if (grip) return grip;
  }
  const control = root.querySelector<HTMLElement>(`[data-panel="${escaped}"]`);
  if (control?.localName === 'nve-tabs-item') return control;
  return workspacePanel(host, id)?.shadowRoot?.querySelector<HTMLElement>('.body');
}

function scrollWorkspaceHeaderIntoView(host: HTMLElement, id: string) {
  host.shadowRoot
    ?.querySelector(`[data-panel="${CSS.escape(id)}"]`)
    ?.closest('.tab-entry')
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
