// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Dimensions } from '@nvidia-elements/core/internal';

import type { WorkspaceNode } from '../model/layout.utils.js';

export interface WorkspaceRequirements {
  gap: number;
  panels: ReadonlyMap<string, Dimensions>;
  chrome: Dimensions;
}

export function sameWorkspaceRequirements(left: WorkspaceRequirements, right: WorkspaceRequirements) {
  if (
    left.gap !== right.gap ||
    left.chrome.width !== right.chrome.width ||
    left.chrome.height !== right.chrome.height ||
    left.panels.size !== right.panels.size
  )
    return false;
  for (const [id, dimensions] of left.panels) {
    const other = right.panels.get(id);
    if (!other || dimensions.width !== other.width || dimensions.height !== other.height) return false;
  }
  return true;
}

export function snapshotWorkspaceRequirements(requirements: WorkspaceRequirements): WorkspaceRequirements {
  return {
    gap: requirements.gap,
    chrome: { ...requirements.chrome },
    panels: new Map([...requirements.panels].map(([id, dimensions]) => [id, { ...dimensions }]))
  };
}

/** Combines explicit panel requirements with one operable header, independent of tab count. */
// eslint-disable-next-line max-statements -- Accumulate dimensions directly without intermediate arrays.
export function getMinimumWorkspaceDimensions(
  node: WorkspaceNode | null,
  requirements: WorkspaceRequirements
): Dimensions {
  if (!node) return { width: 0, height: 0 };
  if (node.type === 'group') {
    let width = requirements.chrome.width;
    let height = requirements.chrome.height;
    for (const id of node.panels) {
      const panel = requirements.panels.get(id);
      if (!panel) continue;
      width = Math.max(width, panel.width);
      height = Math.max(height, panel.height);
    }
    return { width, height };
  }
  const horizontal = node.axis === 'horizontal';
  const gap = requirements.gap * (node.children.length - 1);
  let width = horizontal ? gap : -Infinity;
  let height = horizontal ? -Infinity : gap;
  for (const child of node.children) {
    const minimum = getMinimumWorkspaceDimensions(child, requirements);
    width = horizontal ? width + minimum.width : Math.max(width, minimum.width);
    height = horizontal ? Math.max(height, minimum.height) : height + minimum.height;
  }
  return { width, height };
}

/** Admits a change when it does not increase minimum overflow on either axis. */
export function admitsWorkspaceMove(input: {
  current: WorkspaceNode | null;
  candidate: WorkspaceNode | null;
  viewport: Dimensions;
  requirements: WorkspaceRequirements;
}) {
  const current = getMinimumWorkspaceDimensions(input.current, input.requirements);
  const candidate = getMinimumWorkspaceDimensions(input.candidate, input.requirements);
  return (['width', 'height'] as const).every(
    axis => Math.max(0, candidate[axis] - input.viewport[axis]) <= Math.max(0, current[axis] - input.viewport[axis])
  );
}

/** Reads supplied panel constraints without changing the conservative operable-header floor. */
export function getWorkspaceRequirements(input: {
  measurements: {
    gap: number;
    gripWidth: number;
    tabWidth: number;
    groupActionWidth?: number;
    headerHeight: number;
    panels?: Record<string, { suffixWidth: number; footerHeight: number }>;
  };
  panels: { id: string; minWidth: number; minHeight: number }[];
}): WorkspaceRequirements {
  return {
    gap: input.measurements.gap,
    chrome: {
      width: input.measurements.gripWidth + input.measurements.tabWidth + (input.measurements.groupActionWidth ?? 0),
      height: input.measurements.headerHeight
    },
    panels: new Map(
      input.panels.map(panel => [
        panel.id,
        {
          width: Math.max(
            Number.isFinite(panel.minWidth) ? Math.max(0, panel.minWidth) : 0,
            input.measurements.gripWidth +
              input.measurements.tabWidth +
              (input.measurements.groupActionWidth ?? 0) +
              (input.measurements.panels?.[panel.id]?.suffixWidth ?? 0)
          ),
          height: Math.max(
            Number.isFinite(panel.minHeight) ? Math.max(0, panel.minHeight) : 0,
            input.measurements.headerHeight + (input.measurements.panels?.[panel.id]?.footerHeight ?? 0)
          )
        }
      ])
    )
  };
}
