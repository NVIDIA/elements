// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspacePlacedRegion, WorkspaceRect } from './workspace-placement.utils.js';

/** Rounds only corners shared with the visible group geometry. */
export function regionCornerStyle(rect: WorkspaceRect, regions: WorkspacePlacedRegion[]): string {
  const corners = [
    ['top-left', 0, 0],
    ['top-right', 1, 0],
    ['bottom-right', 1, 1],
    ['bottom-left', 0, 1]
  ] as const;
  const styles = ['border-radius:var(--_workspace-border-radius)'];
  for (const [corner, right, bottom] of corners) {
    const x = rect.x + right * rect.width;
    const y = rect.y + bottom * rect.height;
    const rounded = regions.some(
      ({ node, rect: group }) =>
        node.type === 'group' &&
        Math.abs(x - group.x - right * group.width) < 0.000001 &&
        Math.abs(y - group.y - bottom * group.height) < 0.000001
    );
    if (!rounded) styles.push(`border-${corner}-radius:0px`);
  }
  return styles.join(';');
}
