// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { splitSide, type WorkspaceLayout, type WorkspaceNode, type WorkspaceSplit } from './workspace-layout.utils.js';
import { detachedLayout, projectLayout, type WorkspaceDestination } from './workspace-operations.utils.js';
import type { WorkspacePlacementPlan } from './workspace-planner.utils.js';
import { deepestCarrier, signature } from './workspace-projection.utils.js';
import { findWorkspaceRegion, placeRegion } from './workspace-region-placement.utils.js';
import { rebaseProjectedSplit } from './workspace-resize.utils.js';

interface InsertionInput {
  layout: WorkspaceLayout;
  source: string[];
  destination: WorkspaceDestination;
  available: string[];
}

const ids = (node: WorkspaceNode): string[] => (node.type === 'pane' ? node.panels : node.children.flatMap(ids));

/** Inserts one carrier at a canonical owner slot with an explicit allocation policy. */
export function planGroupInsertion(input: InsertionInput): WorkspacePlacementPlan | undefined {
  const context = insertionContext(input);
  if (!context) return undefined;
  const topology = insertionTopology(input, context);
  return topology ? sizeInsertion({ input, context, topology }) : undefined;
}

function insertionTopology(input: InsertionInput, context: NonNullable<ReturnType<typeof insertionContext>>) {
  const { peers, slot, visible, root, axis } = context;
  const donorIndex = Math.min(slot, peers.length - 1);
  const donor = peers[donorIndex]!;
  const carrier = deepestCarrier(
    root,
    signature(donor.node),
    node => projectLayout(detachedLayout({ version: 1, root: node, closed: [] }, input.source), visible).root
  );
  const key = carrier && nodeKey(root, carrier);
  if (!key || !carrier) return undefined;
  const before = slot < peers.length;
  const destination: WorkspaceDestination = {
    target: ids(carrier)[0]!,
    region: key,
    position: splitSide(axis, before ? 'before' : 'after')
  };
  const topology = placeRegion({ ...input, destination });
  return topology;
}

function sizeInsertion({
  input,
  context,
  topology
}: {
  input: InsertionInput;
  context: NonNullable<ReturnType<typeof insertionContext>>;
  topology: WorkspacePlacementPlan;
}): WorkspacePlacementPlan | undefined {
  const { owner, peers, visible, axis } = context;
  const projected = projectLayout(topology.layout, visible).root;
  const moving = input.source.filter(id => visible.includes(id));
  const branch = movingOwner(projected, moving);
  if (!branch || branch.axis !== axis || branch.children.length !== peers.length + 1) return undefined;
  const weights = insertedWeights({
    branch,
    peers,
    moving
  });
  if (!weights) return undefined;
  const layout = insertionWeights({ layout: topology.layout, branch, weights, available: input.available });
  if (!layout) return undefined;
  return { kind: 'insert', layout, context: { kind: 'rail', members: [...new Set([...ids(owner), ...moving])] } };
}

function insertionBasis(input: InsertionInput) {
  const { destination, layout } = input;
  if (!destination.region || destination.position === 'tab') return undefined;
  const visible = input.available.filter(id => !layout.closed.includes(id));
  const root = projectLayout(layout, visible).root;
  const target = findWorkspaceRegion(root, destination.region);
  if (!root || !target) return undefined;
  const axis: WorkspaceSplit['axis'] =
    destination.position === 'left' || destination.position === 'right' ? 'horizontal' : 'vertical';
  const owner = insertionOwner({ root, target, key: destination.region, axis });
  if (!owner) return undefined;
  return {
    visible,
    root,
    target,
    axis,
    owner
  };
}

function insertionOwner(input: {
  root: WorkspaceNode;
  target: WorkspaceNode;
  key: string;
  axis: WorkspaceSplit['axis'];
}) {
  if (input.target.type === 'split' && input.target.axis === input.axis) return input.target;
  const parent = findWorkspaceRegion(input.root, input.key.split('.').slice(0, -1).join('.'));
  if (parent?.type === 'split' && parent.axis === input.axis) return parent;
  return input.target.type === 'split' ? input.target : undefined;
}

function insertionContext(input: InsertionInput) {
  const basis = insertionBasis(input);
  if (!basis) return undefined;
  const { owner, target, axis } = basis;
  const residual = detachedLayout({ version: 1, root: owner, closed: [] }, input.source).root;
  if (!residual) return undefined;
  const peers =
    residual.type === 'split' && residual.axis === axis
      ? residual.children.map((node, index) => ({ node, weight: residual.weights[index]! }))
      : [{ node: residual, weight: 1 }];
  const selected = new Set(ids(target).filter(id => !input.source.includes(id)));
  const matches = peers.flatMap((peer, index) => (ids(peer.node).every(id => selected.has(id)) ? [index] : []));
  if (!matches.length) return undefined;
  const before = input.destination.position === 'left' || input.destination.position === 'top';
  return { ...basis, peers, slot: before ? matches[0]! : matches.at(-1)! + 1 };
}

function insertedWeights(input: {
  branch: WorkspaceSplit;
  peers: { node: WorkspaceNode; weight: number }[];
  moving: string[];
}) {
  const incoming = input.peers.reduce((sum, peer) => sum + peer.weight, 0) / input.peers.length;
  const weights = input.branch.children.map(child => {
    if (child.type === 'pane' && child.panels.every(id => input.moving.includes(id))) return incoming;
    const index = input.peers.findIndex(peer => signature(peer.node) === signature(child));
    if (index < 0) return undefined;
    const weight = input.peers[index]!.weight;
    return weight;
  });
  return weights.every((weight): weight is number => weight !== undefined) ? weights : undefined;
}

function movingOwner(node: WorkspaceNode | null, moving: string[]): WorkspaceSplit | undefined {
  if (node?.type !== 'split') return undefined;
  if (
    node.children.some(
      child => child.type === 'pane' && child.panels.length > 0 && child.panels.every(id => moving.includes(id))
    )
  )
    return node;
  for (const child of node.children) {
    const found = movingOwner(child, moving);
    if (found) return found;
  }
  return undefined;
}

function nodeKey(node: WorkspaceNode, target: WorkspaceNode, key = 'root'): string | undefined {
  if (node === target) return key;
  if (node.type !== 'split') return undefined;
  for (const [index, child] of node.children.entries()) {
    const found = nodeKey(child, target, `${key}.${index}`);
    if (found) return found;
  }
  return undefined;
}

function insertionWeights(input: {
  layout: WorkspaceLayout;
  branch: WorkspaceSplit;
  weights: number[];
  available: string[];
}) {
  const rebased = rebaseProjectedSplit(input.layout, input.branch, input.weights, input.available);
  if (rebased) return rebased;
  const total = input.weights.reduce((sum, weight) => sum + weight, 0);
  return input.branch.weights.every((weight, index) => Math.abs(weight - input.weights[index]! / total) < 1e-10)
    ? input.layout
    : undefined;
}

/** Describes the actual normalized owner slot of an evaluated insertion or reorder. */
export function describePlacementSlot(input: {
  plan: Pick<WorkspacePlacementPlan, 'layout'>;
  source: string[];
  available: string[];
}) {
  const visible = input.available.filter(id => !input.plan.layout.closed.includes(id));
  const moving = input.source.filter(id => visible.includes(id));
  const owner = movingOwner(projectLayout(input.plan.layout, visible).root, moving);
  if (!owner) return undefined;
  const index = owner.children.findIndex(
    child => child.type === 'pane' && child.panels.every(id => moving.includes(id))
  );
  if (index < 0) return undefined;
  return {
    axis: owner.axis,
    index,
    members: ids(owner).filter(id => !moving.includes(id)),
    previous: owner.children[index - 1] ? ids(owner.children[index - 1]!) : undefined,
    next: owner.children[index + 1] ? ids(owner.children[index + 1]!) : undefined,
    key: JSON.stringify([owner.axis, index, placementShape(input.plan.layout.root), input.plan.layout.closed])
  };
}

function placementShape(node: WorkspaceNode | null): unknown {
  if (!node) return null;
  return node.type === 'pane' ? ['pane', node.panels, node.active] : [node.axis, node.children.map(placementShape)];
}
