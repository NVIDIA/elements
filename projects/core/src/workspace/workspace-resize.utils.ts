// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type WorkspaceLayout, type WorkspaceNode, type WorkspaceSplit } from './workspace-layout.utils.js';
import { projectLayout } from './workspace-operations.utils.js';

function signature(node: WorkspaceNode | null): string {
  if (!node) return 'null';
  if (node.type === 'group') return JSON.stringify(node.panels);
  return JSON.stringify([node.axis, node.children.map(signature)]);
}

function panelIds(node: WorkspaceNode | null): string[] {
  if (!node) return [];
  return node.type === 'group' ? node.panels : node.children.flatMap(panelIds);
}

function replaceBranch(
  node: WorkspaceNode,
  matches: (node: WorkspaceNode) => boolean,
  rebase: (node: WorkspaceNode) => WorkspaceNode
): WorkspaceNode {
  if (matches(node)) return rebase(node);
  if (node.type === 'group') return node;
  const children = node.children.map(child => replaceBranch(child, matches, rebase));
  return children.some((child, index) => child !== node.children[index]) ? { ...node, children } : node;
}

/** Saves visible split proportions while preserving the shares of missing panels. */
// eslint-disable-next-line max-params -- The operation accepts both saved and rendered arrangements.
export function rebaseProjectedSplit(
  layout: WorkspaceLayout,
  renderedBranch: WorkspaceSplit,
  sizes: number[],
  available: string[]
): WorkspaceLayout | undefined {
  if (
    !layout.root ||
    sizes.length !== renderedBranch.children.length ||
    !sizes.every(size => Number.isFinite(size) && size > 0) ||
    !Number.isFinite(sizes.reduce((sum, size) => sum + size, 0))
  )
    return undefined;

  const visible = available.filter(id => !layout.closed.includes(id));
  const projections = new Map<WorkspaceNode, WorkspaceNode | null>();
  const project = (node: WorkspaceNode): WorkspaceNode | null => {
    if (!projections.has(node))
      projections.set(node, projectLayout({ version: 1, root: node, closed: [] }, visible).root);
    return projections.get(node) ?? null;
  };
  const renderedSignature = signature(renderedBranch);
  const childSignatures = new Set(renderedBranch.children.map(signature));
  const allocations = new Map<string, number>();
  renderedBranch.children.forEach((child, index) => {
    panelIds(child).forEach(id => allocations.set(id, index));
  });
  const mass = (node: WorkspaceNode): number => {
    const groups = new Set(
      panelIds(project(node)).flatMap(id => {
        const group = allocations.get(id);
        return group === undefined ? [] : [group];
      })
    );
    return [...groups].reduce((sum, group) => sum + (sizes[group] ?? 0), 0);
  };
  const rebase = (node: WorkspaceNode): WorkspaceNode => {
    if (node.type === 'group' || childSignatures.has(signature(project(node)))) return node;
    const children = node.children.map(child => rebase(child));
    const weights = rebaseWeights(node, mass, renderedBranch.axis);
    if (weights === node.weights && children.every((child, index) => child === node.children[index])) return node;
    return { ...node, weights, children };
  };
  const root = replaceBranch(layout.root, node => signature(project(node)) === renderedSignature, rebase);
  return root === layout.root ? undefined : { version: 1, root, closed: [...layout.closed] };
}

function rebaseWeights(
  node: WorkspaceSplit,
  mass: (node: WorkspaceNode) => number,
  axis: WorkspaceSplit['axis']
): number[] {
  if (node.axis !== axis) return node.weights;
  const masses = node.children.map(mass);
  const totalMass = masses.reduce((sum, value) => sum + value, 0);
  if (!totalMass) return node.weights;
  const visibleShare = node.weights.reduce((sum, weight, index) => sum + ((masses[index] ?? 0) > 0 ? weight : 0), 0);
  const weights = node.weights.map((weight, index) => {
    const childMass = masses[index] ?? 0;
    return childMass > 0 ? visibleShare * (childMass / totalMass) : weight;
  });
  return weights.every((weight, index) => {
    const previous = node.weights[index] ?? 0;
    return Math.abs(weight - previous) <= 1e-12 * Math.max(weight, previous);
  })
    ? node.weights
    : weights;
}
