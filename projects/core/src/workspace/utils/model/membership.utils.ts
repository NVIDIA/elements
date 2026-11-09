// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { findGroup } from './operations.utils.js';

import type { WorkspacePlacementIntent } from '../interaction/command.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './layout.utils.js';

/** Identifies panel membership independently of its order. */
export function getPanelMembershipKey(members: readonly string[]): string {
  return JSON.stringify([...members].sort());
}

/** Compares unique panel IDs independently of their order. */
export function samePanelMembership(left: readonly string[], right: readonly string[]): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (const id of left) {
    if (!right.includes(id)) return false;
  }
  return true;
}

export function preservesGroupMembership(input: {
  root: WorkspaceNode | null;
  source: string[];
  intent: WorkspacePlacementIntent;
}): boolean {
  const origin = findGroup(input.root, input.source[0]);
  if (!origin || !input.source.length) return false;
  if (input.intent.kind === 'tab') return findGroup(input.root, input.intent.destination.target) === origin;
  return origin.panels.every(id => input.source.includes(id));
}

export function getWorkspacePanelSource(input: {
  layout?: WorkspaceLayout;
  anchor: string;
  available: string[];
}): string[] {
  const group = findGroup(input.layout?.root ?? null, input.anchor);
  return group &&
    group.panels.filter(id => !input.layout?.closed.includes(id) && input.available.includes(id)).length === 1
    ? [...group.panels]
    : [input.anchor];
}

/** Maps a visible insertion neighbor to its original order, retaining dormant members. */
export function getTabInsertionIndex(preferred: string[], before: string | undefined): number {
  const index = before === undefined ? preferred.length : preferred.indexOf(before);
  return index < 0 ? preferred.length : index;
}
