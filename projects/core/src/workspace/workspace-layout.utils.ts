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

export function splitSide(
  axis: WorkspaceSplit['axis'],
  position: 'before' | 'after'
): 'left' | 'right' | 'top' | 'bottom' {
  if (axis === 'horizontal') return position === 'before' ? 'left' : 'right';
  return position === 'before' ? 'top' : 'bottom';
}

/** Converts consecutive splits on the same axis into siblings. */
export function normalizeLayout(node: WorkspaceNode): WorkspaceNode {
  if (node.type === 'group') return { ...node, panels: [...node.panels] };
  const total = node.weights.reduce((a, b) => a + b, 0);
  const children: WorkspaceNode[] = [];
  const weights: number[] = [];
  node.children.forEach((child, index) => {
    const normalized = normalizeLayout(child);
    const share = node.weights[index]! / total;
    if (!(share > 0)) throw new TypeError('Split proportions exceed the supported range');
    if (normalized.type === 'split' && normalized.axis === node.axis) {
      const sum = normalized.weights.reduce((a, b) => a + b, 0);
      normalized.children.forEach((nested, i) => {
        children.push(nested);
        weights.push((share * normalized.weights[i]!) / sum);
      });
    } else {
      children.push(normalized);
      weights.push(share);
    }
  });
  if (!weights.every(weight => Number.isFinite(weight) && weight > 0))
    throw new TypeError('Split proportions exceed the supported range');
  return { type: 'split', axis: node.axis, children, weights };
}

function splitShape(item: Record<string, unknown>): item is Record<string, unknown> & WorkspaceSplit {
  if (item.type !== 'split' || !['horizontal', 'vertical'].includes(String(item.axis))) return false;
  if (!Array.isArray(item.children) || item.children.length < 2) return false;
  if (!Array.isArray(item.weights) || item.weights.length !== item.children.length) return false;
  if (!item.weights.every(weight => typeof weight === 'number' && Number.isFinite(weight) && weight > 0)) return false;
  return Number.isFinite(item.weights.reduce((sum: number, weight: number) => sum + weight, 0));
}

/** Validates a snapshot before replacing the current arrangement. */
export function parseLayout(value: string): WorkspaceLayout {
  const data: unknown = JSON.parse(value);
  const ids = new Set<string>();
  const record = (item: unknown): item is Record<string, unknown> => typeof item === 'object' && item !== null;
  const node = (item: unknown, depth: number): item is WorkspaceNode => {
    if (depth > 64 || !record(item)) return false;
    if (item.type === 'group') {
      if (
        !Array.isArray(item.panels) ||
        !item.panels.length ||
        typeof item.active !== 'string' ||
        !item.panels.includes(item.active)
      )
        return false;
      return item.panels.every(id => {
        if (typeof id !== 'string' || !id || ids.has(id)) return false;
        ids.add(id);
        return true;
      });
    }
    if (!splitShape(item)) return false;
    return item.children.every(child => node(child, depth + 1));
  };
  if (
    !record(data) ||
    data.version !== 1 ||
    !(data.root === null || node(data.root, 0)) ||
    !Array.isArray(data.closed) ||
    !data.closed.every(id => typeof id === 'string' && ids.has(id)) ||
    new Set(data.closed).size !== data.closed.length
  )
    throw new TypeError('Invalid workspace arrangement');
  return { version: 1, root: data.root === null ? null : normalizeLayout(data.root), closed: [...data.closed] };
}

export { fitSizes, resizeSizes } from '../internal/utils/split-sizing.js';
