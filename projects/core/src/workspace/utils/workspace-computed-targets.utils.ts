// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceChrome } from '../controllers/workspace-chrome.controller.js';
import { type WorkspaceDropIntent, clipCue, type WorkspaceDragPreview } from './workspace-drag-preview.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';
import type { WorkspacePlacedRegion, WorkspaceRect } from './workspace-placement.utils.js';
import { type WorkspaceTarget, computedRegionCatalog } from './workspace-targeting.utils.js';
import { reservedTabCue, allocatedTabWidth } from './workspace-tabs.utils.js';
import { presentedTabGroups, type WorkspaceTabGroup } from './workspace-tabstrip.utils.js';

/** Resolves native-scrolled tab controls from computed positions, never animated client rectangles. */
export function computedTabHeader(input: {
  groups: WorkspaceTabGroup[];
  chrome: WorkspaceChrome;
  source: string[];
  point: { x: number; y: number };
  bounds: WorkspaceRect;
  client(rect: WorkspaceRect): WorkspaceRect;
  scroll(group: WorkspaceTabGroup): number;
}): WorkspaceTarget | undefined {
  for (const group of input.groups) {
    const rect = input.client(group.rect);
    const { headerHeight } = input.chrome;
    const suffix = input.chrome.panels?.[group.active]?.suffixWidth ?? 0;
    const { gripWidth } = group;
    const strip = clipCue(
      { x: rect.x + gripWidth, y: rect.y, width: Math.max(0, rect.width - gripWidth - suffix), height: headerHeight },
      input.bounds
    );
    if (!contains(strip, input.point)) continue;
    const width = allocatedTabWidth(group, input.chrome);
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

function contains(rect: WorkspaceRect, point: { x: number; y: number }) {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    point.x >= rect.x &&
    point.x < rect.x + rect.width &&
    point.y >= rect.y &&
    point.y < rect.y + rect.height
  );
}

/** Captures the initial source cue from the current committed group and native strip position. */
export function initialDragCue(input: {
  groups: WorkspaceTabGroup[];
  source: string[];
  groupDrag: boolean;
  bounds: WorkspaceRect;
  client(rect: WorkspaceRect): WorkspaceRect;
  chrome: WorkspaceChrome;
  width(group: WorkspaceTabGroup): number;
  scroll(group: WorkspaceTabGroup): number;
}): { kind: 'group' | 'tab'; rect: WorkspaceRect } {
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
        height: input.chrome.headerHeight
      },
      input.bounds
    )
  };
}

/** Converts the native scroll viewport into client-space input eligibility. */
export function interactionBounds(workspace: HTMLElement): WorkspaceRect {
  const viewport = workspace.shadowRoot?.querySelector('.viewport');
  if (!(viewport instanceof HTMLElement)) return workspace.getBoundingClientRect();
  const rect = viewport.getBoundingClientRect();
  return {
    x: rect.x + viewport.clientLeft,
    y: rect.y + viewport.clientTop,
    width: viewport.clientWidth,
    height: viewport.clientHeight
  };
}

/** The computed carried tab slot owns exactly the same visible rectangle as its landing cue. */
export function computedTabReservation(input: Parameters<typeof computedTabHeader>[0]) {
  return input.groups.some(group => {
    if (!group.panels.some(panel => input.source.includes(panel.id))) return false;
    const rect = input.client(group.rect);
    const { cue, bounds } = reservedTabCue({
      rect,
      viewport: input.bounds,
      grip: group.gripWidth,
      suffixWidth: input.chrome.panels?.[group.active]?.suffixWidth ?? 0,
      headerHeight: input.chrome.headerHeight,
      tabWidth: allocatedTabWidth(group, input.chrome),
      panels: group.panels.map(panel => panel.id),
      source: input.source,
      scroll: input.scroll(group)
    });
    return contains(bounds, input.point) && contains(cue, input.point);
  })
    ? ('tab' as const)
    : undefined;
}

/** Finds only genuine allocated whole-source occupancy, never an overlapping split indicator. */
export function computedSourceSlot(
  input: Pick<Parameters<typeof computedTabHeader>[0], 'groups' | 'source' | 'client' | 'bounds'>
): WorkspaceRect | undefined {
  const group = input.groups.find(
    item => item.panels.length > 0 && item.panels.every(panel => input.source.includes(panel.id))
  );
  return group ? clipCue(input.client(group.rect), input.bounds) : undefined;
}

/** Source occupancy is an ordinary target in the currently allocated reservation projection. */
export function computedReservation(input: Parameters<typeof computedTabHeader>[0]) {
  const group = computedSourceSlot(input);
  if (!group) return computedTabReservation(input);
  if (contains(group, input.point)) return 'group' as const;
  return undefined;
}

export function canvasClientRect(workspace: HTMLElement, rect: WorkspaceRect): WorkspaceRect {
  const canvas = workspace.shadowRoot?.querySelector('.canvas')?.getBoundingClientRect();
  return { ...rect, x: rect.x + (canvas?.x ?? 0), y: rect.y + (canvas?.y ?? 0) };
}

/** Reserves projected tab membership without changing its source-excluded group allocation. */
export function projectTabMembership(spatial: WorkspaceTabGroup[], proposed: WorkspaceTabGroup[]) {
  return spatial.map(group => ({
    ...group,
    panels:
      proposed.find(candidate => candidate.panels.some(panel => group.panels.includes(panel)))?.panels ?? group.panels
  }));
}

export function computedTabCue(input: {
  group: WorkspaceTabGroup;
  root: WorkspaceNode | null;
  source: string[];
  intent: WorkspaceDropIntent;
  spatial(): WorkspaceTabGroup[];
  chrome: WorkspaceChrome;
  viewport: WorkspaceRect;
  client(rect: WorkspaceRect): WorkspaceRect;
  scroll(group: WorkspaceTabGroup): number;
}) {
  const tabs = presentedTabGroups([tabRecipient(input)], input.root, input.source)[0]!;
  return reservedTabCue({
    rect: input.client(tabs.rect),
    viewport: input.viewport,
    grip: tabs.gripWidth,
    suffixWidth: input.chrome.panels?.[tabs.active]?.suffixWidth ?? 0,
    headerHeight: input.chrome.headerHeight,
    tabWidth: allocatedTabWidth(tabs, input.chrome),
    panels: tabs.panels.map(panel => panel.id),
    source: input.source,
    scroll: input.scroll(tabs)
  });
}

/** Resolves proposed tab membership onto its non-order recipient rectangle. */
export function tabRecipient(input: {
  group: WorkspaceTabGroup;
  intent: WorkspaceDropIntent;
  spatial: () => WorkspaceTabGroup[];
}) {
  if (input.intent.kind !== 'tab') return input.group;
  const target = input.intent.destination.target;
  const recipient = input.spatial().find(group => group.panels.some(panel => panel.id === target));
  return recipient ? { ...input.group, rect: recipient.rect, gripWidth: recipient.gripWidth } : input.group;
}

type DetachedPreview = Extract<WorkspaceDragPreview, { phase: 'detached' }>;

/** Identifies the shared split/tab acquisition projection. */
export function isNonOrderPreview(preview: WorkspaceDragPreview | undefined): preview is DetachedPreview {
  return (
    !!preview &&
    preview.phase === 'detached' &&
    preview.intent.kind !== 'order' &&
    preview.intent.kind !== 'insert' &&
    !(preview.intent.kind === 'invalid' && preview.allocation === 'reserved')
  );
}

/** Identifies source-excluded body presentation without changing canonical preferences. */
export function isOverlayDetachedPreview(
  preview: WorkspaceDragPreview | undefined
): preview is Exclude<WorkspaceDragPreview, { phase: 'attached' }> {
  return (
    !!preview &&
    'allocation' in preview &&
    preview.allocation === 'overlay' &&
    (preview.phase === 'detached' || preview.phase === 'returning-detached')
  );
}

/** Builds the one canonical-addressed input catalog from its selected allocation. */
export function workspaceInputCatalog(input: {
  gap: number;
  saved: WorkspaceLayout;
  catalog: WorkspacePlacedRegion[];
  allocation: { regions: WorkspacePlacedRegion[] };
  reservation?: { regions: WorkspacePlacedRegion[]; groups: WorkspaceTabGroup[] };
  preview?: WorkspaceDragPreview;
  source: string[];
  available: string[];
  bounds: WorkspaceRect;
  client(rect: WorkspaceRect): WorkspaceRect;
  headerHeight: number;
}) {
  const { saved, catalog, allocation, source, available, bounds } = input;
  const geometry = { saved, catalog, allocation: allocation.regions, source, available, bounds };
  const regions = computedRegionCatalog({
    ...geometry,
    catalog: catalog.map(region => ({ ...region, rect: input.client(region.rect) })),
    allocation: allocation.regions.map(region => ({ ...region, rect: input.client(region.rect) }))
  });

  return {
    gap: input.gap,
    regions,
    orderingRegions: input.reservation
      ? computedRegionCatalog({
          ...geometry,
          catalog: catalog.map(region => ({ ...region, rect: input.client(region.rect) })),
          allocation: input.reservation.regions.map(region => ({ ...region, rect: input.client(region.rect) }))
        })
      : regions,
    sourceSlot: input.reservation ? computedSourceSlot({ ...input, groups: input.reservation.groups }) : undefined,
    preview: input.preview,
    headers: computedChromeRects(input),
    targets: groupTargets(regions, source, input.headerHeight),
    bounds
  };
}

function groupTargets(regions: WorkspacePlacedRegion[], source: string[], headerHeight: number) {
  return regions.flatMap(region =>
    region.node.type === 'group'
      ? [{ panels: region.node.panels.filter(id => !source.includes(id)), rect: region.rect, headerHeight, tabs: [] }]
      : []
  );
}

/** Returns controlled visible chrome from the computed presentation, including grips and actions. */
function computedChromeRects(input: Parameters<typeof workspaceInputCatalog>[0]) {
  const groups = input.reservation?.groups ?? [];
  return groups
    .flatMap(group => {
      if (group.panels.every(panel => input.source.includes(panel.id))) return [];
      const rect = input.client(group.rect);
      return [clipCue({ ...rect, height: Math.min(rect.height, input.headerHeight) }, input.bounds)];
    })
    .filter(rect => rect.width > 0 && rect.height > 0);
}
