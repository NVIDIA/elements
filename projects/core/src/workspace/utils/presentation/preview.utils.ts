// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rect } from '@nvidia-elements/core/internal';

import { getAllocatedScopes } from '../placement/scope.utils.js';

import type { WorkspacePlacedRegion } from '../geometry/allocation.utils.js';
import type { WorkspaceDragPreview } from '../interaction/drag-preview.utils.js';

export interface PreviewBoundary {
  key: string;
  rect: Rect;
  style: string;
}

export function preparePreviewBoundaries(
  catalogRegions: WorkspacePlacedRegion[],
  placedRegions: WorkspacePlacedRegion[],
  sourcePanelIds: string[]
): PreviewBoundary[] {
  return getAllocatedScopes({
    catalog: catalogRegions,
    allocation: placedRegions,
    source: sourcePanelIds
  }).map(scope => ({
    ...scope,
    style: `left:${scope.rect.x}px;top:${scope.rect.y}px;width:${scope.rect.width}px;height:${scope.rect.height}px;${getRegionCornerStyle(scope.rect, placedRegions)}`
  }));
}

export function shouldEmphasizeReservedDestination(preview: WorkspaceDragPreview) {
  return (
    !preview.blocked &&
    'allocation' in preview &&
    preview.allocation === 'reserved' &&
    (preview.intent.kind === 'order' ||
      preview.intent.kind === 'insert' ||
      (preview.phase === 'detached' && preview.intent.kind === 'invalid' && preview.cue.kind === 'group'))
  );
}

/** Rounds only corners shared with the visible group geometry. */
export function getRegionCornerStyle(rect: Rect, regions: WorkspacePlacedRegion[]): string {
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
    if (!rounded) {
      styles.push(`border-${corner}-radius:0px`);
    }
  }
  return styles.join(';');
}
