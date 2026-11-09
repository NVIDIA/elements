// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rect } from '@nvidia-elements/core/internal';

import { getPanelIds } from '../model/layout.utils.js';
import { getPanelMembershipKey } from '../model/membership.utils.js';

import type { WorkspacePlacedRegion } from '../geometry/allocation.utils.js';
import type { WorkspaceNode } from '../model/layout.utils.js';

export interface WorkspacePlacementScope {
  kind: 'rail' | 'recipient';
  members: string[];
}

export interface WorkspaceScopeBounds {
  key: string;
  rect: Rect;
}

interface ScopeRectInput {
  members: string[];
  allocation: WorkspacePlacedRegion[];
  source: string[];
}

export type WorkspaceScopeRectResolver = (input: ScopeRectInput) => Rect | undefined;

export function createPlacementScope(
  kind: WorkspacePlacementScope['kind'],
  node: WorkspaceNode | null,
  source: string[]
): WorkspacePlacementScope {
  const carried = new Set(source);
  return { kind, members: getPanelIds(node).filter(id => kind === 'rail' || !carried.has(id)) };
}

/** Includes surviving peers whose computed allocation changes under split constraints. */
export function getAffectedSplitScope(input: {
  baseline: WorkspacePlacedRegion[];
  achieved: WorkspacePlacedRegion[];
  source: string[];
  recipient: string[];
}): WorkspacePlacementScope {
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
      if (after && hasRectChanged(region.rect, after)) {
        affected.add(id);
      }
    }
  }
  const region = input.baseline
    .filter(candidate => {
      const members = getPanelIds(candidate.node);
      return [...affected].every(id => members.includes(id));
    })
    .at(-1);
  return region
    ? { kind: region.node.type === 'group' ? 'recipient' : 'rail', members: getPanelIds(region.node) }
    : { kind: 'recipient', members: input.recipient };
}

function hasRectChanged(before: Rect, after: Rect) {
  return (['x', 'y', 'width', 'height'] as const).some(key => Math.abs(before[key] - after[key]) > 0.000001);
}

/** Seeds scope bounds before animation can change selection. */
export function getAllocatedScopes(input: {
  catalog: WorkspacePlacedRegion[];
  allocation: WorkspacePlacedRegion[];
  source: string[];
}): WorkspaceScopeBounds[] {
  const carried = new Set(input.source);
  const memberships = new Map<string, string[]>();
  for (const region of input.catalog) {
    const full = getPanelIds(region.node);
    const remaining = full.filter(id => !carried.has(id));
    if (!remaining.length) continue;
    memberships.set(getPanelMembershipKey(full), full);
    if (remaining.length !== full.length) memberships.set(getPanelMembershipKey(remaining), remaining);
  }
  const geometry = createAllocationIndex(input.allocation);
  return [...memberships].flatMap(([key, members]) => {
    const rect = getScopeRect({ members, geometry, carried });
    return rect ? [{ key, rect }] : [];
  });
}

export function getAllocatedScopeRect(input: ScopeRectInput): Rect | undefined {
  return getScopeRect({
    members: input.members,
    geometry: createAllocationIndex(input.allocation),
    carried: new Set(input.source)
  });
}

export function createScopeRectResolver(): WorkspaceScopeRectResolver {
  const indices = new WeakMap<WorkspacePlacedRegion[], ReturnType<typeof createAllocationIndex>>();
  return input => {
    let geometry = indices.get(input.allocation);
    if (!geometry) {
      geometry = createAllocationIndex(input.allocation);
      indices.set(input.allocation, geometry);
    }
    return getScopeRect({ members: input.members, geometry, carried: new Set(input.source) });
  };
}

function createAllocationIndex(regions: WorkspacePlacedRegion[]) {
  const leaves = regions.filter(region => region.node.type === 'group');
  const byKey = new Map(regions.map((region, order) => [region.key, { ...region, order, leafCount: 0 }]));
  const groupByMember = new Map<string, string>();
  for (const leaf of leaves) {
    getPanelIds(leaf.node).forEach(id => groupByMember.set(id, leaf.key));
  }
  for (const leaf of leaves) {
    for (let key = leaf.key; key; key = getParentRegionKey(key)) {
      const scope = byKey.get(key);
      if (scope) scope.leafCount++;
    }
  }
  return { leaves, byKey, groupByMember };
}

function getSelectedRegionKeys(members: string[], groupByMember: ReadonlyMap<string, string>) {
  const selected = new Set<string>();
  for (const id of members) {
    const key = groupByMember.get(id);
    if (key !== undefined) selected.add(key);
  }
  return selected;
}

// eslint-disable-next-line max-statements -- Resolve exact scopes before the contiguous-range fallback.
function getScopeRect(input: {
  members: string[];
  geometry: ReturnType<typeof createAllocationIndex>;
  carried: Set<string>;
}): Rect | undefined {
  const { members, geometry, carried } = input;
  const selected = getSelectedRegionKeys(members, geometry.groupByMember);
  if (!selected.size) return undefined;
  const keys = [...selected];
  const prefix = getCommonRegionKey(keys);
  const exact = findExactScopeRect(geometry, prefix, selected.size);
  if (exact) return exact;
  const parent = geometry.byKey.get(prefix);
  if (parent?.node.type !== 'split') return undefined;
  const { depth, first, last } = getChildRange(keys, prefix);
  const covered = geometry.leaves.filter(leaf => {
    const index = Number(leaf.key.split('.')[depth]);
    return isWithinRegion(leaf.key, prefix) && index >= first && index <= last;
  });
  if (covered.some(leaf => !selected.has(leaf.key) && !getPanelIds(leaf.node).every(id => carried.has(id))))
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

function findExactScopeRect(geometry: ReturnType<typeof createAllocationIndex>, prefix: string, leafCount: number) {
  let rect: Rect | undefined;
  let order = -1;
  for (let key = prefix; key; key = getParentRegionKey(key)) {
    const scope = geometry.byKey.get(key);
    // Scopes with the same leaves use the last supplied region, including filtered catalogs.
    if (scope?.leafCount === leafCount && scope.order > order) {
      rect = scope.rect;
      order = scope.order;
    }
  }
  return rect;
}

function getParentRegionKey(key: string) {
  const separator = key.lastIndexOf('.');
  return separator < 0 ? '' : key.slice(0, separator);
}

function getCommonRegionKey(keys: string[]): string {
  let prefix = keys[0]!;
  for (const key of keys) {
    while (!isWithinRegion(key, prefix)) prefix = getParentRegionKey(prefix);
  }
  return prefix;
}

function isWithinRegion(key: string, parent: string): boolean {
  return key === parent || key.startsWith(`${parent}.`);
}

function getChildRange(keys: string[], parent: string) {
  const depth = parent.split('.').length;
  const indices = keys.map(key => Number(key.split('.')[depth]));
  return { depth, first: Math.min(...indices), last: Math.max(...indices) };
}
