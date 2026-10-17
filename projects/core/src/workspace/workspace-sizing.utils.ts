// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceNode } from './workspace-layout.utils.js';

export interface WorkspaceExtent {
  width: number;
  height: number;
}

export interface WorkspaceRequirements {
  panels: ReadonlyMap<string, WorkspaceExtent>;
  chrome: WorkspaceExtent;
}

/** Combines explicit panel requirements with one operable header, independent of tab count. */
export function minimumWorkspace(node: WorkspaceNode | null, requirements: WorkspaceRequirements): WorkspaceExtent {
  if (!node) return { width: 0, height: 0 };
  if (node.type === 'pane') {
    const panels = node.panels.flatMap(id => {
      const panel = requirements.panels.get(id);
      return panel ? [panel] : [];
    });
    return {
      width: Math.max(requirements.chrome.width, ...panels.map(panel => panel.width)),
      height: Math.max(requirements.chrome.height, ...panels.map(panel => panel.height))
    };
  }
  const children = node.children.map(child => minimumWorkspace(child, requirements));
  const gap = 6 * (children.length - 1);
  return {
    width:
      node.axis === 'horizontal'
        ? children.reduce((sum, child) => sum + child.width, gap)
        : Math.max(...children.map(child => child.width)),
    height:
      node.axis === 'vertical'
        ? children.reduce((sum, child) => sum + child.height, gap)
        : Math.max(...children.map(child => child.height))
  };
}

/** Admits a change when it does not increase minimum overflow on either axis. */
export function admitsWorkspaceMove(input: {
  current: WorkspaceNode | null;
  candidate: WorkspaceNode | null;
  viewport: WorkspaceExtent;
  requirements: WorkspaceRequirements;
}) {
  const current = minimumWorkspace(input.current, input.requirements);
  const candidate = minimumWorkspace(input.candidate, input.requirements);
  return (['width', 'height'] as const).every(
    axis => Math.max(0, candidate[axis] - input.viewport[axis]) <= Math.max(0, current[axis] - input.viewport[axis])
  );
}

/** Reads supplied panel constraints without changing the conservative operable-header floor. */
export function workspaceRequirements(input: {
  chrome: { gripWidth: number; tabWidth: number; headerHeight: number };
  panels: { id: string; minWidth: number; minHeight: number }[];
}): WorkspaceRequirements {
  return {
    chrome: { width: input.chrome.gripWidth + input.chrome.tabWidth, height: input.chrome.headerHeight },
    panels: new Map(
      input.panels.map(panel => [
        panel.id,
        {
          width: Number.isFinite(panel.minWidth) ? Math.max(0, panel.minWidth) : 0,
          height: Number.isFinite(panel.minHeight) ? Math.max(0, panel.minHeight) : 0
        }
      ])
    )
  };
}
