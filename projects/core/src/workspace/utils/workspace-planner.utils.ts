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
  findGroup,
  placePanels,
  projectLayout,
  validIndex,
  type WorkspaceDestination
} from './workspace-operations.utils.js';
import { signature, deepestCarrier, type WorkspaceLayoutProjector } from './workspace-projection.utils.js';
import { placeRegion, findWorkspaceRegion } from './workspace-region-placement.utils.js';
import { rebaseProjectedSplit } from './workspace-resize.utils.js';

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
  projectLayout?: WorkspaceLayoutProjector;
  operation: 'split' | 'order' | 'insert' | 'tab';
}

export type WorkspacePlacementPlanner = (input: PlacementInput) => WorkspacePlacementPlan | undefined;

interface PlanningEntry {
  operation: PlacementInput['operation'];
  destination: WorkspaceDestination;
  plan: WorkspacePlacementPlan | undefined;
}

interface PlanningBinding {
  layout: WorkspaceLayout;
  source: string[];
  available: string[];
  entries: PlanningEntry[];
}

/** Requires an immutable canonical layout; projection callbacks are never retained. */
export function createWorkspacePlacementPlanner(): WorkspacePlacementPlanner {
  let binding: PlanningBinding | undefined;
  return input => {
    if (!binding || !samePlanningBinding(binding, input)) {
      binding = { layout: input.layout, source: [...input.source], available: [...input.available], entries: [] };
    }
    let entry = binding.entries.find(
      candidate => candidate.operation === input.operation && sameDestination(candidate.destination, input.destination)
    );
    if (!entry) {
      const { target, position, region, index } = input.destination;
      entry = {
        operation: input.operation,
        destination: { target, position, region, index },
        plan: planBasePlacement(input)
      };
      binding.entries.push(entry);
    }
    return entry.plan;
  };
}

/** Plans one candidate from canonical preferences for allocation, admission, and commit. */
export function planWorkspacePlacement(input: PlacementInput): WorkspacePlacementPlan | undefined {
  return planBasePlacement(input);
}

function samePlanningBinding(binding: PlanningBinding, input: PlacementInput) {
  return (
    binding.layout === input.layout &&
    sameIds(binding.source, input.source) &&
    sameIds(binding.available, input.available)
  );
}

function sameIds(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function sameDestination(left: WorkspaceDestination, right: WorkspaceDestination) {
  return (
    left.target === right.target &&
    left.position === right.position &&
    left.region === right.region &&
    left.index === right.index
  );
}

function planBasePlacement(input: PlacementInput) {
  if (!validIndex(input.destination.index)) return undefined;
  return planPeerPlacement(input);
}

function planPeerPlacement(input: PlacementInput) {
  if (input.operation === 'tab') return input.destination.position === 'tab' ? localPlacement(input) : undefined;
  if (input.destination.position === 'tab') return undefined;
  if (input.operation === 'order') return reorderPeers(input);
  if (input.operation === 'insert') return reorderPeers(input) ?? planGroupInsertion(input);
  return input.destination.region ? placeRegion(input) : localPlacement(input);
}

function peerContext(input: PlacementInput) {
  const { layout, source, destination } = input;
  const group = findGroup(layout.root, source[0]);
  if (!group || !wholeGroup(group.panels, source)) return undefined;
  if (destination.position === 'tab') return undefined;
  const axis = destination.position === 'left' || destination.position === 'right' ? 'horizontal' : 'vertical';
  const visible = input.available.filter(id => !layout.closed.includes(id));
  const sourceId = source.find(id => visible.includes(id));
  if (!sourceId) return undefined;
  const projectedRoot = (input.projectLayout ?? projectLayout)(layout, visible).root;
  const target = projectedTarget(projectedRoot, destination);
  if (!target) return undefined;
  const branch = peerBranch(projectedRoot, { source: sourceId, target, axis });
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
    visible,
    projectLayout: input.projectLayout
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
  projectLayout?: WorkspaceLayoutProjector;
}): WorkspaceLayout | undefined {
  const { layout, children, reordered, visible } = input;
  const projections = new Map<WorkspaceNode, WorkspaceNode | null>();
  const project = (node: WorkspaceNode) => {
    if (!projections.has(node))
      projections.set(
        node,
        (input.projectLayout ?? projectLayout)({ version: 1, root: node, closed: [] }, visible).root
      );
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
  if (!node || node.type === 'group') return undefined;
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
  if (node.type === 'group') return node;
  return { ...node, children: node.children.map(child => replaceCarriers(child, replacements)) };
}

function placement(
  layout: WorkspaceLayout | undefined,
  destination: WorkspaceDestination
): WorkspacePlacementPlan | undefined {
  return layout ? { kind: destination.position === 'tab' ? 'tab' : 'split', layout } : undefined;
}

function wholeGroup(panels: string[], source: string[]) {
  return panels.length === source.length && panels.every((id, index) => id === source[index]);
}

function projectedTarget(root: WorkspaceNode | null, destination: WorkspaceDestination) {
  return destination.region ? findWorkspaceRegion(root, destination.region) : findGroup(root, destination.target);
}

function reorderedEntries(input: {
  branch: WorkspaceSplit;
  sourceId: string;
  targetNode: WorkspaceNode;
  destination: WorkspaceDestination;
}) {
  const { branch, sourceId, targetNode, destination } = input;
  const from = branch.children.findIndex(child => child.type === 'group' && child.panels.includes(sourceId));
  const entries = branch.children.map((child, index) => ({ child, weight: branch.weights[index]! }));
  const moving = entries.splice(from, 1)[0]!;
  const after = destination.position === 'right' || destination.position === 'bottom';
  const target = entries.findIndex(entry => signature(entry.child) === signature(targetNode));
  let index: number;
  if (targetNode === branch) {
    index = after ? entries.length : 0;
  } else {
    if (target < 0) return branch.children.map((child, slot) => ({ child, weight: branch.weights[slot]! }));
    const offset = after ? 1 : 0;
    index = target + offset;
  }
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
    node.children.some(child => child.type === 'group' && child.panels.includes(input.source ?? '')) &&
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
  const recipient = findGroup(
    (input.projectLayout ?? projectLayout)(input.layout, input.available).root,
    input.destination.target
  );
  return { ...plan, context: placementContext('recipient', recipient ?? null, input.source) };
}

function peerPlacement(layout: WorkspaceLayout, input: PlacementInput, branch: WorkspaceSplit): WorkspacePlacementPlan {
  return {
    kind: 'reorder',
    layout,
    context: placementContext('rail', branch, input.source)
  };
}
