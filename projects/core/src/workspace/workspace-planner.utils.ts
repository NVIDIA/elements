// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { placementContext, type WorkspacePlacementContext } from './workspace-context.utils.js';
import { planGroupInsertion } from './workspace-group-insertion.utils.js';
import {
  normalizeLayout,
  type WorkspaceLayout,
  type WorkspaceNode,
  type WorkspaceSplit
} from './workspace-layout.utils.js';
import {
  findPane,
  placePanels,
  projectLayout,
  validIndex,
  type WorkspaceDestination
} from './workspace-operations.utils.js';
import { signature, deepestCarrier } from './workspace-projection.utils.js';
import { placeRegion, findWorkspaceRegion } from './workspace-region-placement.utils.js';
import { rebaseProjectedSplit } from './workspace-resize.utils.js';
import { sizePreferredSplit, type WorkspaceSplitPreference } from './workspace-split-sizing.utils.js';

export interface WorkspacePlacementPlan {
  kind: 'reorder' | 'split' | 'tab' | 'insert';
  context?: WorkspacePlacementContext;
  layout: WorkspaceLayout;
}

interface PlacementInput {
  layout: WorkspaceLayout;
  source: string[];
  destination: WorkspaceDestination;
  available: string[];
  preference?: WorkspaceSplitPreference;
  operation: 'split' | 'order' | 'insert' | 'tab';
}

/** Plans one candidate from canonical preferences for allocation, admission, and commit. */
export function planWorkspacePlacement(input: PlacementInput): WorkspacePlacementPlan | undefined {
  if (!validIndex(input.destination.index)) return undefined;
  return planPeerPlacement(input);
}

function planPeerPlacement(input: PlacementInput) {
  if (input.operation === 'tab') return input.destination.position === 'tab' ? localPlacement(input) : undefined;
  if (input.destination.position === 'tab') return undefined;
  if (input.operation === 'order') return reorderPeers(input);
  if (input.operation === 'insert') return reorderPeers(input) ?? planGroupInsertion(input);
  const plan = input.destination.region ? placeRegion(input) : localPlacement(input);
  return plan
    ? sizePreferredSplit({ plan, preference: input.preference, source: input.source, available: input.available })
    : undefined;
}

function peerContext(input: PlacementInput) {
  const { layout, source, destination } = input;
  const pane = findPane(layout.root, source[0]);
  if (!pane || !wholePane(pane.panels, source)) return undefined;
  if (destination.position === 'tab') return undefined;
  const axis = destination.position === 'left' || destination.position === 'right' ? 'horizontal' : 'vertical';
  const visible = input.available.filter(id => !layout.closed.includes(id));
  const sourceId = source.find(id => visible.includes(id));
  if (!sourceId) return undefined;
  const projected = projectLayout(layout, visible).root;
  const target = projectedTarget(projected, destination);
  if (!target) return undefined;
  const branch = peerBranch(projected, { source: sourceId, target, axis });
  return branch ? { branch, visible, sourceId, target } : undefined;
}

function reorderPeers(input: PlacementInput): WorkspacePlacementPlan | undefined {
  const context = peerContext(input);
  if (!context) return undefined;
  const { branch, visible, sourceId, target: targetNode } = context;
  const { layout, destination } = input;
  if (!destination.region && input.source.includes(destination.target)) return peerPlacement(layout, input, branch);
  const entries = reorderedEntries({ branch, sourceId, targetNode, destination });
  if (entries.every((entry, index) => entry.child === branch.children[index]))
    return peerPlacement(layout, input, branch);
  const candidate = permuteCarriers({
    layout,
    children: branch.children,
    reordered: entries.map(entry => entry.child),
    visible
  });
  if (!candidate) return undefined;
  const reordered = { ...branch, children: entries.map(entry => entry.child) };
  return peerPlacement(
    rebaseProjectedSplit(
      candidate,
      reordered,
      entries.map(entry => entry.weight),
      input.available
    ) ?? candidate,
    input,
    branch
  );
}

function permuteCarriers(input: {
  layout: WorkspaceLayout;
  children: WorkspaceNode[];
  reordered: WorkspaceNode[];
  visible: string[];
}): WorkspaceLayout | undefined {
  const { layout, children, reordered, visible } = input;
  const projections = new Map<WorkspaceNode, WorkspaceNode | null>();
  const project = (node: WorkspaceNode) => {
    if (!projections.has(node))
      projections.set(node, projectLayout({ version: 1, root: node, closed: [] }, visible).root);
    return projections.get(node) ?? null;
  };
  const carriers = children.map(child => deepestCarrier(layout.root, signature(child), project));
  if (carriers.some(carrier => !carrier)) return undefined;
  const replacements = new Map<WorkspaceNode, WorkspaceNode>();
  carriers.forEach((slot, index) => replacements.set(slot!, carriers[children.indexOf(reordered[index]!)]!));
  const root = normalizeLayout(replaceCarriers(layout.root!, replacements));
  return root ? { ...layout, root } : undefined;
}

function peerBranch(
  node: WorkspaceNode | null,
  input: { source?: string; target: WorkspaceNode; axis: WorkspaceSplit['axis'] }
): WorkspaceSplit | undefined {
  if (!node || node.type === 'pane') return undefined;
  if (matchesPeers(node, input)) return node;
  for (const child of node.children) {
    const found = peerBranch(child, input);
    if (found) return found;
  }
  return undefined;
}

function replaceCarriers(node: WorkspaceNode, replacements: Map<WorkspaceNode, WorkspaceNode>): WorkspaceNode {
  const payload = replacements.get(node);
  if (payload) return payload;
  if (node.type === 'pane') return node;
  return { ...node, children: node.children.map(child => replaceCarriers(child, replacements)) };
}

function placement(
  layout: WorkspaceLayout | undefined,
  destination: WorkspaceDestination
): WorkspacePlacementPlan | undefined {
  return layout ? { kind: destination.position === 'tab' ? 'tab' : 'split', layout } : undefined;
}

function wholePane(panels: string[], source: string[]) {
  return panels.length === source.length && panels.every((id, index) => id === source[index]);
}

function projectedTarget(root: WorkspaceNode | null, destination: WorkspaceDestination) {
  return destination.region ? findWorkspaceRegion(root, destination.region) : findPane(root, destination.target);
}

function reorderedEntries(input: {
  branch: WorkspaceSplit;
  sourceId: string;
  targetNode: WorkspaceNode;
  destination: WorkspaceDestination;
}) {
  const { branch, sourceId, targetNode, destination } = input;
  const from = branch.children.findIndex(child => child.type === 'pane' && child.panels.includes(sourceId));
  const entries = branch.children.map((child, index) => ({ child, weight: branch.weights[index]! }));
  const moving = entries.splice(from, 1)[0]!;
  const after = destination.position === 'right' || destination.position === 'bottom';
  const target = entries.findIndex(entry => signature(entry.child) === signature(targetNode));
  const index = targetNode === branch ? (after ? entries.length : 0) : target + Number(after);
  if (targetNode !== branch && target < 0)
    return branch.children.map((child, slot) => ({ child, weight: branch.weights[slot]! }));
  entries.splice(index, 0, moving);
  return entries;
}

function matchesPeers(
  node: WorkspaceSplit,
  input: { source?: string; target: WorkspaceNode; axis: WorkspaceSplit['axis'] }
) {
  return (
    node.axis === input.axis &&
    node.children.length > 1 &&
    node.children.some(child => child.type === 'pane' && child.panels.includes(input.source ?? '')) &&
    (signature(node) === signature(input.target) ||
      node.children.some(child => signature(child) === signature(input.target)))
  );
}

function localCandidate(input: PlacementInput): WorkspacePlacementPlan | undefined {
  const { layout, source, destination } = input;
  const candidate = placePanels({ layout, source, destination });
  return candidate ? placement(candidate, destination) : undefined;
}

function localPlacement(input: PlacementInput): WorkspacePlacementPlan | undefined {
  const plan = localCandidate(input);
  if (!plan) return plan;
  const recipient = findPane(projectLayout(input.layout, input.available).root, input.destination.target);
  return { ...plan, context: placementContext('recipient', recipient ?? null, input.source) };
}

function peerPlacement(layout: WorkspaceLayout, input: PlacementInput, branch: WorkspaceSplit): WorkspacePlacementPlan {
  return {
    kind: 'reorder',
    layout,
    context: placementContext('rail', branch, input.source)
  };
}
