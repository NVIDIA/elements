// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Dimensions, Point, Rect } from '@nvidia-elements/core/internal';

import { allocateWorkspace } from './geometry/allocation.utils.js';
import { getMinimumWorkspaceDimensions, getWorkspaceRequirements } from './geometry/sizing.utils.js';
import { clipCue } from './interaction/drag-preview.utils.js';
import { getPanelIds } from './model/layout.utils.js';
import { createDetachedLayout, getFullscreenWorkspaceLayout, projectLayout } from './model/operations.utils.js';
import {
  createWorkspaceLayoutProjector,
  findDeepestProjectionCarrier,
  getProjectionSignature
} from './model/projection.utils.js';
import { allocateContextProxies, createContextRectResolver, getContextKey } from './placement/context.utils.js';
import {
  createPresentedGroups,
  findTabHeaderTarget,
  getTabReservationHit,
  preserveRecipientSelection,
  projectTabMembership
} from './presentation/groups.utils.js';

import type { WorkspaceBoundary, WorkspacePlacedRegion } from './geometry/allocation.utils.js';
import type { WorkspaceDragPreview } from './interaction/drag-preview.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './model/layout.utils.js';
import type { WorkspacePresentedGroup, WorkspaceTarget } from './presentation/groups.utils.js';
import type { WorkspaceMeasurements } from './presentation/measurements.utils.js';

import type { WorkspacePanel } from '../panel/panel.js';

interface WorkspaceEvaluationInputs {
  panels: WorkspacePanel[];
  layout: WorkspaceLayout;
  source: string[];
  measurements: WorkspaceMeasurements;
  policy: 'stop' | 'propagate';
  strip(group: WorkspacePresentedGroup): HTMLElement | null | undefined;
}

export interface WorkspaceGeometry {
  groups: WorkspacePresentedGroup[];
  boundaries: WorkspaceBoundary[];
  regions: WorkspacePlacedRegion[];
  width: number;
  height: number;
  minimum: Dimensions;
}

export interface WorkspaceEvaluationDelegate {
  readonly getCurrentLayout: () => WorkspaceLayout;
  readonly getCurrentMeasurements: () => WorkspaceMeasurements;
  readonly getCurrentPreview: () => WorkspaceDragPreview | undefined;
  readonly getFullscreenTarget: () => string | undefined;
  readonly getResizePreview: () => WorkspaceLayout | undefined;
}

export interface WorkspacePlacementCatalog {
  targets: WorkspaceTarget[];
  regions: WorkspacePlacedRegion[];
  orderingRegions?: WorkspacePlacedRegion[];
  sourceSlot?: Rect;
  headers?: Rect[];
  preview?: WorkspaceDragPreview;
  bounds: Rect;
  headerTarget?: WorkspaceTarget;
  reservationHit?: WorkspaceReservationHit;
}

type WorkspaceReservationHit = 'group' | 'tab';

interface RegionCatalogInput {
  catalog: WorkspacePlacedRegion[];
  allocation: WorkspacePlacedRegion[];
  source: string[];
  bounds: Rect;
  getRemainingLayoutSignature(node: WorkspaceNode): string;
}

type DetachedPreview = Extract<WorkspaceDragPreview, { phase: 'detached' }>;

/** Shares layout inputs and browser reads within one synchronous evaluation. */
export class WorkspaceEvaluation {
  readonly panels: WorkspacePanel[];
  readonly available: string[];
  readonly requirements;
  readonly projectLayout = createWorkspaceLayoutProjector();
  readonly contextRect = createContextRectResolver();

  readonly #host: HTMLElement;
  readonly #inputs: WorkspaceEvaluationInputs;
  readonly #delegate?: WorkspaceEvaluationDelegate;
  readonly #scroll = new WeakMap<HTMLElement, number>();
  readonly #allocations = new Map<WorkspaceNode | null, Map<WorkspaceNode | null, WorkspaceGeometry>>();
  readonly #minima = new Map<WorkspaceNode | null, Dimensions>();
  readonly #detached = new WeakMap<string[], WorkspaceGeometry>();

  #origin?: Rect;
  #bounds?: Rect;

  constructor(host: HTMLElement, inputs: WorkspaceEvaluationInputs, delegate?: WorkspaceEvaluationDelegate) {
    this.#host = host;
    this.#inputs = inputs;
    this.#delegate = delegate;
    this.panels = inputs.panels;
    this.available = inputs.panels.map(panel => panel.id);
    this.requirements = getWorkspaceRequirements(inputs);
  }

  minimum(node: WorkspaceNode | null) {
    let minimum = this.#minima.get(node);
    if (!minimum) {
      minimum = getMinimumWorkspaceDimensions(node, this.requirements);
      this.#minima.set(node, minimum);
    }
    return minimum;
  }

  project(layout: WorkspaceLayout) {
    return this.projectLayout(layout, this.available);
  }

  geometry(layout: WorkspaceLayout, extent = layout) {
    let allocations = this.#allocations.get(layout.root);
    if (!allocations) {
      allocations = new Map();
      this.#allocations.set(layout.root, allocations);
    }
    let geometry = allocations.get(extent.root);
    if (!geometry) {
      geometry = allocateGeometry({ ...this.#inputs, minimum: node => this.minimum(node) }, layout, extent);
      allocations.set(extent.root, geometry);
    }
    return geometry;
  }

  detached(source: string[]) {
    let geometry = this.#detached.get(source);
    if (!geometry) {
      geometry = this.geometry(
        this.project(createDetachedLayout(this.#inputs.layout, source)),
        this.project(this.#inputs.layout)
      );
      this.#detached.set(source, geometry);
    }
    return geometry;
  }

  nonOrderGeometry(source: string[]) {
    const spatial = this.detached(source);
    const preview = this.#delegate?.getCurrentPreview();
    if (preview?.phase !== 'detached' || preview.intent.kind !== 'tab' || preview.allocation !== 'reserved') {
      return spatial;
    }

    return {
      ...spatial,
      groups: projectTabMembership(spatial.groups, this.geometry(this.project(preview.layout)).groups)
    };
  }

  targetCatalog(source: string[], allocation = this.nonOrderGeometry(source)) {
    const currentLayout = this.#currentLayout;
    return workspaceInputCatalog({
      gap: this.#currentMeasurements.gap,
      currentLayout,
      catalog: this.geometry(this.project(currentLayout)).regions,
      allocation,
      reservation: this.presentationGeometry(),
      preview: this.#delegate?.getCurrentPreview(),
      source,
      available: this.available,
      bounds: this.bounds(),
      client: rect => this.client(rect),
      headerHeight: this.#currentMeasurements.headerHeight
    });
  }

  getPlacementCatalog(source: string[], point: Point): WorkspacePlacementCatalog {
    const headerTarget = findTabHeaderTarget(this.#headerInput(source, point));
    const catalog: WorkspacePlacementCatalog = this.targetCatalog(source);
    catalog.headerTarget = headerTarget;
    catalog.reservationHit = computedReservationHit({
      ...this.#headerInput(this.#delegate?.getCurrentPreview()?.source ?? [], point),
      groups: this.presentationGeometry().groups
    });
    return catalog;
  }

  bounds() {
    return (this.#bounds ??= interactionBounds(this.#host));
  }

  client(rect: Rect) {
    const origin = (this.#origin ??= canvasClientRect(this.#host, { x: 0, y: 0, width: 0, height: 0 }));
    return { ...rect, x: rect.x + origin.x, y: rect.y + origin.y };
  }

  scroll(group: WorkspacePresentedGroup) {
    if (group.panels.length < 2) return 0;
    const strip = this.#inputs.strip(group);
    if (!strip) return 0;
    let scroll = this.#scroll.get(strip);
    if (scroll === undefined) {
      scroll = strip.scrollLeft;
      this.#scroll.set(strip, scroll);
    }
    return scroll;
  }

  presentationGeometry() {
    const fullscreen = getFullscreenWorkspaceLayout(
      this.project(this.#currentLayout),
      this.#delegate?.getFullscreenTarget()
    );
    if (fullscreen) {
      return this.geometry(fullscreen);
    }
    return this.#getArrangementGeometry();
  }

  get #currentLayout() {
    return this.#delegate?.getCurrentLayout() ?? this.#inputs.layout;
  }

  get #currentMeasurements() {
    return this.#delegate?.getCurrentMeasurements() ?? this.#inputs.measurements;
  }

  #getArrangementGeometry() {
    const preview = this.#delegate?.getCurrentPreview();
    if (isNonOrderPreview(preview)) {
      return this.nonOrderGeometry(preview.source);
    }
    if (preview && 'allocation' in preview && preview.allocation === 'reserved') {
      return this.geometry(this.project(preview.layout));
    }
    if (isOverlayDetachedPreview(preview)) {
      return this.detached(preview.source);
    }
    return this.geometry(this.project(this.#delegate?.getResizePreview() ?? this.#currentLayout));
  }

  #headerInput(source: string[], point: Point) {
    return {
      groups: preserveRecipientSelection(this.nonOrderGeometry(source).groups, this.#currentLayout.root, source),
      measurements: this.#currentMeasurements,
      source,
      point,
      bounds: this.bounds(),
      client: (rect: Rect) => this.client(rect),
      scroll: (group: WorkspacePresentedGroup) => this.scroll(group)
    };
  }
}

function allocateGeometry(
  input: WorkspaceEvaluationInputs & { minimum(node: WorkspaceNode | null): Dimensions },
  layout: WorkspaceLayout,
  extent: WorkspaceLayout
): WorkspaceGeometry {
  const floor = input.minimum(extent.root);
  const width = Math.max(input.measurements.width, floor.width);
  const height = Math.max(input.measurements.height, floor.height);
  const allocated = allocateWorkspace({
    root: layout.root,
    rect: { x: 0, y: 0, width, height },
    minimum: input.minimum,
    policy: input.policy,
    gap: input.measurements.gap
  });
  const groups = createPresentedGroups({
    groups: allocated.groups,
    panels: input.panels,
    root: input.layout.root,
    closed: input.layout.closed,
    source: input.source,
    gripWidth: input.measurements.gripWidth
  });
  return { ...allocated, width, height, minimum: floor, groups };
}

function workspaceInputCatalog(input: {
  gap: number;
  currentLayout: WorkspaceLayout;
  catalog: WorkspacePlacedRegion[];
  allocation: { regions: WorkspacePlacedRegion[] };
  reservation?: { regions: WorkspacePlacedRegion[]; groups: WorkspacePresentedGroup[] };
  preview?: WorkspaceDragPreview;
  source: string[];
  available: string[];
  bounds: Rect;
  client(rect: Rect): Rect;
  headerHeight: number;
}) {
  const { currentLayout, catalog, allocation, source, available, bounds } = input;
  const geometry = {
    catalog,
    allocation: allocation.regions,
    source,
    bounds,
    getRemainingLayoutSignature: createRemainingLayoutSignatureResolver({ currentLayout, source, available })
  };
  const clientCatalog = catalog.map(region => ({ ...region, rect: input.client(region.rect) }));
  const regions = computedRegionCatalog({
    ...geometry,
    catalog: clientCatalog,
    allocation: allocation.regions.map(region => ({ ...region, rect: input.client(region.rect) }))
  });

  return {
    gap: input.gap,
    regions,
    orderingRegions: input.reservation
      ? computedRegionCatalog({
          ...geometry,
          catalog: clientCatalog,
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

/** Maps region paths onto the computed acquisition allocation without reading animated nodes. */
function computedRegionCatalog(input: RegionCatalogInput): WorkspacePlacedRegion[] {
  const proxies = allocateContextProxies(input);
  return regionCatalog(input, key => proxies.find(proxy => proxy.key === key)?.rect);
}

function regionCatalog(input: RegionCatalogInput, read: (key: string) => Rect | undefined): WorkspacePlacedRegion[] {
  const { catalog, allocation, source, bounds } = input;
  const vacant = allocation.some(
    region => region.node.type === 'group' && getPanelIds(region.node).every(id => source.includes(id))
  );
  const owners = new Set(
    allocation.filter(region => region.node.type === 'split').map(region => getContextKey(getPanelIds(region.node)))
  );
  const seen = new Set<string>();
  return [...catalog]
    .reverse()
    .flatMap(region => {
      const members = getPanelIds(region.node);
      const remaining = members.filter(id => !source.includes(id));
      if (!remaining.length) return [];
      const full = getContextKey(members);
      const key = vacant && region.node.type === 'split' && owners.has(full) ? full : getContextKey(remaining);
      const presented = read(key);
      if (!presented) return [];
      const rect = clipCue(presented, bounds);
      if (rect.width <= 0 || rect.height <= 0) return [];
      const identity = `${key}:${input.getRemainingLayoutSignature(region.node)}`;
      if (seen.has(identity)) return [];
      seen.add(identity);
      return [
        {
          ...region,
          rect: { x: presented.x, y: presented.y, width: presented.width, height: presented.height }
        }
      ];
    })
    .reverse();
}

function createRemainingLayoutSignatureResolver(input: {
  currentLayout: WorkspaceLayout;
  source: string[];
  available: string[];
}) {
  const visible = input.available.filter(id => !input.currentLayout.closed.includes(id));
  const projections = new Map<WorkspaceNode, WorkspaceNode | null>();
  const signatures = new Map<WorkspaceNode, string>();

  const getProjectedNode = (candidate: WorkspaceNode) => {
    if (!projections.has(candidate)) {
      projections.set(candidate, projectLayout({ version: 1, root: candidate, closed: [] }, visible).root);
    }
    return projections.get(candidate) ?? null;
  };

  return (node: WorkspaceNode) => {
    let signature = signatures.get(node);
    if (signature === undefined) {
      const carrier = findDeepestProjectionCarrier(
        input.currentLayout.root,
        getProjectionSignature(node),
        getProjectedNode
      );
      const remainingLayout = createDetachedLayout({ version: 1, root: carrier ?? node, closed: [] }, input.source);
      signature = JSON.stringify(remainingLayout.root);
      signatures.set(node, signature);
    }
    return signature;
  };
}

function groupTargets(regions: WorkspacePlacedRegion[], source: string[], headerHeight: number) {
  return regions.flatMap(region =>
    region.node.type === 'group'
      ? [{ panels: region.node.panels.filter(id => !source.includes(id)), rect: region.rect, headerHeight, tabs: [] }]
      : []
  );
}

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

/** Source occupancy is an ordinary target in the currently allocated reservation projection. */
function computedReservationHit(input: Parameters<typeof findTabHeaderTarget>[0]) {
  const group = computedSourceSlot(input);
  if (!group) return getTabReservationHit(input);
  if (contains(group, input.point)) return 'group' as const;
  return undefined;
}

/** Finds only genuine allocated whole-source occupancy, never an overlapping split indicator. */
function computedSourceSlot(
  input: Pick<Parameters<typeof findTabHeaderTarget>[0], 'groups' | 'source' | 'client' | 'bounds'>
): Rect | undefined {
  const group = input.groups.find(
    item => item.panels.length > 0 && item.panels.every(panel => input.source.includes(panel.id))
  );
  return group ? clipCue(input.client(group.rect), input.bounds) : undefined;
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

function interactionBounds(workspace: HTMLElement): Rect {
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

function canvasClientRect(workspace: HTMLElement, rect: Rect): Rect {
  const canvas = workspace.shadowRoot?.querySelector('.canvas')?.getBoundingClientRect();
  return { ...rect, x: rect.x + (canvas?.x ?? 0), y: rect.y + (canvas?.y ?? 0) };
}

function isNonOrderPreview(preview: WorkspaceDragPreview | undefined): preview is DetachedPreview {
  return (
    !!preview &&
    preview.phase === 'detached' &&
    preview.intent.kind !== 'order' &&
    preview.intent.kind !== 'insert' &&
    !(preview.intent.kind === 'invalid' && preview.allocation === 'reserved')
  );
}

function isOverlayDetachedPreview(
  preview: WorkspaceDragPreview | undefined
): preview is Exclude<WorkspaceDragPreview, { phase: 'attached' }> {
  return (
    !!preview &&
    'allocation' in preview &&
    preview.allocation === 'overlay' &&
    (preview.phase === 'detached' || preview.phase === 'returning-detached')
  );
}
