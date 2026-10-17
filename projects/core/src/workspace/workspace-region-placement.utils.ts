// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { placementContext } from './workspace-context.utils.js';
import {
  normalizeLayout,
  type WorkspaceLayout,
  type WorkspaceNode,
  type WorkspaceGroup,
  type WorkspaceSplit
} from './workspace-layout.utils.js';
import { findGroup, projectLayout, type WorkspaceDestination } from './workspace-operations.utils.js';
import type { WorkspacePlacementPlan } from './workspace-planner.utils.js';
import { signature, deepestCarrier } from './workspace-projection.utils.js';

interface WorkspaceRegionPlacementInput {
  layout: WorkspaceLayout;
  source: string[];
  destination: WorkspaceDestination;
  available: string[];
}

/** Resolves an ephemeral path in a visible arrangement, before source removal. */
export function findWorkspaceRegion(root: WorkspaceNode | null, key: string): WorkspaceNode | undefined {
  const parts = key.split('.');
  if (parts.shift() !== 'root') return undefined;
  let node = root;
  for (const part of parts) {
    if (!node || node.type !== 'split' || !/^\d+$/.test(part)) return undefined;
    node = node.children[Number(part)] ?? null;
  }
  return node ?? undefined;
}

export function placeRegion(input: WorkspaceRegionPlacementInput): WorkspacePlacementPlan | undefined {
  const context = regionContext(input);
  if (!context) return undefined;
  const { layout, source, sourceGroup, visible, carrier, region, position, root: canonicalRoot } = context;
  const contextRegion = placementContext('recipient', region, source);
  const removed = new Set(source);
  const moving: WorkspaceGroup = {
    type: 'group',
    panels: [...source],
    active: source.includes(sourceGroup.active) ? sourceGroup.active : source[0]!
  };
  const residual = stripRegion(carrier, removed);
  if (!residual || !projectLayout({ version: 1, root: residual, closed: [] }, visible).root)
    return { kind: 'reorder', layout, context: contextRegion };
  const before = position === 'left' || position === 'top';
  const replacement: WorkspaceSplit = {
    type: 'split',
    axis: position === 'left' || position === 'right' ? 'horizontal' : 'vertical',
    children: before ? [moving, residual] : [residual, moving],
    weights: [0.5, 0.5]
  };
  const root = editRegion(canonicalRoot, { carrier, replacement, removed });
  return root
    ? { kind: 'split', layout: { ...layout, root: normalizeLayout(root) }, context: contextRegion }
    : undefined;
}

function rebuild(node: WorkspaceSplit, mapped: (WorkspaceNode | null)[]): WorkspaceNode | null {
  const children = mapped.flatMap(child => (child ? [child] : []));
  if (!children.length) return null;
  if (children.length === 1) return children[0]!;
  return { ...node, children, weights: node.weights.filter((_, index) => mapped[index]) };
}

function regionSource(layout: WorkspaceLayout, source: string[]): WorkspaceGroup | undefined {
  const group = findGroup(layout.root, source[0]);
  if (!group || new Set(source).size !== source.length || !source.every(id => group.panels.includes(id)))
    return undefined;
  if (source.length === 1) return group;
  return wholeGroup(group, source) ? group : undefined;
}

function wholeGroup(group: WorkspaceGroup, source: string[]): boolean {
  return group.panels.length === source.length && group.panels.every((id, index) => id === source[index]);
}

function regionCarrier(layout: WorkspaceLayout, key: string, visible: string[]) {
  const region = findWorkspaceRegion(projectLayout(layout, visible).root, key);
  if (!region) return undefined;
  const carrier = deepestCarrier(
    layout.root,
    signature(region),
    node => projectLayout({ version: 1, root: node, closed: [] }, visible).root
  );
  return carrier ? { carrier, region } : undefined;
}

function stripRegion(node: WorkspaceNode, removed: Set<string>): WorkspaceNode | null {
  if (node.type === 'split')
    return rebuild(
      node,
      node.children.map(child => stripRegion(child, removed))
    );
  const panels = node.panels.filter(id => !removed.has(id));
  if (!panels.length) return null;
  return { ...node, panels, active: panels.includes(node.active) ? node.active : panels[0]! };
}

function editRegion(
  node: WorkspaceNode,
  input: { carrier: WorkspaceNode; replacement: WorkspaceNode; removed: Set<string> }
): WorkspaceNode | null {
  if (node === input.carrier) return input.replacement;
  if (node.type === 'group') return stripRegion(node, input.removed);
  return rebuild(
    node,
    node.children.map(child => editRegion(child, input))
  );
}

function regionContext(input: WorkspaceRegionPlacementInput) {
  const { layout, source, destination } = input;
  if (!layout.root || !destination.region || destination.position === 'tab' || !source.length) return undefined;
  const sourceGroup = regionSource(layout, source);
  if (!sourceGroup) return undefined;
  const visible = input.available.filter(id => !layout.closed.includes(id));
  const recipient = regionCarrier(layout, destination.region, visible);
  if (!recipient) return undefined;
  return { layout, source, sourceGroup, visible, ...recipient, position: destination.position, root: layout.root };
}
