// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getPanelIds, normalizeLayout, normalizeLayoutWithSharing } from './layout.utils.js';
import { sameWorkspaceLayout } from './value.utils.js';

import type { WorkspaceGroup, WorkspaceLayout, WorkspaceNode } from './layout.utils.js';

export interface WorkspaceDestination {
  target: string;
  /** Region path in the visible projection of the current layout. */
  region?: string;
  position: 'tab' | 'left' | 'right' | 'top' | 'bottom';
  index?: number;
}

export function sameDestination(left: WorkspaceDestination, right: WorkspaceDestination) {
  return (
    left.target === right.target &&
    left.position === right.position &&
    left.region === right.region &&
    left.index === right.index
  );
}

interface TargetGroupContext {
  source: string[];
  destination: WorkspaceDestination;
  sourceGroup: WorkspaceGroup;
  targetGroup: WorkspaceGroup;
  moving: WorkspaceGroup;
  removed: Set<string>;
  splitWeights: [number, number];
}

export function findGroup(node: WorkspaceNode | null, id?: string): WorkspaceGroup | undefined {
  if (!node) return undefined;
  if (node.type === 'group') return id === undefined || node.panels.includes(id) ? node : undefined;
  for (const child of node.children) {
    const group = findGroup(child, id);
    if (group) return group;
  }
  return undefined;
}

function mapGroups(
  node: WorkspaceNode | null,
  visit: (group: WorkspaceGroup) => WorkspaceNode | null
): WorkspaceNode | null {
  if (!node) return null;
  if (node.type === 'group') {
    const mapped = visit(node);
    if (mapped?.type !== 'group' || mapped.panels !== node.panels) return mapped;
    return { ...mapped, panels: [...mapped.panels] };
  }
  const children: WorkspaceNode[] = [];
  const weights: number[] = [];
  node.children.forEach((child, index) => {
    const mapped = mapGroups(child, visit);
    const weight = node.weights[index];
    if (mapped && weight !== undefined) {
      children.push(mapped);
      weights.push(weight);
    }
  });
  if (!children.length) return null;
  if (children.length === 1) return children[0] ?? null;
  return normalizeLayoutWithSharing({ type: 'split', axis: node.axis, children, weights });
}

function filterGroup(group: WorkspaceGroup, keep: (id: string) => boolean): WorkspaceGroup | null {
  const panels = group.panels.filter(keep);
  const first = panels[0];
  if (first === undefined) return null;
  return { type: 'group', panels, active: panels.includes(group.active) ? group.active : first };
}

function appendPanels(root: WorkspaceNode | null, panels: string[], active?: string): WorkspaceNode | null {
  if (!panels.length) return root;
  const first = findGroup(root);
  return first
    ? mapGroups(root, group => ({
        ...group,
        panels: group === first ? [...group.panels, ...panels] : [...group.panels],
        active: group === first ? (active ?? group.active) : group.active
      }))
    : { type: 'group', panels: [...panels], active: active ?? panels[0] ?? '' };
}

function validSource(group: WorkspaceGroup, source: string[]): boolean {
  return (
    source.length === 1 ||
    (source.length === group.panels.length && source.every((id, index) => group.panels[index] === id))
  );
}

export function isValidInsertionIndex(index: number | undefined): boolean {
  return index === undefined || (Number.isInteger(index) && index >= 0);
}

/** Removes carried panels from the arrangement and closed list without changing the saved layout. */
export function createDetachedLayout(layout: WorkspaceLayout, source: string[]): WorkspaceLayout {
  const removed = new Set(source);
  return {
    version: 1,
    root: mapGroups(layout.root, group => filterGroup(group, id => !removed.has(id))),
    closed: layout.closed.filter(id => !removed.has(id))
  };
}

export function placePanels(input: {
  layout: WorkspaceLayout;
  source: string[];
  destination: WorkspaceDestination;
  splitWeights?: [number, number];
}): WorkspaceLayout | undefined {
  const { layout, source, destination, splitWeights = [0.5, 0.5] } = input;
  if (destination.region) return undefined;
  if (!splitWeights.every(weight => Number.isFinite(weight) && weight > 0)) return undefined;
  const match = moveSource(layout, source, destination);
  if (!match) return undefined;
  const { sourceGroup, targetGroup } = match;
  const first = source[0]!;
  const removed = new Set(source);
  const target = targetGroup.panels.find(id => !removed.has(id));
  if (!target) return layout;
  const stripped = mapGroups(layout.root, group => filterGroup(group, id => !removed.has(id)));
  const moving: WorkspaceGroup = {
    type: 'group',
    panels: [...source],
    active: source.includes(sourceGroup.active) ? sourceGroup.active : first
  };
  const context: TargetGroupContext = { source, destination, sourceGroup, targetGroup, moving, removed, splitWeights };
  const root = mapGroups(stripped, group => {
    if (!group.panels.includes(target)) return { ...group, panels: [...group.panels] };
    return destination.position === 'tab' ? joinTargetGroup(group, context) : splitTargetGroup(group, context);
  });
  return placedLayout(layout, root);
}

function joinTargetGroup(
  group: WorkspaceGroup,
  { source, sourceGroup, targetGroup, moving, destination, removed }: TargetGroupContext
): WorkspaceGroup {
  const originalIndex = Math.min(destination.index ?? targetGroup.panels.length, targetGroup.panels.length);
  const index = originalIndex - targetGroup.panels.slice(0, originalIndex).filter(id => removed.has(id)).length;
  const panels = [...group.panels];
  panels.splice(index, 0, ...source);
  return { type: 'group', panels, active: sourceGroup === targetGroup ? sourceGroup.active : moving.active };
}

function splitTargetGroup(
  group: WorkspaceGroup,
  { moving, destination, splitWeights }: TargetGroupContext
): WorkspaceNode {
  const before = destination.position === 'left' || destination.position === 'top';
  // Preserve serialized field order when normalization retains this split wrapper.
  return {
    type: 'split',
    axis: destination.position === 'left' || destination.position === 'right' ? 'horizontal' : 'vertical',
    children: before ? [moving, group] : [group, moving],
    weights: before ? [...splitWeights] : [...splitWeights].reverse()
  };
}

function placedLayout(layout: WorkspaceLayout, root: WorkspaceNode | null): WorkspaceLayout {
  const result: WorkspaceLayout = { version: 1, root: root ? normalizeLayout(root) : null, closed: [...layout.closed] };
  const normalized = { ...layout, root: layout.root ? normalizeLayout(layout.root) : null };
  return sameWorkspaceLayout(result, normalized) ? layout : result;
}

function moveSource(layout: WorkspaceLayout, source: string[], destination: WorkspaceDestination) {
  const first = source[0];
  if (first === undefined || new Set(source).size !== source.length) return undefined;
  const sourceGroup = findGroup(layout.root, first);
  const targetGroup = findGroup(layout.root, destination.target);
  if (!sourceGroup || !targetGroup) return undefined;
  if (destination.position !== 'tab' && source.includes(destination.target)) return undefined;
  if (!validSource(sourceGroup, source) || !isValidInsertionIndex(destination.index)) return undefined;
  return { sourceGroup, targetGroup };
}

/** Retains panel placement and active preference when closing. */
export function closePanel(layout: WorkspaceLayout, id: string): WorkspaceLayout | undefined {
  if (!findGroup(layout.root, id) || layout.closed.includes(id)) return undefined;
  return { ...layout, closed: [...layout.closed, id] };
}

export function openPanel(layout: WorkspaceLayout, id: string): WorkspaceLayout | undefined {
  if (!layout.closed.includes(id)) return undefined;
  return { ...layout, closed: layout.closed.filter(panel => panel !== id) };
}

/** Retains saved panel positions when supplied panels change. */
export function reconcilePanels(layout: WorkspaceLayout, available: string[]): WorkspaceLayout {
  const saved = new Set(getPanelIds(layout.root));
  const added = available.filter(id => {
    if (saved.has(id)) return false;
    saved.add(id);
    return true;
  });
  return added.length ? { version: 1, root: appendPanels(layout.root, added), closed: [...layout.closed] } : layout;
}

/** Creates the visible arrangement while retaining the saved snapshot. */
export function projectLayout(layout: WorkspaceLayout, available: string[]): WorkspaceLayout {
  const visible = new Set(available.filter(id => !layout.closed.includes(id)));
  return {
    version: 1,
    root: mapGroups(layout.root, group => filterGroup(group, id => visible.has(id))),
    closed: []
  };
}

export function selectPanel(layout: WorkspaceLayout, id: string): WorkspaceLayout | undefined {
  if (layout.closed.includes(id)) return undefined;
  const selected = findGroup(layout.root, id);
  if (!selected || selected.active === id) return undefined;
  const root = mapGroups(layout.root, group => (group.panels.includes(id) ? { ...group, active: id } : group));
  const next = { ...layout, root };
  return sameWorkspaceLayout(next, layout) ? undefined : next;
}

export function getFullscreenWorkspaceLayout(layout: WorkspaceLayout, anchor: string | undefined) {
  const group = anchor ? findGroup(layout.root, anchor) : undefined;
  return group ? { ...layout, root: group } : undefined;
}
