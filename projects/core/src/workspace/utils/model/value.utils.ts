// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { normalizeLayout } from './layout.utils.js';

import type { WorkspaceGroup, WorkspaceLayout, WorkspaceNode, WorkspaceSplit } from './layout.utils.js';

const layoutKeys = ['version', 'root', 'closed'];
const groupKeys = ['type', 'panels', 'active'];
const splitKeys = ['type', 'axis', 'children', 'weights'];

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

/** Compares serialized layout representations, including property order and supplied group fields. */
export function sameSerializedWorkspaceLayout(
  left: WorkspaceLayout | undefined,
  right: WorkspaceLayout | undefined
): boolean {
  if (left === right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  if (!hasOrderedKeys(left, layoutKeys) || !hasOrderedKeys(right, layoutKeys)) {
    return serializeWorkspaceValue(left) === serializeWorkspaceValue(right);
  }
  return left.version === right.version && sameValues(left.closed, right.closed) && sameNode(left.root, right.root);
}

function splitShape(item: Record<string, unknown>): item is Record<string, unknown> & WorkspaceSplit {
  if (item.type !== 'split' || !['horizontal', 'vertical'].includes(String(item.axis))) return false;
  if (!Array.isArray(item.children) || item.children.length < 2) return false;
  if (!Array.isArray(item.weights) || item.weights.length !== item.children.length) return false;
  if (!item.weights.every(weight => typeof weight === 'number' && Number.isFinite(weight) && weight > 0)) return false;
  return Number.isFinite(item.weights.reduce((sum: number, weight: number) => sum + weight, 0));
}

function sameNode(left: WorkspaceNode | null, right: WorkspaceNode | null): boolean {
  if (left === right) {
    return true;
  }
  if (!left || !right || left.type !== right.type) {
    return false;
  }
  const keys = left.type === 'group' ? groupKeys : splitKeys;
  if (!hasOrderedKeys(left, keys) || !hasOrderedKeys(right, keys)) {
    return JSON.stringify(left) === JSON.stringify(right);
  }
  return left.type === 'group' ? sameGroup(left, right) : sameSplit(left, right);
}

function sameGroup(left: WorkspaceGroup, right: WorkspaceNode) {
  return right.type === 'group' && left.active === right.active && sameValues(left.panels, right.panels);
}

function sameSplit(left: WorkspaceSplit, right: WorkspaceNode) {
  return (
    right.type === 'split' &&
    left.axis === right.axis &&
    sameValues(left.weights, right.weights) &&
    sameChildren(left.children, right.children)
  );
}

function sameChildren(left: WorkspaceNode[], right: WorkspaceNode[]) {
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index++) {
    if (!sameNode(left[index]!, right[index]!)) {
      return false;
    }
  }
  return true;
}

function sameValues<T>(left: T[], right: T[]) {
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index++) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
}

function hasOrderedKeys(value: object, expected: string[]) {
  if ('toJSON' in value) {
    return false;
  }
  let index = 0;
  for (const key in value) {
    if (!Object.hasOwn(value, key)) {
      continue;
    }
    if (key !== expected[index++]) {
      return false;
    }
  }
  return index === expected.length;
}
