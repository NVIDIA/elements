// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getPanelIds } from './layout.utils.js';
import { projectLayout } from './operations.utils.js';

import type { WorkspaceLayout, WorkspaceNode, WorkspaceSplit } from './layout.utils.js';
export type WorkspaceLayoutProjector = (layout: WorkspaceLayout, available: string[]) => WorkspaceLayout;

export function createWorkspaceLayoutProjector(): WorkspaceLayoutProjector {
  const domains: {
    available: string[];
    closed: string[];
    roots: Map<WorkspaceNode | null, WorkspaceLayout>;
  }[] = [];
  return (layout, available) => {
    let domain = domains.find(entry => sameIds(entry.available, available) && sameIds(entry.closed, layout.closed));
    if (!domain) {
      domain = { available, closed: layout.closed, roots: new Map() };
      domains.push(domain);
    }
    let projectedLayout = domain.roots.get(layout.root);
    if (!projectedLayout) {
      projectedLayout = projectLayout(layout, available);
      domain.roots.set(layout.root, projectedLayout);
    }
    return projectedLayout;
  };
}

export function getProjectionSignature(node: WorkspaceNode | null): string {
  if (!node) return 'null';
  return node.type === 'group'
    ? JSON.stringify(node.panels)
    : JSON.stringify([node.axis, node.children.map(getProjectionSignature)]);
}

export function findDeepestProjectionCarrier(
  node: WorkspaceNode | null,
  expected: string,
  project: (node: WorkspaceNode) => WorkspaceNode | null
): WorkspaceNode | undefined {
  if (!node) return undefined;
  if (node.type === 'split') {
    for (const child of node.children) {
      const found = findDeepestProjectionCarrier(child, expected, project);
      if (found) return found;
    }
  }
  return getProjectionSignature(project(node)) === expected ? node : undefined;
}

/** Saves visible split proportions while preserving the shares of missing panels. */
// eslint-disable-next-line max-params -- The operation accepts saved and rendered arrangements with scoped projection.
export function rebaseProjectedSplit(
  layout: WorkspaceLayout,
  renderedBranch: WorkspaceSplit,
  sizes: number[],
  available: string[],
  projectLayoutForCandidate?: WorkspaceLayoutProjector
): WorkspaceLayout | undefined {
  if (!layout.root || !validSplitSizes(renderedBranch, sizes)) return undefined;

  const visible = available.filter(id => !layout.closed.includes(id));
  const projections = new Map<WorkspaceNode, WorkspaceNode | null>();
  const project = (node: WorkspaceNode): WorkspaceNode | null => {
    if (!projections.has(node)) {
      projections.set(
        node,
        (projectLayoutForCandidate ?? projectLayout)({ version: 1, root: node, closed: [] }, visible).root
      );
    }
    return projections.get(node) ?? null;
  };
  const renderedSignature = getProjectionSignature(renderedBranch);
  const childSignatures = new Set(renderedBranch.children.map(getProjectionSignature));
  const allocations = new Map<string, number>();
  renderedBranch.children.forEach((child, index) => {
    getPanelIds(child).forEach(id => allocations.set(id, index));
  });
  const mass = (node: WorkspaceNode): number => {
    const groups = new Set(
      getPanelIds(project(node)).flatMap(id => {
        const group = allocations.get(id);
        return group === undefined ? [] : [group];
      })
    );
    return [...groups].reduce((sum, group) => sum + (sizes[group] ?? 0), 0);
  };
  const rebase = (node: WorkspaceNode): WorkspaceNode => {
    if (node.type === 'group' || childSignatures.has(getProjectionSignature(project(node)))) return node;
    const children = node.children.map(child => rebase(child));
    const weights = rebaseWeights(node, mass, renderedBranch.axis);
    if (weights === node.weights && children.every((child, index) => child === node.children[index])) return node;
    return { ...node, weights, children };
  };
  const root = replaceBranch(layout.root, node => getProjectionSignature(project(node)) === renderedSignature, rebase);
  return root === layout.root ? undefined : { version: 1, root, closed: [...layout.closed] };
}

function sameIds(left: string[], right: string[]) {
  return left === right || (left.length === right.length && left.every((id, index) => id === right[index]));
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

function validSplitSizes(branch: WorkspaceSplit, sizes: number[]) {
  return (
    sizes.length === branch.children.length &&
    sizes.every(size => Number.isFinite(size) && size > 0) &&
    Number.isFinite(sizes.reduce((sum, size) => sum + size, 0))
  );
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
