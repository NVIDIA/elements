// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { normalizeLayout } from './layout.utils.js';
import { sameArrayItems } from '../comparison.utils.js';

import type { WorkspaceLayout, WorkspaceNode, WorkspaceSplit } from './layout.utils.js';

export function parseWorkspaceValue(value: string): WorkspaceLayout | undefined {
  if (!value) return undefined;

  const data: unknown = JSON.parse(value);
  const ids = new Set<string>();
  const record = (item: unknown): item is Record<string, unknown> => typeof item === 'object' && item !== null;
  const node = (item: unknown): item is WorkspaceNode => {
    if (!record(item)) return false;
    if (item.type === 'group') {
      if (
        !Array.isArray(item.panels) ||
        !item.panels.length ||
        typeof item.active !== 'string' ||
        !item.panels.includes(item.active)
      ) {
        return false;
      }
      return item.panels.every(id => {
        if (typeof id !== 'string' || !id || ids.has(id)) return false;
        ids.add(id);
        return true;
      });
    }
    if (!splitShape(item)) return false;
    return item.children.every(child => node(child));
  };
  if (
    !record(data) ||
    data.version !== 1 ||
    !(data.root === null || node(data.root)) ||
    !Array.isArray(data.closed) ||
    !data.closed.every(id => typeof id === 'string' && ids.has(id)) ||
    new Set(data.closed).size !== data.closed.length
  ) {
    throw new TypeError('Invalid workspace arrangement');
  }
  return { version: 1, root: data.root === null ? null : normalizeLayout(data.root), closed: [...data.closed] };
}

export function serializeWorkspaceValue(layout: WorkspaceLayout | undefined): string {
  return layout ? JSON.stringify(layout) : '';
}

function splitShape(item: Record<string, unknown>): item is Record<string, unknown> & WorkspaceSplit {
  if (item.type !== 'split' || !['horizontal', 'vertical'].includes(String(item.axis))) return false;
  if (!Array.isArray(item.children) || item.children.length < 2) return false;
  if (!Array.isArray(item.weights) || item.weights.length !== item.children.length) return false;
  if (!item.weights.every(weight => typeof weight === 'number' && Number.isFinite(weight) && weight > 0)) return false;
  return Number.isFinite(item.weights.reduce((sum: number, weight: number) => sum + weight, 0));
}

/** Compares known arrangement fields; object property insertion order is irrelevant. */
export function sameWorkspaceLayout(left: WorkspaceLayout | undefined, right: WorkspaceLayout | undefined): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  return (
    left.version === right.version &&
    sameArrayItems(left.closed, right.closed) &&
    sameWorkspaceNode(left.root, right.root)
  );
}

// eslint-disable-next-line complexity -- Compare the owned node fields directly without comparison callbacks.
export function sameWorkspaceNode(left: WorkspaceNode | null, right: WorkspaceNode | null): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  if (left.type === 'group') {
    return right.type === 'group' && left.active === right.active && sameArrayItems(left.panels, right.panels);
  }
  if (
    right.type !== 'split' ||
    left.axis !== right.axis ||
    !sameArrayItems(left.weights, right.weights) ||
    left.children.length !== right.children.length
  )
    return false;
  for (let index = 0; index < left.children.length; index++) {
    if (!sameWorkspaceNode(left.children[index]!, right.children[index]!)) return false;
  }
  return true;
}
