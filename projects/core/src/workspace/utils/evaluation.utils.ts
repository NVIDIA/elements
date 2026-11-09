// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Dimensions, Point, Rect } from '@nvidia-elements/core/internal';

import { allocateWorkspace } from './geometry/allocation.utils.js';
import {
  getMinimumWorkspaceDimensions,
  getWorkspaceRequirements,
  sameWorkspaceRequirements,
  snapshotWorkspaceRequirements
} from './geometry/sizing.utils.js';
import { clipCue } from './interaction/drag-preview.utils.js';
import { getPanelIds } from './model/layout.utils.js';
import { getPanelMembershipKey } from './model/membership.utils.js';
import { createDetachedLayout, getFullscreenWorkspaceLayout, projectLayout } from './model/operations.utils.js';
import { createWorkspaceLayoutProjector, findDeepestProjectionCarrier } from './model/projection.utils.js';
import { sameWorkspaceNode } from './model/value.utils.js';
import { createScopeRectResolver, getAllocatedScopes } from './placement/scope.utils.js';
import {
  createPresentedGroups,
  findTabHeaderTarget,
  getTabReservationHit,
  preserveRecipientSelection,
  projectTabMembership
} from './presentation/groups.utils.js';
import { sameWorkspaceMeasurementScalars } from './presentation/measurements.utils.js';
import { sameArrayItems, sameRect } from './comparison.utils.js';

import type { WorkspaceBoundary, WorkspacePlacedRegion } from './geometry/allocation.utils.js';
import type { WorkspaceRequirements } from './geometry/sizing.utils.js';
import type { WorkspaceDragPreview } from './interaction/drag-preview.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './model/layout.utils.js';
import type { WorkspaceScopeRectResolver } from './placement/scope.utils.js';
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
  resolveScopeRect?: WorkspaceScopeRectResolver;
  targets: WorkspaceTarget[];
  regions: WorkspacePlacedRegion[];
  orderingRegions?: WorkspacePlacedRegion[];
  sourceReservation?: Rect;
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
  getRemainingRootKey(node: WorkspaceNode): number;
}

type DetachedPreview = Extract<WorkspaceDragPreview, { phase: 'detached' }>;

interface GeometryInputSnapshot {
  layout: WorkspaceLayout;
  closed: string[];
  source: string[];
  available: string[];
  panels: WorkspacePanel[];
  measurementIdentity: WorkspaceMeasurements;
  measurements: WorkspaceMeasurements;
  requirements: WorkspaceRequirements;
  policy: WorkspaceEvaluationInputs['policy'];
}
interface CachedWorkspaceGeometry {
  inputs: GeometryInputSnapshot;
  projected?: WorkspaceLayout;
  base?: WorkspaceGeometry;
  detached?: WorkspaceGeometry;
}

type PlacementCatalogInputs = Parameters<typeof workspaceInputCatalog>[0] & {
  measurements: WorkspaceMeasurements;
  requirements: WorkspaceRequirements;
};

type StructuralPlacementCatalog = Omit<WorkspacePlacementCatalog, 'preview' | 'headerTarget' | 'reservationHit'> & {
  gap: number;
};
interface PresentedGroupSnapshot {
  rect: Rect;
  panels: string[];
}
interface CatalogInputSnapshot {
  layout: WorkspaceLayout;
  closed: string[];
  source: string[];
  available: string[];
  measurementIdentity: WorkspaceMeasurements;
  measurements: WorkspaceMeasurements;
  requirements: WorkspaceRequirements;
  bounds: Rect;
  origin: Rect;
  catalog: WorkspacePlacedRegion[];
  allocation: WorkspacePlacedRegion[];
  reservation?: WorkspacePlacedRegion[];
  groups?: PresentedGroupSnapshot[];
}
interface CachedPlacementCatalog {
  inputs: CatalogInputSnapshot;
  catalog: StructuralPlacementCatalog;
}

/** Owns retained geometry and catalog data and the current synchronous evaluation for one Workspace. */
export class WorkspaceEvaluationCache {
  readonly #host: HTMLElement;
  #current?: WorkspaceEvaluation;
  geometry?: CachedWorkspaceGeometry;
  catalog?: CachedPlacementCatalog;

  constructor(host: HTMLElement) {
    this.#host = host;
  }

  get current() {
    return this.#current;
  }

  run<T>(
    inputs: WorkspaceEvaluationInputs,
    delegate: WorkspaceEvaluationDelegate | undefined,
    work: (evaluation: WorkspaceEvaluation) => T
  ): T {
    if (this.#current) return work(this.#current);
    const evaluation = new WorkspaceEvaluation(this.#host, inputs, delegate, this);
    this.#current = evaluation;
    try {
      return work(evaluation);
    } finally {
      this.#current = undefined;
    }
  }

  clear() {
    this.geometry = undefined;
    this.catalog = undefined;
  }
}

/** Shares layout inputs and browser reads within one synchronous evaluation. */
export class WorkspaceEvaluation {
  readonly panels: WorkspacePanel[];
  readonly available: string[];
  readonly requirements;
  readonly projectLayout = createWorkspaceLayoutProjector();
  readonly resolveScopeRect = createScopeRectResolver();

  readonly #host: HTMLElement;
  readonly #inputs: WorkspaceEvaluationInputs;
  readonly #delegate?: WorkspaceEvaluationDelegate;
  readonly #cacheOwner?: WorkspaceEvaluationCache;
  readonly #scroll = new WeakMap<HTMLElement, number>();
  readonly #allocations = new Map<WorkspaceNode | null, Map<WorkspaceNode | null, WorkspaceGeometry>>();
  readonly #minima = new Map<WorkspaceNode | null, Dimensions>();
  readonly #detached = new WeakMap<string[], WorkspaceGeometry>();

  #validatedGeometry?: CachedWorkspaceGeometry;
  #origin?: Rect;
  #bounds?: Rect;

  // eslint-disable-next-line max-params -- Keep the optional cache owner explicit without allocating constructor options.
  constructor(
    host: HTMLElement,
    inputs: WorkspaceEvaluationInputs,
    delegate?: WorkspaceEvaluationDelegate,
    cacheOwner?: WorkspaceEvaluationCache
  ) {
    this.#host = host;
    this.#inputs = inputs;
    this.#delegate = delegate;
    this.#cacheOwner = cacheOwner;
    this.panels = inputs.panels;
    this.available = inputs.panels.map(panel => panel.id);
    this.requirements = getWorkspaceRequirements(inputs);
  }

  minimum(node: WorkspaceNode | null) {
    const retained = this.#retainedMinimum(node);
    if (retained) return retained;
    let minimum = this.#minima.get(node);
    if (!minimum) {
      minimum = getMinimumWorkspaceDimensions(node, this.requirements);
      this.#minima.set(node, minimum);
    }
    return minimum;
  }

  project(layout: WorkspaceLayout) {
    if (layout === this.#inputs.layout) {
      const entry = this.#getGeometryCache();
      if (entry) {
        if (entry.projected) {
          return entry.projected;
        }

        return (entry.projected = this.projectLayout(layout, this.available));
      }
    }
    return this.projectLayout(layout, this.available);
  }

  geometry(layout: WorkspaceLayout, extent = layout) {
    if (extent === layout) {
      const entry = this.#getGeometryCache();
      if (entry && entry.projected === layout) {
        if (entry.base) {
          return entry.base;
        }

        return (entry.base = allocateGeometry(
          { ...this.#inputs, minimum: node => this.minimum(node) },
          layout,
          extent
        ));
      }
    }
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
    const entry = this.#getGeometryCache(source);
    if (entry) {
      if (entry.detached) {
        return entry.detached;
      }

      return (entry.detached = this.geometry(
        this.project(createDetachedLayout(this.#inputs.layout, source)),
        this.project(this.#inputs.layout)
      ));
    }
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
    const measurements = this.#currentMeasurements;
    const preview = this.#delegate?.getCurrentPreview();
    const input = {
      gap: measurements.gap,
      measurements,
      requirements: this.requirements,
      currentLayout,
      catalog: this.geometry(this.project(currentLayout)).regions,
      allocation,
      reservation: this.presentationGeometry(),
      preview,
      source,
      available: this.available,
      bounds: this.bounds(),
      client: (rect: Rect) => this.client(rect),
      headerHeight: measurements.headerHeight
    };
    if (!this.#cacheOwner || !this.#canReuseCatalog(preview)) {
      this.#cacheOwner?.clear();
      return workspaceInputCatalog(input);
    }
    const origin = this.client({ x: 0, y: 0, width: 0, height: 0 });
    const previous = this.#cacheOwner.catalog;
    if (previous && sameCatalogInputs(previous.inputs, input, origin)) {
      return placementCatalogView(previous.catalog, preview);
    }

    this.#cacheOwner.catalog = undefined;
    const value = structuralPlacementCatalog(workspaceInputCatalog(input));
    this.#cacheOwner.catalog = {
      inputs: snapshotCatalogInputs(input, origin),
      catalog: value
    };
    return placementCatalogView(value, preview);
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

  #retainedMinimum(node: WorkspaceNode | null) {
    if (this.#cacheOwner?.geometry?.projected?.root !== node) return undefined;
    const entry = this.#getGeometryCache();
    return entry?.projected?.root === node ? (entry.base ?? entry.detached)?.minimum : undefined;
  }

  #canReuseGeometry(source?: string[]) {
    const preview = this.#delegate?.getCurrentPreview();
    return (
      this.#canReuseCurrentInputs() &&
      preview?.phase === 'detached' &&
      sameArrayItems(this.#inputs.source, preview.source) &&
      (!source || sameArrayItems(source, preview.source))
    );
  }

  #canReuseCatalog(preview: WorkspaceDragPreview | undefined): preview is DetachedPreview {
    return this.#cacheOwner?.current === this && preview?.phase === 'detached' && this.#host.isConnected;
  }

  #canReuseCurrentInputs() {
    return (
      this.#cacheOwner?.current === this &&
      this.#host.isConnected &&
      this.#inputs.layout === this.#currentLayout &&
      this.#inputs.measurements === this.#currentMeasurements &&
      this.#delegate?.getFullscreenTarget() === undefined &&
      this.#delegate?.getResizePreview() === undefined
    );
  }

  #invalidateGeometry() {
    this.#validatedGeometry = undefined;
    if (this.#cacheOwner) this.#cacheOwner.geometry = undefined;
    return undefined;
  }

  #hasCurrentPanelIds() {
    return (
      this.panels.length === this.available.length &&
      this.panels.every((panel, index) => panel.id === this.available[index])
    );
  }

  #matchesGeometry(snapshot: GeometryInputSnapshot) {
    return (
      sameGeometryInputs(snapshot, this.#inputs, this.available) &&
      sameWorkspaceRequirements(snapshot.requirements, this.requirements)
    );
  }

  // Check the binding once per synchronous private evaluation; keep native reads in that scope.
  #getGeometryCache(source?: string[]) {
    const owner = this.#cacheOwner;
    if (!owner || !this.#canReuseGeometry(source)) return this.#invalidateGeometry();
    const previous = owner.geometry;
    if (
      previous &&
      previous === this.#validatedGeometry &&
      previous.inputs.policy === this.#inputs.policy &&
      sameArrayItems(previous.inputs.source, this.#inputs.source)
    )
      return previous;
    if (!this.#hasCurrentPanelIds()) return this.#invalidateGeometry();
    if (previous && this.#matchesGeometry(previous.inputs)) return (this.#validatedGeometry = previous);
    const entry: CachedWorkspaceGeometry = { inputs: snapshotGeometryInputs(this.#inputs, this) };
    owner.geometry = entry;
    return (this.#validatedGeometry = entry);
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
    getRemainingRootKey: createRemainingRootKeyResolver({ currentLayout, source, available })
  };
  const clientCatalog = catalog.map(region => ({ ...region, rect: input.client(region.rect) }));
  const regions = computedRegionCatalog({
    ...geometry,
    catalog: clientCatalog,
    allocation: allocation.regions.map(region => ({ ...region, rect: input.client(region.rect) }))
  });

  return {
    gap: input.gap,
    resolveScopeRect: createScopeRectResolver(),
    regions,
    orderingRegions: input.reservation
      ? computedRegionCatalog({
          ...geometry,
          catalog: clientCatalog,
          allocation: input.reservation.regions.map(region => ({ ...region, rect: input.client(region.rect) }))
        })
      : regions,
    sourceReservation: input.reservation
      ? getSourceReservation({ ...input, groups: input.reservation.groups })
      : undefined,
    preview: input.preview,
    headers: computedChromeRects(input),
    targets: groupTargets(regions, source, input.headerHeight),
    bounds
  };
}

/** Maps region paths onto the computed acquisition allocation without reading animated nodes. */
function computedRegionCatalog(input: RegionCatalogInput): WorkspacePlacedRegion[] {
  const scopes = getAllocatedScopes(input);
  return regionCatalog(input, key => scopes.find(scope => scope.key === key)?.rect);
}

function regionCatalog(input: RegionCatalogInput, read: (key: string) => Rect | undefined): WorkspacePlacedRegion[] {
  const { catalog, allocation, source, bounds } = input;
  const vacant = allocation.some(
    region => region.node.type === 'group' && getPanelIds(region.node).every(id => source.includes(id))
  );
  const owners = vacant
    ? new Set(
        allocation
          .filter(region => region.node.type === 'split')
          .map(region => getPanelMembershipKey(getPanelIds(region.node)))
      )
    : undefined;
  const seen = new Set<string>();
  return [...catalog]
    .reverse()
    .flatMap(region => {
      const key = getCatalogMembershipKey(region, source, owners);
      if (!key) return [];
      const presented = read(key);
      if (!presented) return [];
      const rect = clipCue(presented, bounds);
      if (rect.width <= 0 || rect.height <= 0) return [];
      const identity = `${key}:${input.getRemainingRootKey(region.node)}`;
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

function getCatalogMembershipKey(
  region: WorkspacePlacedRegion,
  source: string[],
  owners: ReadonlySet<string> | undefined
) {
  const members = getPanelIds(region.node);
  const remaining = members.filter(id => !source.includes(id));
  if (!remaining.length) return undefined;
  if (remaining.length === members.length) return getPanelMembershipKey(members);
  if (owners && region.node.type === 'split') {
    const full = getPanelMembershipKey(members);
    if (owners.has(full)) return full;
  }
  return getPanelMembershipKey(remaining);
}

function createRemainingRootKeyResolver(input: {
  currentLayout: WorkspaceLayout;
  source: string[];
  available: string[];
}) {
  const visible = input.available.filter(id => !input.currentLayout.closed.includes(id));
  const projections = new Map<WorkspaceNode, WorkspaceNode | null>();
  const identities = new Map<WorkspaceNode, number>();
  const roots: (WorkspaceNode | null)[] = [];

  const getProjectedNode = (candidate: WorkspaceNode) => {
    if (!projections.has(candidate)) {
      projections.set(candidate, projectLayout({ version: 1, root: candidate, closed: [] }, visible).root);
    }
    return projections.get(candidate) ?? null;
  };

  return (node: WorkspaceNode) => {
    let identity = identities.get(node);
    if (identity === undefined) {
      const carrier = findDeepestProjectionCarrier(input.currentLayout.root, node, getProjectedNode);
      const remainingLayout = createDetachedLayout({ version: 1, root: carrier ?? node, closed: [] }, input.source);
      identity = roots.findIndex(root => sameWorkspaceNode(root, remainingLayout.root));
      if (identity < 0) {
        identity = roots.length;
        roots.push(remainingLayout.root);
      }
      identities.set(node, identity);
    }
    return identity;
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
  const group = getSourceReservation(input);
  if (!group) return getTabReservationHit(input);
  if (contains(group, input.point)) return 'group' as const;
  return undefined;
}

/** Finds only genuine allocated whole-source occupancy, never an overlapping split indicator. */
function getSourceReservation(
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

function placementCatalogView(
  value: StructuralPlacementCatalog,
  preview: WorkspaceDragPreview
): WorkspacePlacementCatalog & { gap: number } {
  return {
    gap: value.gap,
    resolveScopeRect: value.resolveScopeRect,
    regions: value.regions,
    orderingRegions: value.orderingRegions,
    sourceReservation: value.sourceReservation,
    preview,
    headers: value.headers,
    targets: value.targets,
    bounds: value.bounds
  };
}

function snapshotRect(rect: Rect): Rect {
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

function sameRegions(left: WorkspacePlacedRegion[], right: WorkspacePlacedRegion[]) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index++) {
    const a = left[index]!,
      b = right[index]!;
    if (a.key !== b.key || !sameRect(a.rect, b.rect) || !sameWorkspaceNode(a.node, b.node)) return false;
  }
  return true;
}

function sameGroups(left: PresentedGroupSnapshot[] | undefined, right: WorkspacePresentedGroup[] | undefined) {
  if (!left || !right) return left === undefined && right === undefined;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index++) {
    const a = left[index]!,
      b = right[index]!;
    if (!sameRect(a.rect, b.rect) || a.panels.length !== b.panels.length) return false;
    for (let panel = 0; panel < a.panels.length; panel++) if (a.panels[panel] !== b.panels[panel]!.id) return false;
  }
  return true;
}

function sameCatalogInputs(snapshot: CatalogInputSnapshot, input: PlacementCatalogInputs, origin: Rect) {
  return (
    sameCatalogBinding(snapshot, input) &&
    sameCatalogMeasurements(snapshot, input, origin) &&
    sameCatalogRegions(snapshot, input)
  );
}

function sameCatalogBinding(snapshot: CatalogInputSnapshot, input: PlacementCatalogInputs) {
  return (
    snapshot.layout === input.currentLayout &&
    snapshot.measurementIdentity === input.measurements &&
    sameArrayItems(snapshot.closed, input.currentLayout.closed) &&
    sameArrayItems(snapshot.source, input.source) &&
    sameArrayItems(snapshot.available, input.available)
  );
}

function sameCatalogMeasurements(snapshot: CatalogInputSnapshot, input: PlacementCatalogInputs, origin: Rect) {
  if (!sameWorkspaceMeasurementScalars(snapshot.measurements, input.measurements)) return false;
  return (
    sameRect(snapshot.bounds, input.bounds) &&
    sameRect(snapshot.origin, origin) &&
    sameWorkspaceRequirements(snapshot.requirements, input.requirements)
  );
}

function sameCatalogRegions(snapshot: CatalogInputSnapshot, input: PlacementCatalogInputs) {
  if (!sameRegions(snapshot.catalog, input.catalog) || !sameRegions(snapshot.allocation, input.allocation.regions))
    return false;
  if (!!snapshot.reservation !== !!input.reservation) return false;
  if (snapshot.reservation && input.reservation && !sameRegions(snapshot.reservation, input.reservation.regions))
    return false;
  return sameGroups(snapshot.groups, input.reservation?.groups);
}

function structuralPlacementCatalog(generated: ReturnType<typeof workspaceInputCatalog>): StructuralPlacementCatalog {
  return {
    gap: generated.gap,
    resolveScopeRect: generated.resolveScopeRect,
    regions: generated.regions,
    orderingRegions: generated.orderingRegions,
    sourceReservation: generated.sourceReservation,
    headers: generated.headers,
    targets: generated.targets,
    bounds: generated.bounds
  };
}

function snapshotCatalogInputs(input: PlacementCatalogInputs, origin: Rect): CatalogInputSnapshot {
  const { measurements, requirements } = input;
  const nodes = new Map<WorkspaceNode, WorkspaceNode>();
  function copyNode(node: WorkspaceNode): WorkspaceNode {
    let copy = nodes.get(node);
    if (!copy) {
      copy =
        node.type === 'group'
          ? { type: 'group', panels: [...node.panels], active: node.active }
          : { type: 'split', axis: node.axis, weights: [...node.weights], children: node.children.map(copyNode) };
      nodes.set(node, copy);
    }
    return copy;
  }
  const copyRegions = (regions: WorkspacePlacedRegion[]) =>
    regions.map(region => ({ key: region.key, node: copyNode(region.node), rect: snapshotRect(region.rect) }));
  return {
    layout: input.currentLayout,
    closed: [...input.currentLayout.closed],
    source: [...input.source],
    available: [...input.available],
    measurementIdentity: measurements,
    measurements: { ...measurements, panels: undefined },
    requirements: snapshotWorkspaceRequirements(requirements),
    bounds: snapshotRect(input.bounds),
    origin: snapshotRect(origin),
    catalog: copyRegions(input.catalog),
    allocation: copyRegions(input.allocation.regions),
    reservation: input.reservation ? copyRegions(input.reservation.regions) : undefined,
    groups: input.reservation?.groups.map(group => ({
      rect: snapshotRect(group.rect),
      panels: group.panels.map(panel => panel.id)
    }))
  };
}

function sameGeometryInputs(snapshot: GeometryInputSnapshot, input: WorkspaceEvaluationInputs, available: string[]) {
  return (
    sameGeometryIdentity(snapshot, input) &&
    sameGeometryMembers(snapshot, input, available) &&
    sameWorkspaceMeasurementScalars(snapshot.measurements, input.measurements)
  );
}

function sameGeometryIdentity(snapshot: GeometryInputSnapshot, input: WorkspaceEvaluationInputs) {
  return (
    snapshot.layout === input.layout &&
    snapshot.measurementIdentity === input.measurements &&
    snapshot.policy === input.policy &&
    snapshot.panels.length === input.panels.length
  );
}

function sameGeometryMembers(snapshot: GeometryInputSnapshot, input: WorkspaceEvaluationInputs, available: string[]) {
  return (
    sameArrayItems(snapshot.closed, input.layout.closed) &&
    sameArrayItems(snapshot.source, input.source) &&
    sameArrayItems(snapshot.available, available) &&
    snapshot.panels.every(
      (panel, index) => panel === input.panels[index] && input.panels[index].id === available[index]
    )
  );
}

function snapshotGeometryInputs(
  input: WorkspaceEvaluationInputs,
  evaluation: WorkspaceEvaluation
): GeometryInputSnapshot {
  const { available, requirements } = evaluation;
  return {
    layout: input.layout,
    closed: [...input.layout.closed],
    source: [...input.source],
    available: [...available],
    panels: [...input.panels],
    measurementIdentity: input.measurements,
    measurements: { ...input.measurements, panels: undefined },
    policy: input.policy,
    requirements: snapshotWorkspaceRequirements(requirements)
  };
}
