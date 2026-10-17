// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspacePanel } from '../panel/panel.js';
import type { WorkspaceDropIntent } from './workspace-drag-preview.utils.js';
import {
  splitSide,
  type WorkspaceLayout,
  type WorkspaceNode,
  type WorkspaceGroup,
  type WorkspaceSplit
} from './workspace-layout.utils.js';
import { findGroup, projectLayout } from './workspace-operations.utils.js';

export type WorkspaceSide = 'left' | 'right' | 'top' | 'bottom';

/** A placement supplied on the invoker's `placement` property for `--place`.
 * Source defaults to one panel; `group` carries its entire current group, including closed members.
 * An arrangement target identifies the enclosing split of the target panel, before source removal.
 */
export type WorkspacePlacement = { source?: 'panel' | 'group' } & (
  | { operation: 'split'; target: string; position: WorkspaceSide }
  | { operation: 'join'; target: string; index?: number }
  | { operation: 'reorder'; target: string; position: 'before' | 'after' }
  | { operation: 'insert'; scope: 'arrangement'; target: string; position: WorkspaceSide }
  | { operation: 'insert'; scope: 'workspace'; position: WorkspaceSide }
);

export type WorkspacePlacementIntent = Exclude<WorkspaceDropIntent, { kind: 'invalid' }>;

/** Identifies a supplied panel and optional placement without requiring an invoker element. */
export interface WorkspaceCommandContext {
  value?: string | null;
  placement?: WorkspacePlacement;
}

export interface WorkspaceCommandSource extends HTMLElement, WorkspaceCommandContext {
  disabled?: boolean;
  readOnly?: boolean;
}

export type WorkspaceCommandEvent = Event & { command?: string; source?: WorkspaceCommandSource | null };

interface WorkspaceCommandAvailability {
  command: string;
  context: WorkspaceCommandContext;
  layout?: WorkspaceLayout;
  available: string[];
  closable: boolean;
  rearrangeable: boolean;
  placementAvailable(source: string[], intent: WorkspacePlacementIntent): boolean;
  fullscreenAvailable(anchor: string): boolean;
}

export function workspaceCommandPanel(
  host: HTMLElement,
  panels: WorkspacePanel[],
  event: WorkspaceCommandEvent
): WorkspacePanel | undefined {
  return event.target === host
    ? panels.find(panel => panel.id === event.source?.value)
    : panels.find(panel => panel === event.target);
}

export function workspaceCommandAvailable(input: WorkspaceCommandAvailability): boolean {
  const panel = commandPanel(input);
  if (!panel) return false;
  const { id, group, closed } = panel;
  switch (input.command) {
    case '--open':
      return closed || group.active !== id;
    case '--select':
      return !closed && group.active !== id;
    case '--close':
      return input.closable && !closed;
    case '--place':
      return placementCommandAvailable(input, id);
    default:
      return input.fullscreenAvailable(id);
  }
}

function commandPanel(input: WorkspaceCommandAvailability) {
  const id = input.context.value;
  if (!id || !input.layout || !input.available.includes(id)) return undefined;
  const group = findGroup(input.layout.root, id);
  return group ? { id, group, closed: input.layout.closed.includes(id) } : undefined;
}

function placementCommandAvailable(input: WorkspaceCommandAvailability, id: string) {
  const placement = input.context.placement;
  if (!input.rearrangeable || !isWorkspacePlacement(placement) || !input.layout) return false;
  const request = resolveWorkspacePlacement({
    layout: input.layout,
    available: input.available,
    anchor: id,
    placement
  });
  return !!request && input.placementAvailable(request.source, request.intent);
}

export function isWorkspacePlacement(value: unknown): value is WorkspacePlacement {
  if (!record(value) || !validSource(value.source)) return false;
  switch (value.operation) {
    case 'split':
      return value.scope === undefined && identity(value.target) && side(value.position);
    case 'join':
      return joinPlacement(value);
    case 'reorder':
      return reorderPlacement(value);
    case 'insert':
      return insertedPlacement(value);
    default:
      return false;
  }
}

function validSource(value: unknown) {
  return value === undefined || value === 'panel' || value === 'group';
}

function joinPlacement(value: Record<string, unknown>) {
  const index = value.index;
  return (
    value.scope === undefined &&
    identity(value.target) &&
    (index === undefined || (typeof index === 'number' && Number.isInteger(index) && index >= 0))
  );
}

function reorderPlacement(value: Record<string, unknown>) {
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
  const group = findGroup(layout.root, anchor);
  if (!group) return undefined;
  const source = placement.source === 'group' ? [...group.panels] : [anchor];
  const root = projectLayout(layout, available).root;
  if (placement.operation === 'insert' && placement.scope === 'workspace') {
    const target = firstRemaining(root, source);
    return target
      ? { source, intent: { kind: 'insert', destination: { target, region: 'root', position: placement.position } } }
      : undefined;
  }
  if (!visible.includes(placement.target) || !findGroup(root, placement.target)) return undefined;
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
    case 'join':
      return { kind: 'tab', destination: { target, position: 'tab', index: placement.index } };
    case 'split':
      return source.includes(target)
        ? undefined
        : { kind: 'split', destination: { target, position: placement.position } };
    case 'reorder':
      return peerOrder({ root, source, target, position: placement.position });
    case 'insert': {
      const owner = groupAddress(root, target)?.owner;
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
  const address = groupAddress(input.root, input.source[0]!);
  const owner = address?.owner;
  if (!owner) return undefined;
  const index = owner.node.children.findIndex(child => !!findGroup(child, input.target));
  if (index < 0 || index === address.index) return undefined;
  const position = splitSide(owner.node.axis, input.position);
  return { kind: 'order', destination: { target: input.target, region: `${owner.key}.${index}`, position } };
}

interface GroupAddress {
  group: WorkspaceGroup;
  index: number;
  owner?: { node: WorkspaceSplit; key: string };
}

function groupAddress(node: WorkspaceNode | null, id: string, key = 'root'): GroupAddress | undefined {
  if (!node) return undefined;
  if (node.type === 'group') return node.panels.includes(id) ? { group: node, index: 0 } : undefined;
  for (const [index, child] of node.children.entries()) {
    if (child.type === 'group' && child.panels.includes(id)) return { group: child, index, owner: { node, key } };
    const nested = groupAddress(child, id, `${key}.${index}`);
    if (nested) return nested;
  }
  return undefined;
}

function firstRemaining(node: WorkspaceNode | null, source: string[]): string | undefined {
  if (!node) return undefined;
  return node.type === 'group'
    ? node.panels.find(id => !source.includes(id))
    : node.children.map(child => firstRemaining(child, source)).find(Boolean);
}
