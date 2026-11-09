// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getPanelIds } from './layout.utils.js';
import { findGroup, projectLayout } from './operations.utils.js';
import { sameArrayItems } from '../comparison.utils.js';

import type { WorkspaceLayout, WorkspaceNode, WorkspaceSplit } from './layout.utils.js';
export type WorkspaceLayoutProjector = (layout: WorkspaceLayout, available: string[]) => WorkspaceLayout;

const reusableLayoutProjectors = new WeakSet<WorkspaceLayoutProjector>();

export function createWorkspaceLayoutProjector(): WorkspaceLayoutProjector {
  const domains: {
    available: string[];
    closed: string[];
    roots: Map<WorkspaceNode | null, WorkspaceLayout>;
  }[] = [];
  const projector: WorkspaceLayoutProjector = (layout, available) => {
    let domain = domains.find(
      entry => sameArrayItems(entry.available, available) && sameArrayItems(entry.closed, layout.closed)
    );
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
  reusableLayoutProjectors.add(projector);
  return projector;
}

export function canReuseLayoutProjection(projector: WorkspaceLayoutProjector | undefined) {
  return projector === undefined || reusableLayoutProjectors.has(projector);
}

/** Compares visible topology and panel order, independently of weights and active selection. */
// eslint-disable-next-line complexity -- Compare node fields directly without allocating comparison callbacks.
export function sameProjectionShape(left: WorkspaceNode | null, right: WorkspaceNode | null): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  if (left.type === 'group') return right.type === 'group' && sameArrayItems(left.panels, right.panels);
  if (right.type !== 'split' || left.axis !== right.axis || left.children.length !== right.children.length)
    return false;
  for (let index = 0; index < left.children.length; index++) {
    if (!sameProjectionShape(left.children[index]!, right.children[index]!)) return false;
  }
  return true;
}

export function findDeepestProjectionCarrier(
  node: WorkspaceNode | null,
  expected: WorkspaceNode | null,
  project: (node: WorkspaceNode) => WorkspaceNode | null
): WorkspaceNode | undefined {
  if (!node) return undefined;
  if (node.type === 'split') {
    for (const child of node.children) {
      const found = findDeepestProjectionCarrier(child, expected, project);
      if (found) return found;
    }
  }
  return sameProjectionShape(project(node), expected) ? node : undefined;
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
  const childIndexByPanel = new Map<string, number>();
  renderedBranch.children.forEach((child, index) => {
    getPanelIds(child).forEach(id => childIndexByPanel.set(id, index));
  });
  const mass = (node: WorkspaceNode): number => {
    const childIndices = new Set(
      getPanelIds(project(node)).flatMap(id => {
        const childIndex = childIndexByPanel.get(id);
        return childIndex === undefined ? [] : [childIndex];
      })
    );
    return [...childIndices].reduce((sum, childIndex) => sum + (sizes[childIndex] ?? 0), 0);
  };
  const rebase = (node: WorkspaceNode): WorkspaceNode => {
    if (node.type === 'group') return node;
    const projected = project(node);
    const anchor = findGroup(projected)?.panels[0];
    const childIndex = anchor === undefined ? undefined : childIndexByPanel.get(anchor);
    const renderedChild = childIndex === undefined ? undefined : renderedBranch.children[childIndex];
    if (renderedChild && sameProjectionShape(projected, renderedChild)) return node;
    const children = node.children.map(child => rebase(child));
    const weights = rebaseWeights(node, mass, renderedBranch.axis);
    if (weights === node.weights && children.every((child, index) => child === node.children[index])) return node;
    return { ...node, weights, children };
  };
  const root = replaceBranch(layout.root, node => sameProjectionShape(project(node), renderedBranch), rebase);
  return root === layout.root ? undefined : { version: 1, root, closed: [...layout.closed] };
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
