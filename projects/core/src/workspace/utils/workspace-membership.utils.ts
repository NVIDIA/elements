// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspacePlacementIntent } from './workspace-command.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';
import { findGroup } from './workspace-operations.utils.js';

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

export function workspacePanelSource(input: {
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
