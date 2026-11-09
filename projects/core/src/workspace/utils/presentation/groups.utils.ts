// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Point, Rect } from '@nvidia-elements/core/internal';

import { clipCue } from '../interaction/drag-preview.utils.js';
import { getPanelMembershipKey } from '../model/membership.utils.js';
import { findGroup } from '../model/operations.utils.js';

import type { WorkspacePlacedGroup } from '../geometry/allocation.utils.js';
import type { WorkspaceDropIntent } from '../interaction/drag-preview.utils.js';
import type { WorkspaceNode } from '../model/layout.utils.js';
import type { WorkspaceMeasurements } from './measurements.utils.js';

import type { WorkspacePanel } from '../../panel/panel.js';

export interface WorkspacePresentedGroup {
  key: string;
  panels: WorkspacePanel[];
  rect: Rect;
  active: string;
  gripWidth: number;
  tabbed: boolean;
}

export interface WorkspaceTarget {
  panels: string[];
  headerHeight: number;
  rect: Rect;
  tabs: { id: string; rect: Rect }[];
}

/** Binds supplied panels and committed header ownership to the computed allocation. */
export function createPresentedGroups(input: {
  groups: WorkspacePlacedGroup[];
  panels: WorkspacePanel[];
  root: WorkspaceNode | null;
  closed: string[];
  source: string[];
  gripWidth: number;
}): WorkspacePresentedGroup[] {
  const visible = input.panels.map(panel => panel.id).filter(id => !input.closed.includes(id));
  return input.groups.map(({ key, group, rect }) => ({
    key,
    rect,
    active: group.active,
    ...tabStripMembership({
      root: input.root,
      members: group.panels,
      source: input.source,
      visible,
      width: input.gripWidth
    }),
    panels: group.panels.flatMap(id => input.panels.filter(panel => panel.id === id))
  }));
}

/** Keeps the surviving recipient active while carrying one of its panels. */
export function preserveRecipientSelection(
  groups: WorkspacePresentedGroup[],
  root: WorkspaceNode | null,
  source?: string[]
) {
  return source
    ? groups.map(group => ({
        ...group,
        active: presentedTabActive({ root, source, members: group.panels.map(panel => panel.id), active: group.active })
      }))
    : groups;
}

/** Reserves projected tab membership without changing its source-excluded group allocation. */
export function projectTabMembership(spatial: WorkspacePresentedGroup[], proposed: WorkspacePresentedGroup[]) {
  return spatial.map(group => ({
    ...group,
    panels:
      proposed.find(candidate => candidate.panels.some(panel => group.panels.includes(panel)))?.panels ?? group.panels
  }));
}

export function getAllocatedTabWidth(group: WorkspacePresentedGroup, measurements: WorkspaceMeasurements) {
  const suffix = measurements.panels?.[group.active]?.suffixWidth ?? 0;
  return Math.max(
    measurements.tabWidth,
    group.tabbed || group.panels.length > 1 ? measurements.tabMinWidth : 0,
    (group.rect.width - group.gripWidth - suffix - (measurements.groupActionWidth ?? 0)) / group.panels.length
  );
}

/** Indexes strip ownership for one committed root. */
export function createTabStripIdentityResolver(root: WorkspaceNode | null) {
  const identities = new Map<string, string>();
  return (members: string[], source: string[]) => {
    const anchor = members.find(id => !source.includes(id)) ?? members[0];
    const previous = anchor && identities.get(anchor);
    if (previous) return previous;
    const group = anchor ? findGroup(root, anchor) : undefined;
    if (!group) return getPanelMembershipKey(members);
    const identity = getPanelMembershipKey(group.panels);
    for (const id of group.panels) identities.set(id, identity);
    return identity;
  };
}

/** Resolves native-scrolled tab controls from computed positions, never animated client rectangles. */
export function findTabHeaderTarget(input: {
  groups: WorkspacePresentedGroup[];
  measurements: WorkspaceMeasurements;
  source: string[];
  point: Point;
  bounds: Rect;
  client(rect: Rect): Rect;
  scroll(group: WorkspacePresentedGroup): number;
}): WorkspaceTarget | undefined {
  for (const group of input.groups) {
    const rect = input.client(group.rect);
    const { headerHeight } = input.measurements;
    const suffix =
      (input.measurements.panels?.[group.active]?.suffixWidth ?? 0) + (input.measurements.groupActionWidth ?? 0);
    const { gripWidth } = group;
    const strip = clipCue(
      { x: rect.x + gripWidth, y: rect.y, width: Math.max(0, rect.width - gripWidth - suffix), height: headerHeight },
      input.bounds
    );
    if (!contains(strip, input.point)) continue;
    const width = getAllocatedTabWidth(group, input.measurements);
    const tabs = group.panels.flatMap((panel, index) =>
      input.source.includes(panel.id)
        ? []
        : [
            {
              id: panel.id,
              rect: {
                x: rect.x + gripWidth + index * width - input.scroll(group),
                y: rect.y,
                width,
                height: headerHeight
              }
            }
          ]
    );
    if (tabs.length) return { panels: tabs.map(tab => tab.id), rect: strip, headerHeight: strip.height, tabs };
  }
  return undefined;
}

/** Captures the initial source cue from the current committed group and native strip position. */
export function getInitialDragCue(input: {
  groups: WorkspacePresentedGroup[];
  source: string[];
  groupDrag: boolean;
  bounds: Rect;
  client(rect: Rect): Rect;
  measurements: WorkspaceMeasurements;
  width(group: WorkspacePresentedGroup): number;
  scroll(group: WorkspacePresentedGroup): number;
}): { kind: 'group' | 'tab'; rect: Rect } {
  const group = input.groups.find(item => item.panels.some(panel => input.source.includes(panel.id)));
  if (!group) return { kind: 'group', rect: input.bounds };
  const rect = input.client(group.rect);
  if (input.groupDrag || group.panels.length === 1) return { kind: 'group', rect: clipCue(rect, input.bounds) };
  const width = input.width(group);
  const index = group.panels.findIndex(panel => input.source.includes(panel.id));
  return {
    kind: 'tab',
    rect: clipCue(
      {
        x: rect.x + group.gripWidth + index * width - input.scroll(group),
        y: rect.y,
        width,
        height: input.measurements.headerHeight
      },
      input.bounds
    )
  };
}

/** The computed carried tab reservation owns exactly the same visible rectangle as its landing cue. */
export function getTabReservationHit(input: Parameters<typeof findTabHeaderTarget>[0]) {
  return input.groups.some(group => {
    if (!group.panels.some(panel => input.source.includes(panel.id))) return false;
    const rect = input.client(group.rect);
    const { cue, bounds } = reservedTabCue({
      rect,
      viewport: input.bounds,
      grip: group.gripWidth,
      suffixWidth:
        (input.measurements.panels?.[group.active]?.suffixWidth ?? 0) + (input.measurements.groupActionWidth ?? 0),
      headerHeight: input.measurements.headerHeight,
      tabWidth: getAllocatedTabWidth(group, input.measurements),
      panels: group.panels.map(panel => panel.id),
      source: input.source,
      scroll: input.scroll(group)
    });
    return contains(bounds, input.point) && contains(cue, input.point);
  })
    ? ('tab' as const)
    : undefined;
}

export function getTabCue(input: {
  group: WorkspacePresentedGroup;
  root: WorkspaceNode | null;
  source: string[];
  intent: WorkspaceDropIntent;
  spatial(): WorkspacePresentedGroup[];
  measurements: WorkspaceMeasurements;
  viewport: Rect;
  client(rect: Rect): Rect;
  scroll(group: WorkspacePresentedGroup): number;
}) {
  const tabs = preserveRecipientSelection([tabRecipient(input)], input.root, input.source)[0]!;
  return reservedTabCue({
    rect: input.client(tabs.rect),
    viewport: input.viewport,
    grip: tabs.gripWidth,
    suffixWidth:
      (input.measurements.panels?.[tabs.active]?.suffixWidth ?? 0) + (input.measurements.groupActionWidth ?? 0),
    headerHeight: input.measurements.headerHeight,
    tabWidth: getAllocatedTabWidth(tabs, input.measurements),
    panels: tabs.panels.map(panel => panel.id),
    source: input.source,
    scroll: input.scroll(tabs)
  });
}

/** Derives tab presentation from committed members, excluding closed and unavailable panels. */
function tabStripMembership(input: {
  root: WorkspaceNode | null;
  members: string[];
  source: string[];
  visible: string[];
  width: number;
}) {
  const members = committedTabMembers(input.root, input.members, input.source).filter(id => input.visible.includes(id));
  const tabbed = members.length > 1;
  return { tabbed, gripWidth: tabbed ? input.width : 0 };
}

function committedTabMembers(root: WorkspaceNode | null, members: string[], source: string[]) {
  const anchor = members.find(id => !source.includes(id)) ?? members[0];
  const group = anchor ? findGroup(root, anchor) : undefined;
  return group?.panels ?? members;
}

/** Preserves the recipient body until the workspace commits the placement. */
function presentedTabActive(input: {
  root: WorkspaceNode | null;
  members: string[];
  source: string[];
  active: string;
}): string {
  const { root, members, source, active } = input;
  const remaining = members.filter(id => !source.includes(id));
  const anchor = remaining[0];
  const original = anchor ? findGroup(root, anchor)?.active : undefined;
  return original && remaining.includes(original) ? original : (remaining[0] ?? active);
}

/** Resolves proposed tab membership onto its non-order recipient rectangle. */
function tabRecipient(input: {
  group: WorkspacePresentedGroup;
  intent: WorkspaceDropIntent;
  spatial: () => WorkspacePresentedGroup[];
}) {
  if (input.intent.kind !== 'tab') return input.group;
  const target = input.intent.destination.target;
  const recipient = input.spatial().find(group => group.panels.some(panel => panel.id === target));
  return recipient ? { ...input.group, rect: recipient.rect, gripWidth: recipient.gripWidth } : input.group;
}

/** Allocates a carried tab reservation inside its native scrolling strip. */
function reservedTabCue(input: {
  rect: Rect;
  viewport: Rect;
  grip: number;
  suffixWidth: number;
  headerHeight: number;
  tabWidth: number;
  panels: string[];
  source: string[];
  scroll: number;
}) {
  const { rect, viewport, grip, suffixWidth, headerHeight, tabWidth, panels, source, scroll } = input;
  return {
    cue: {
      x: rect.x + grip + panels.findIndex(id => source.includes(id)) * tabWidth - scroll,
      y: rect.y,
      width: panels.filter(id => source.includes(id)).length * tabWidth,
      height: headerHeight
    },
    bounds: clipCue(
      { x: rect.x + grip, y: rect.y, width: Math.max(0, rect.width - grip - suffixWidth), height: headerHeight },
      viewport
    )
  };
}

function contains(rect: Rect, point: Point) {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    point.x >= rect.x &&
    point.x < rect.x + rect.width &&
    point.y >= rect.y &&
    point.y < rect.y + rect.height
  );
}
