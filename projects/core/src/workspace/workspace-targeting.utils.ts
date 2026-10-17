// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { allocateContextProxies, contextKey } from './workspace-context.utils.js';
import { clipCue } from './workspace-drag-preview.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';
import { detachedLayout, projectLayout } from './workspace-operations.utils.js';
import type { WorkspacePlacedRegion } from './workspace-placement.utils.js';
import { deepestCarrier, signature } from './workspace-projection.utils.js';
import type { WorkspaceRect } from './workspace-rearrange.controller.js';

export type WorkspaceDropReservation = 'group' | 'tab';

interface RegionCatalogInput {
  saved: WorkspaceLayout;
  catalog: WorkspacePlacedRegion[];
  allocation: WorkspacePlacedRegion[];
  source: string[];
  available: string[];
  bounds: WorkspaceRect;
}

/** Maps canonical addresses onto a computed acquisition allocation without reading animated nodes. */
export function computedRegionCatalog(input: RegionCatalogInput): WorkspacePlacedRegion[] {
  const proxies = allocateContextProxies(input);
  return regionCatalog(input, key => proxies.find(proxy => proxy.key === key)?.rect);
}

function regionCatalog(
  input: RegionCatalogInput,
  read: (key: string) => WorkspaceRect | undefined
): WorkspacePlacedRegion[] {
  const { catalog, allocation, source, bounds } = input;
  const vacant = allocation.some(
    region => region.node.type === 'group' && ids(region.node).every(id => source.includes(id))
  );
  const owners = new Set(
    allocation.filter(region => region.node.type === 'split').map(region => contextKey(ids(region.node)))
  );
  const seen = new Set<string>();
  return [...catalog]
    .reverse()
    .flatMap(region => {
      const members = ids(region.node);
      const remaining = members.filter(id => !source.includes(id));
      if (!remaining.length) return [];
      const full = contextKey(members);
      const key = vacant && region.node.type === 'split' && owners.has(full) ? full : contextKey(remaining);
      const presented = read(key);
      if (!presented) return [];
      const rect = clipCue(presented, bounds);
      if (rect.width <= 0 || rect.height <= 0) return [];
      const identity = `${key}:${residualSignature(input, region.node)}`;
      if (seen.has(identity)) return [];
      seen.add(identity);
      return [
        {
          ...region,
          rect: { x: presented.x, y: presented.y, width: presented.width, height: presented.height }
        }
      ];
    })
    .reverse();
}

function residualSignature(
  input: { saved: WorkspaceLayout; source: string[]; available: string[] },
  node: WorkspaceNode
) {
  const visible = input.available.filter(id => !input.saved.closed.includes(id));
  const carrier = deepestCarrier(
    input.saved.root,
    signature(node),
    candidate => projectLayout({ version: 1, root: candidate, closed: [] }, visible).root
  );
  return JSON.stringify(detachedLayout({ version: 1, root: carrier ?? node, closed: [] }, input.source).root);
}

function ids(node: WorkspaceNode): string[] {
  return node.type === 'group' ? node.panels : node.children.flatMap(ids);
}
