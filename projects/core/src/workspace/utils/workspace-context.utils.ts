// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { panelIds, type WorkspaceNode } from './workspace-layout.utils.js';
import type { WorkspacePlacedRegion, WorkspaceRect } from './workspace-placement.utils.js';

export interface WorkspacePlacementContext {
  kind: 'rail' | 'recipient';
  members: string[];
}

export interface WorkspaceContextProxy {
  key: string;
  rect: WorkspaceRect;
}

interface ContextRectInput {
  members: string[];
  allocation: WorkspacePlacedRegion[];
  source: string[];
}

export type WorkspaceContextRectResolver = (input: ContextRectInput) => WorkspaceRect | undefined;

/** Identifies an operating region independently of path changes or sibling order. */
export function contextKey(members: string[]): string {
  return JSON.stringify([...members].sort());
}

/** Retains the owner rail or the surviving recipient of one evaluated placement. */
export function placementContext(
  kind: WorkspacePlacementContext['kind'],
  node: WorkspaceNode | null,
  source: string[]
): WorkspacePlacementContext {
  const carried = new Set(source);
  return { kind, members: panelIds(node).filter(id => kind === 'rail' || !carried.has(id)) };
}

/** Includes surviving peers whose computed allocation changes under split constraints. */
export function affectedSplitContext(input: {
  baseline: WorkspacePlacedRegion[];
  achieved: WorkspacePlacedRegion[];
  source: string[];
  recipient: string[];
}): WorkspacePlacementContext {
  const achieved = new Map(
    input.achieved.flatMap(region =>
      region.node.type === 'group' ? region.node.panels.map(id => [id, region.rect] as const) : []
    )
  );
  const affected = new Set(input.recipient);
  for (const region of input.baseline) {
    if (region.node.type !== 'group') continue;
    for (const id of region.node.panels) {
      if (input.source.includes(id)) continue;
      const after = achieved.get(id);
      if (after && changedRect(region.rect, after)) affected.add(id);
    }
  }
  const region = input.baseline
    .filter(candidate => {
      const members = panelIds(candidate.node);
      return [...affected].every(id => members.includes(id));
    })
    .at(-1);
  return region
    ? { kind: region.node.type === 'group' ? 'recipient' : 'rail', members: panelIds(region.node) }
    : { kind: 'recipient', members: input.recipient };
}

function changedRect(before: WorkspaceRect, after: WorkspaceRect) {
  return (['x', 'y', 'width', 'height'] as const).some(key => Math.abs(before[key] - after[key]) > 0.000001);
}

/** Seeds operating-region proxies before their selection can change during animation. */
export function allocateContextProxies(input: {
  catalog: WorkspacePlacedRegion[];
  allocation: WorkspacePlacedRegion[];
  source: string[];
}): WorkspaceContextProxy[] {
  const carried = new Set(input.source);
  const memberships = new Map<string, string[]>();
  for (const region of input.catalog) {
    const full = panelIds(region.node);
    const remaining = full.filter(id => !carried.has(id));
    if (!remaining.length) continue;
    for (const members of [full, remaining]) memberships.set(contextKey(members), members);
  }
  const geometry = allocationIndex(input.allocation);
  return [...memberships].flatMap(([key, members]) => {
    const rect = resolveContextRegion({ members, geometry, carried });
    return rect ? [{ key, rect }] : [];
  });
}

/** Resolves one semantic region against its current allocated branch or child range. */
export function allocatedContextRect(input: ContextRectInput): WorkspaceRect | undefined {
  return resolveContextRegion({
    members: input.members,
    geometry: allocationIndex(input.allocation),
    carried: new Set(input.source)
  });
}

export function createAllocatedContextRect(): WorkspaceContextRectResolver {
  const indices = new WeakMap<WorkspacePlacedRegion[], ReturnType<typeof allocationIndex>>();
  return input => {
    let geometry = indices.get(input.allocation);
    if (!geometry) {
      geometry = allocationIndex(input.allocation);
      indices.set(input.allocation, geometry);
    }
    return resolveContextRegion({ members: input.members, geometry, carried: new Set(input.source) });
  };
}

function allocationIndex(regions: WorkspacePlacedRegion[]) {
  const leaves = regions.filter(region => region.node.type === 'group');
  const byKey = new Map(regions.map(region => [region.key, region]));
  const groupByMember = new Map<string, string>();
  for (const leaf of leaves) panelIds(leaf.node).forEach(id => groupByMember.set(id, leaf.key));
  const exact = new Map<string, WorkspaceRect>();
  for (const region of regions) {
    const keys = leaves.filter(leaf => descendant(leaf.key, region.key)).map(leaf => leaf.key);
    exact.set(contextKey(keys), region.rect);
  }
  return { leaves, byKey, groupByMember, exact };
}

function resolveContextRegion(input: {
  members: string[];
  geometry: ReturnType<typeof allocationIndex>;
  carried: Set<string>;
}): WorkspaceRect | undefined {
  const { members, geometry, carried } = input;
  const selected = new Set(members.flatMap(id => geometry.groupByMember.get(id) ?? []));
  if (!selected.size) return undefined;
  const exact = geometry.exact.get(contextKey([...selected]));
  if (exact) return exact;
  const prefix = commonRegion([...selected]);
  const parent = geometry.byKey.get(prefix);
  if (parent?.node.type !== 'split') return undefined;
  const { depth, first, last } = childRange([...selected], prefix);
  const covered = geometry.leaves.filter(leaf => {
    const index = Number(leaf.key.split('.')[depth]);
    return descendant(leaf.key, prefix) && index >= first && index <= last;
  });
  if (covered.some(leaf => !selected.has(leaf.key) && !panelIds(leaf.node).every(id => carried.has(id))))
    return undefined;
  const before = geometry.byKey.get(`${prefix}.${first}`);
  const after = geometry.byKey.get(`${prefix}.${last}`);
  if (!before || !after) return undefined;
  return parent.node.axis === 'horizontal'
    ? {
        x: before.rect.x,
        y: parent.rect.y,
        width: after.rect.x + after.rect.width - before.rect.x,
        height: parent.rect.height
      }
    : {
        x: parent.rect.x,
        y: before.rect.y,
        width: parent.rect.width,
        height: after.rect.y + after.rect.height - before.rect.y
      };
}

function commonRegion(keys: string[]): string {
  const parts = keys[0]!.split('.');
  while (!keys.every(key => descendant(key, parts.join('.')))) parts.pop();
  return parts.join('.');
}

function descendant(key: string, parent: string): boolean {
  return key === parent || key.startsWith(`${parent}.`);
}

function childRange(keys: string[], parent: string) {
  const depth = parent.split('.').length;
  const indices = keys.map(key => Number(key.split('.')[depth]));
  return { depth, first: Math.min(...indices), last: Math.max(...indices) };
}
