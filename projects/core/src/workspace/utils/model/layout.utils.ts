// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type WorkspaceNode = WorkspaceGroup | WorkspaceSplit;

export interface WorkspaceGroup {
  type: 'group';
  panels: string[];
  active: string;
}

export interface WorkspaceSplit {
  type: 'split';
  axis: 'horizontal' | 'vertical';
  weights: number[];
  children: WorkspaceNode[];
}

export interface WorkspaceLayout {
  version: 1;
  root: WorkspaceNode | null;
  closed: string[];
}

export function getPanelIds(node: WorkspaceNode | null): string[] {
  if (!node) return [];
  return node.type === 'group' ? node.panels : node.children.flatMap(getPanelIds);
}

export function getSplitSide(
  axis: WorkspaceSplit['axis'],
  position: 'before' | 'after'
): 'left' | 'right' | 'top' | 'bottom' {
  if (axis === 'horizontal') return position === 'before' ? 'left' : 'right';
  return position === 'before' ? 'top' : 'bottom';
}

/** Converts consecutive splits on the same axis into siblings. */
export function normalizeLayout(node: WorkspaceNode): WorkspaceNode {
  return normalizeNode(node, 'copy');
}

export function normalizeOwnedLayout(node: WorkspaceNode): WorkspaceNode {
  return normalizeNode(node, 'owned');
}

function normalizeNode(node: WorkspaceNode, ownership: 'copy' | 'owned'): WorkspaceNode {
  if (node.type === 'group') return ownership === 'copy' ? { ...node, panels: [...node.panels] } : node;
  const total = node.weights.reduce((a, b) => a + b, 0);
  const children: WorkspaceNode[] = [];
  let weights: number[] | undefined = ownership === 'copy' ? [] : undefined;
  node.children.forEach((child, index) => {
    const normalized = normalizeNode(child, ownership);
    const share = node.weights[index]! / total;
    if (!(share > 0)) throw new TypeError('Split proportions exceed the supported range');
    if (normalized.type === 'split' && normalized.axis === node.axis) {
      const shares = (weights ??= node.weights.slice(0, index));
      const sum = normalized.weights.reduce((a, b) => a + b, 0);
      normalized.children.forEach((nested, i) => {
        children.push(nested);
        shares.push((share * normalized.weights[i]!) / sum);
      });
    } else {
      if (!weights && share !== node.weights[index]) {
        weights = node.weights.slice(0, index);
      }
      children.push(normalized);
      weights?.push(share);
    }
  });
  const normalizedWeights = weights ?? node.weights;
  if (!normalizedWeights.every(weight => Number.isFinite(weight) && weight > 0))
    throw new TypeError('Split proportions exceed the supported range');
  return { type: 'split', axis: node.axis, children, weights: normalizedWeights };
}
