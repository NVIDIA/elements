// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { WorkspacePanel } from './workspace-panel.js';
import { panelLabel, type WorkspaceTabGroup } from './workspace-tabstrip.utils.js';

/** Connects generated tab semantics to the supplied views without including header actions in names. */
export function labelWorkspaceTabs(
  host: HTMLElement,
  groups: WorkspaceTabGroup[],
  options: { panels: WorkspacePanel[]; carried: (id: string) => boolean }
) {
  groups.forEach(group =>
    group.panels.forEach(panel => {
      if (options.carried(panel.id)) return;
      const button = host.shadowRoot?.querySelector<HTMLElement>(`[data-panel="${CSS.escape(panel.id)}"]`);
      if (!button) return;
      button.ariaControlsElements = [panel];
      button.setAttribute('aria-label', panelLabel(options.panels, panel.id));
      panel.setAttribute('aria-label', panelLabel(options.panels, panel.id));
      panel.ariaLabelledByElements = [button];
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
