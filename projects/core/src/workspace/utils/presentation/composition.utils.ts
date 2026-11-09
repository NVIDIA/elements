// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveControllerHost } from 'lit';

import { getActiveElement, isFocusable, matchesElementName } from '@nvidia-elements/core/internal';

import { WorkspacePanel } from '../../panel/panel.js';

export function getPanelLabel(panel: WorkspacePanel) {
  const header = panel.querySelector(':scope > nve-workspace-panel-header');
  let label = '';
  let separator = '';
  for (let node = header?.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === Node.COMMENT_NODE || (node instanceof Element && node.hasAttribute('slot'))) continue;
    label += separator + (node.textContent ?? '');
    separator = ' ';
  }
  return label.trim() || panel.id;
}

/** Recognizes authored chrome mutations while excluding nested workspace content. */
export function isWorkspaceCompositionMutation(host: HTMLElement, record: MutationRecord) {
  const owns = (node: Node | null | undefined) =>
    !!node && matchesElementName(node as Element, WorkspacePanel) && node.parentElement === host;
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
    ) {
      target.focus({ preventScroll: true });
    }
  };
}

/** Captures only native strip positions for the lifetime of one gesture. */
export function captureTabScroll(host: HTMLElement & { updateComplete: Promise<unknown>; requestUpdate(): void }) {
  const positions = [...(host.shadowRoot?.querySelectorAll<HTMLElement>('.tablist[data-group]') ?? [])].map(strip => ({
    key: strip.dataset.group!,
    left: strip.scrollLeft
  }));
  return () => {
    void restoreTabScroll(host, positions);
  };
}

async function restoreTabScroll(
  host: HTMLElement & { updateComplete: Promise<unknown>; requestUpdate(): void },
  positions: { key: string; left: number }[]
) {
  await host.updateComplete;

  for (const { key, left } of positions) {
    const strip = host.shadowRoot?.querySelector<HTMLElement>(`[data-group="${CSS.escape(key)}"]`);
    if (strip) {
      strip.scrollLeft = left;
    }
  }

  host.requestUpdate();
}

export function shouldFocusAfterWorkspaceClose(host: HTMLElement, id: string): boolean {
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
  if (!options.preserveScroll) {
    scrollWorkspaceHeaderIntoView(host, id);
  }
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

function workspacePanel(host: HTMLElement, id: string): WorkspacePanel | undefined {
  return [...host.children].find(
    (child): child is WorkspacePanel => matchesElementName(child, WorkspacePanel) && child.id === id
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
