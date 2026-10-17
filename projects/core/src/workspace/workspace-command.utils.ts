// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceDropIntent } from './workspace-drag-preview.utils.js';
import {
  splitSide,
  type WorkspaceLayout,
  type WorkspaceNode,
  type WorkspacePane,
  type WorkspaceSplit
} from './workspace-layout.utils.js';
import { findPane, projectLayout } from './workspace-operations.utils.js';

export type WorkspaceSide = 'left' | 'right' | 'top' | 'bottom';

/** A placement supplied on the invoker's `placement` property for `--place`.
 * Source defaults to one panel; `pane` carries its entire current tabbed pane, including closed members.
 * An arrangement target identifies the enclosing split of the target panel, before source removal.
 */
export type WorkspacePlacement = { source?: 'panel' | 'pane' } & (
  | { operation: 'split'; target: string; position: WorkspaceSide }
  | { operation: 'tab'; target: string; index?: number }
  | { operation: 'order'; target: string; position: 'before' | 'after' }
  | { operation: 'insert'; scope: 'arrangement'; target: string; position: WorkspaceSide }
  | { operation: 'insert'; scope: 'workspace'; position: WorkspaceSide }
);

export type WorkspacePlacementIntent = Exclude<WorkspaceDropIntent, { kind: 'invalid' }>;

export interface WorkspaceCommandSource extends HTMLElement {
  value?: string | null;
  placement?: WorkspacePlacement;
  disabled?: boolean;
  readOnly?: boolean;
}

export type WorkspaceCommandEvent = Event & { command?: string; source?: WorkspaceCommandSource | null };

export function isWorkspacePlacement(value: unknown): value is WorkspacePlacement {
  if (!record(value) || !validSource(value.source)) return false;
  switch (value.operation) {
    case 'split':
      return value.scope === undefined && identity(value.target) && side(value.position);
    case 'tab':
      return tabPlacement(value);
    case 'order':
      return orderedPlacement(value);
    case 'insert':
      return insertedPlacement(value);
    default:
      return false;
  }
}

function validSource(value: unknown) {
  return value === undefined || value === 'panel' || value === 'pane';
}

function tabPlacement(value: Record<string, unknown>) {
  const index = value.index;
  return (
    value.scope === undefined &&
    identity(value.target) &&
    (index === undefined || (typeof index === 'number' && Number.isInteger(index) && index >= 0))
  );
}

function orderedPlacement(value: Record<string, unknown>) {
  return (
    value.scope === undefined && identity(value.target) && (value.position === 'before' || value.position === 'after')
  );
}

function insertedPlacement(value: Record<string, unknown>) {
  return (
    side(value.position) &&
    ((value.scope === 'workspace' && value.target === undefined) ||
      (value.scope === 'arrangement' && identity(value.target)))
  );
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function identity(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function side(value: unknown): value is WorkspaceSide {
  return value === 'left' || value === 'right' || value === 'top' || value === 'bottom';
}

/** Resolves durable panel anchors to one explicit canonical operation, without exposing region addresses. */
export function resolveWorkspacePlacement(input: {
  layout: WorkspaceLayout;
  available: string[];
  anchor: string;
  placement: WorkspacePlacement;
}): { source: string[]; intent: WorkspacePlacementIntent } | undefined {
  const { layout, available, anchor, placement } = input;
  const visible = available.filter(id => !layout.closed.includes(id));
  if (!visible.includes(anchor)) return undefined;
  const pane = findPane(layout.root, anchor);
  if (!pane) return undefined;
  const source = placement.source === 'pane' ? [...pane.panels] : [anchor];
  const root = projectLayout(layout, available).root;
  if (placement.operation === 'insert' && placement.scope === 'workspace') {
    const target = firstRemaining(root, source);
    return target
      ? { source, intent: { kind: 'insert', destination: { target, region: 'root', position: placement.position } } }
      : undefined;
  }
  if (!visible.includes(placement.target) || !findPane(root, placement.target)) return undefined;
  const intent = relativePlacement({ root, source, placement });
  return intent ? { source, intent } : undefined;
}

function relativePlacement({
  root,
  source,
  placement
}: {
  root: WorkspaceNode | null;
  source: string[];
  placement: Exclude<WorkspacePlacement, { operation: 'insert'; scope: 'workspace' }>;
}): WorkspacePlacementIntent | undefined {
  const target = placement.target;
  switch (placement.operation) {
    case 'tab':
      return { kind: 'tab', destination: { target, position: 'tab', index: placement.index } };
    case 'split':
      return source.includes(target)
        ? undefined
        : { kind: 'split', destination: { target, position: placement.position } };
    case 'order':
      return peerOrder({ root, source, target, position: placement.position });
    case 'insert': {
      const owner = paneAddress(root, target)?.owner;
      return owner
        ? { kind: 'insert', destination: { target, region: owner.key, position: placement.position } }
        : undefined;
    }
  }
}

function peerOrder(input: {
  root: WorkspaceNode | null;
  source: string[];
  target: string;
  position: 'before' | 'after';
}): WorkspacePlacementIntent | undefined {
  const address = paneAddress(input.root, input.source[0]!);
  const owner = address?.owner;
  if (!owner) return undefined;
  const index = owner.node.children.findIndex(child => !!findPane(child, input.target));
  if (index < 0 || index === address.index) return undefined;
  const position = splitSide(owner.node.axis, input.position);
  return { kind: 'order', destination: { target: input.target, region: `${owner.key}.${index}`, position } };
}

interface PaneAddress {
  pane: WorkspacePane;
  index: number;
  owner?: { node: WorkspaceSplit; key: string };
}

function paneAddress(node: WorkspaceNode | null, id: string, key = 'root'): PaneAddress | undefined {
  if (!node) return undefined;
  if (node.type === 'pane') return node.panels.includes(id) ? { pane: node, index: 0 } : undefined;
  for (const [index, child] of node.children.entries()) {
    if (child.type === 'pane' && child.panels.includes(id)) return { pane: child, index, owner: { node, key } };
    const nested = paneAddress(child, id, `${key}.${index}`);
    if (nested) return nested;
  }
  return undefined;
}

function firstRemaining(node: WorkspaceNode | null, source: string[]): string | undefined {
  if (!node) return undefined;
  return node.type === 'pane'
    ? node.panels.find(id => !source.includes(id))
    : node.children.map(child => firstRemaining(child, source)).find(Boolean);
}
