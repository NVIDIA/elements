// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSplitSide } from '../model/layout.utils.js';
import { findGroup, projectLayout } from '../model/operations.utils.js';

import type { WorkspaceDropIntent } from './drag-preview.utils.js';
import type { WorkspaceGroup, WorkspaceLayout, WorkspaceNode, WorkspaceSplit } from '../model/layout.utils.js';

import type { WorkspacePanel } from '../../panel/panel.js';

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

interface CommandPanelState {
  id: string;
  group: WorkspaceGroup;
  closed: boolean;
}

interface WorkspaceCommandAvailability {
  command: string;
  context: WorkspaceCommandContext;
  layout?: WorkspaceLayout;
  available: string[];
  closable: boolean;
  rearrangeable: boolean;
  placementAvailable(source: string[], intent: WorkspacePlacementIntent): boolean;
  canEnterFullscreen(anchor: string): boolean;
  canExitFullscreen(): boolean;
  isFullscreenGroup(anchor: string): boolean;
}

export function findWorkspaceCommandPanel(
  host: HTMLElement,
  panels: WorkspacePanel[],
  event: WorkspaceCommandEvent
): WorkspacePanel | undefined {
  return event.target === host
    ? panels.find(panel => panel.id === event.source?.value)
    : panels.find(panel => panel === event.target);
}

export function isWorkspaceCommandAvailable(input: WorkspaceCommandAvailability): boolean {
  const panel = commandPanel(input);
  if (!panel) return false;
  const { id } = panel;
  switch (input.command) {
    case '--enter-fullscreen':
      return input.canEnterFullscreen(id);
    case '--exit-fullscreen':
      return input.canExitFullscreen();
    case '--toggle-fullscreen':
      if (input.isFullscreenGroup(id)) {
        return input.canExitFullscreen();
      }
      return input.canEnterFullscreen(id);
    default:
      return layoutCommandAvailable(input, panel);
  }
}

function layoutCommandAvailable(input: WorkspaceCommandAvailability, panel: CommandPanelState) {
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
      return false;
  }
}

function commandPanel(input: WorkspaceCommandAvailability): CommandPanelState | undefined {
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
  if (!isRecord(value) || !isValidSource(value.source)) return false;
  switch (value.operation) {
    case 'split':
      return value.scope === undefined && isNonemptyString(value.target) && isWorkspaceSide(value.position);
    case 'join':
      return hasValidJoinFields(value);
    case 'reorder':
      return hasValidReorderFields(value);
    case 'insert':
      return hasValidInsertionFields(value);
    default:
      return false;
  }
}

function isValidSource(value: unknown) {
  return value === undefined || value === 'panel' || value === 'group';
}

function hasValidJoinFields(value: Record<string, unknown>) {
  const index = value.index;
  return (
    value.scope === undefined &&
    isNonemptyString(value.target) &&
    (index === undefined || (typeof index === 'number' && Number.isInteger(index) && index >= 0))
  );
}

function hasValidReorderFields(value: Record<string, unknown>) {
  return (
    value.scope === undefined &&
    isNonemptyString(value.target) &&
    (value.position === 'before' || value.position === 'after')
  );
}

function hasValidInsertionFields(value: Record<string, unknown>) {
  return (
    isWorkspaceSide(value.position) &&
    ((value.scope === 'workspace' && value.target === undefined) ||
      (value.scope === 'arrangement' && isNonemptyString(value.target)))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isWorkspaceSide(value: unknown): value is WorkspaceSide {
  return value === 'left' || value === 'right' || value === 'top' || value === 'bottom';
}

/** Resolves panel IDs to placement operations without exposing region paths. */
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
    if (!target) return undefined;

    return {
      source,
      intent: { kind: 'insert', destination: { target, region: 'root', position: placement.position } }
    };
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
      if (source.includes(target)) return undefined;

      return { kind: 'split', destination: { target, position: placement.position } };
    case 'reorder':
      return peerOrder({ root, source, target, position: placement.position });
    case 'insert': {
      const owner = groupAddress(root, target)?.owner;
      if (!owner) return undefined;

      return { kind: 'insert', destination: { target, region: owner.key, position: placement.position } };
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
  const position = getSplitSide(owner.node.axis, input.position);
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
