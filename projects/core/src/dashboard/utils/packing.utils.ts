// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { doDashboardGridGeometriesOverlap, transposeDashboardGridGeometry } from './geometry.utils.js';

import type {
  DashboardAxis as Axis,
  DashboardAxisDirection as Direction,
  DashboardGridGeometry,
  DashboardGridPoint,
  DashboardIntent,
  DashboardPointerPlacementQuery
} from './intent.types.js';

import type { DashboardItem, DashboardLayout } from '../dashboard.types.js';

type SpanKey = 'columnSpan' | 'rowSpan';

interface MovementAxes {
  readonly movementAxis: Axis;
  readonly perpendicularAxis: Axis;
  readonly movementSpanKey: SpanKey;
  readonly perpendicularSpanKey: SpanKey;
  readonly direction: Direction;
}

interface ResizePressure {
  readonly movementAxis: Axis;
  readonly direction: Direction;
  readonly amount: number;
}

interface PlacementPlan {
  readonly items: readonly DashboardItem[];
  /** Preserve these items without applying another settling pass. */
  readonly skipSettling?: boolean;
}

interface PlacementCandidate extends PlacementPlan {
  readonly placedItem: DashboardItem;
  /** Tie-breaking priority for otherwise equal placements. */
  readonly priority: 0 | 1;
}

interface RankedCandidate extends PlacementCandidate {
  readonly distance: number;
  readonly rankCoordinate: number;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

const extent = 1_000_000;

/** Applies top gravity without moving panels through an overhanging predecessor. Coordinates are growth-normalized. */
export function settleDashboardItems(items: readonly DashboardItem[]): DashboardItem[] | undefined {
  const settled: DashboardItem[] = [];

  for (const item of [...items].sort(compareItems)) {
    let row = 0;

    for (const other of settled) {
      if (item.column < other.column + other.columnSpan && item.column + item.columnSpan > other.column) {
        row = Math.max(row, other.row + other.rowSpan);
      }
    }

    if (row + item.rowSpan > extent) return undefined;

    settled.push({ ...item, row });
  }

  return settled;
}

/** Resolves directional collisions into vacated space, with optional final top-gravity normalization. */
export function findNormalizedPlacementPlan(
  items: readonly DashboardItem[],
  request: { readonly id: string; readonly intent: DashboardIntent },
  options: { tracks: number; autoSettle?: boolean }
): DashboardItem[] | undefined {
  const source = items.find(item => item.id === request.id);
  if (!source) return undefined;

  const context = { items, source, ...options };
  const final = getNormalizedItems(selectPlan(context, request.intent), options.autoSettle);

  return final && [...final];
}

function getMovementAxes(
  source: DashboardGridGeometry,
  aimGeometry: DashboardGridGeometry,
  step?: DashboardGridPoint
): MovementAxes {
  const movementAxis = getMovementAxis(source, aimGeometry, step);
  const delta = step ? step[movementAxis] : aimGeometry[movementAxis] - source[movementAxis];

  return {
    movementAxis,
    perpendicularAxis: movementAxis === 'column' ? 'row' : 'column',
    movementSpanKey: movementAxis === 'column' ? 'columnSpan' : 'rowSpan',
    perpendicularSpanKey: movementAxis === 'column' ? 'rowSpan' : 'columnSpan',
    direction: delta >= 0 ? 1 : -1
  };
}

function getMovementAxis(
  source: DashboardGridGeometry,
  aimGeometry: DashboardGridGeometry,
  step?: DashboardGridPoint
): Axis {
  if (step) return step.column ? 'column' : 'row';

  const columnDistance = Math.abs(aimGeometry.column - source.column);
  const rowDistance = Math.abs(aimGeometry.row - source.row);

  return columnDistance > rowDistance ? 'column' : 'row';
}

function getSnappedPlacement(
  source: DashboardGridGeometry,
  aimGeometry: DashboardGridGeometry,
  tracks: number
): DashboardGridGeometry {
  return {
    column: Math.max(0, Math.min(tracks - source.columnSpan, Math.round(aimGeometry.column))),
    row: Math.max(0, Math.min(extent - source.rowSpan, Math.round(aimGeometry.row))),
    columnSpan: source.columnSpan,
    rowSpan: source.rowSpan
  };
}

function areGridGeometriesEqual(a: DashboardGridGeometry, b: DashboardGridGeometry): boolean {
  return a.column === b.column && a.row === b.row && a.columnSpan === b.columnSpan && a.rowSpan === b.rowSpan;
}

function getDisplacedItems(
  candidate: PlacementCandidate,
  items: readonly DashboardItem[],
  source: DashboardItem
): DashboardItem[] {
  return candidate.items.filter(
    item =>
      item.id !== source.id &&
      items.some(
        old =>
          old.id === item.id &&
          (old.column !== item.column ||
            old.row !== item.row ||
            old.columnSpan !== item.columnSpan ||
            old.rowSpan !== item.rowSpan)
      )
  );
}

function createUnchangedCandidate(items: readonly DashboardItem[], source: DashboardItem): PlacementCandidate {
  return {
    items: items.map(item => ({ ...item })),
    placedItem: { ...source },
    priority: 1,
    skipSettling: true
  };
}

function getUniqueCandidates(candidates: readonly PlacementCandidate[]): PlacementCandidate[] {
  const result = new Map<string, PlacementCandidate>();

  for (const candidate of candidates) {
    const key = JSON.stringify(
      candidate.items.map(item => [item.id, item.column, item.row, item.columnSpan, item.rowSpan])
    );
    const previous = result.get(key);

    if (!previous || candidate.priority < previous.priority) {
      result.set(key, candidate);
    }
  }

  return [...result.values()];
}

function getLocalCandidates(
  candidates: readonly PlacementCandidate[],
  placement: PlacementInput,
  context: MovementAxes
): PlacementCandidate[] {
  const { items, source } = placement;
  const { movementAxis, perpendicularAxis, perpendicularSpanKey, direction } = context;

  const classified = candidates.map(candidate => ({
    ...candidate,
    quiet: getDisplacedItems(candidate, items, source).every(
      item =>
        item[perpendicularAxis] >= source[perpendicularAxis] &&
        item[perpendicularAxis] + item[perpendicularSpanKey] <= source[perpendicularAxis] + source[perpendicularSpanKey]
    )
  }));

  const restricted = classified.some(
    candidate => candidate.quiet && (candidate.placedItem[movementAxis] - source[movementAxis]) * direction > 0
  );

  return restricted ? classified.filter(candidate => candidate.quiet) : classified;
}

function findBestCandidate(
  candidates: readonly PlacementCandidate[],
  input: {
    source: DashboardItem;
    aimGeometry: DashboardGridGeometry;
    context: MovementAxes;
    step?: DashboardGridPoint;
    autoSettle?: boolean;
  }
): PlacementCandidate | undefined {
  const { source, aimGeometry, context, step, autoSettle } = input;
  const { movementAxis, direction } = context;

  const eligible = step
    ? candidates.map(candidate => createAdvanceCandidate(candidate, { source, step, autoSettle })).filter(isDefined)
    : candidates.map(candidate => ({
        ...candidate,
        distance:
          (candidate.placedItem.column - aimGeometry.column) ** 2 + (candidate.placedItem.row - aimGeometry.row) ** 2,
        rankCoordinate: candidate.placedItem[movementAxis]
      }));

  eligible.sort(
    (a, b) =>
      a.distance - b.distance ||
      direction * (b.rankCoordinate - a.rankCoordinate) ||
      (areGridGeometriesEqual(a.placedItem, b.placedItem) ? a.priority - b.priority : 0)
  );

  return eligible[0];
}

function getNormalizedItems(
  candidate: PlacementPlan | undefined,
  autoSettle?: boolean
): readonly DashboardItem[] | undefined {
  if (!candidate) return undefined;
  if (candidate.skipSettling || !autoSettle) return candidate.items;

  return settleDashboardItems(candidate.items);
}

function findItemAtPointerPosition(
  items: readonly DashboardItem[],
  source: DashboardItem,
  query: Partial<Pick<DashboardPointerPlacementQuery, 'pointerPosition' | 'spacingFraction'>>
): DashboardItem | undefined {
  const { pointerPosition: point, spacingFraction } = query;
  return (
    point &&
    items.find(
      peer =>
        peer.id !== source.id &&
        point.column >= peer.column &&
        point.column < peer.column + peer.columnSpan - (spacingFraction?.column ?? 0) &&
        point.row >= peer.row &&
        point.row < peer.row + peer.rowSpan - (spacingFraction?.row ?? 0)
    )
  );
}

function findBestOverlappingItem(
  items: readonly DashboardItem[],
  source: DashboardItem,
  aimGeometry: DashboardGridGeometry
): DashboardItem | undefined {
  const peers = items
    .filter(peer => peer.id !== source.id)
    .map(peer => ({
      peer,
      coverage:
        (Math.max(
          0,
          Math.min(aimGeometry.column + source.columnSpan, peer.column + peer.columnSpan) -
            Math.max(aimGeometry.column, peer.column)
        ) *
          Math.max(
            0,
            Math.min(aimGeometry.row + source.rowSpan, peer.row + peer.rowSpan) - Math.max(aimGeometry.row, peer.row)
          )) /
        (Math.min(source.columnSpan, peer.columnSpan) * Math.min(source.rowSpan, peer.rowSpan))
    }))
    .filter(entry => entry.coverage >= 0.5);

  peers.sort((a, b) => b.coverage - a.coverage || compareItems(a.peer, b.peer));

  return peers[0]?.peer;
}

function hasMovementAxisContact(
  geometry: DashboardGridGeometry,
  body: DashboardGridGeometry | undefined,
  context: MovementAxes
): boolean {
  const { movementAxis, perpendicularAxis, movementSpanKey, perpendicularSpanKey } = context;
  return (
    !!body &&
    geometry[movementAxis] <= body[movementAxis] + body[movementSpanKey] &&
    geometry[movementAxis] + geometry[movementSpanKey] >= body[movementAxis] &&
    geometry[perpendicularAxis] < body[perpendicularAxis] + body[perpendicularSpanKey] &&
    geometry[perpendicularAxis] + geometry[perpendicularSpanKey] > body[perpendicularAxis]
  );
}

function createVacantPlacementCandidate(
  placement: PlacementInput,
  target: DashboardGridGeometry
): PlacementCandidate | undefined {
  const { items, source, tracks } = placement;
  const carried = { ...target, id: source.id };
  const plan = items.map(item => (item.id === source.id ? carried : item));
  if (
    items.every(item => item.id === source.id || !doDashboardGridGeometriesOverlap(item, carried)) &&
    isPlacementPlanValid(plan, tracks)
  ) {
    return { items: plan, placedItem: carried, priority: 1 };
  }

  return undefined;
}

function findPointerPlacementPlan(
  placement: PlacementInput,
  aimGeometry: DashboardGridGeometry,
  query: Partial<Pick<DashboardPointerPlacementQuery, 'pointerPosition' | 'spacingFraction'>> = {}
): PlacementCandidate | undefined {
  const { items, source, tracks, autoSettle } = placement;
  if (areGridGeometriesEqual(source, aimGeometry)) return createUnchangedCandidate(items, source);

  const owner = findItemAtPointerPosition(items, source, query);
  if (owner && owner.columnSpan === source.columnSpan && owner.rowSpan === source.rowSpan) {
    return createExchangeCandidate(placement, owner) ?? createUnchangedCandidate(items, source);
  }

  const context = getMovementAxes(source, aimGeometry);
  const literal = getSnappedPlacement(source, aimGeometry, tracks);

  if (!owner) {
    const vacancy = createVacantPlacementCandidate(placement, literal);
    if (vacancy) return vacancy;
  }

  const contact = owner ?? findBestOverlappingItem(items, source, aimGeometry);
  const candidates = createPointerCandidates(placement, literal, { contact, context }).filter(candidate =>
    isPointerCandidateAdmissible(candidate, placement, { literal, contact, context })
  );
  candidates.push(createUnchangedCandidate(items, source));

  const pool = getLocalCandidates(getUniqueCandidates(candidates), placement, context);

  return findBestCandidate(pool, { source, aimGeometry, context, autoSettle });
}

function createPointerCandidates(
  placement: PlacementInput,
  literal: DashboardGridGeometry,
  input: { contact?: DashboardItem; context: MovementAxes }
): PlacementCandidate[] {
  const { source, tracks } = placement;
  const { context } = input;
  const poses = getContactPlacements(source, literal, input);

  return getUniqueCandidates(
    poses
      .filter(
        pose =>
          pose.column >= 0 &&
          pose.row >= 0 &&
          pose.column + pose.columnSpan <= tracks &&
          pose.row + pose.rowSpan <= extent
      )
      .flatMap(pose => generateCandidates(placement, pose, context))
  );
}

function isPointerCandidateAdmissible(
  candidate: PlacementCandidate,
  placement: PlacementInput,
  input: { literal: DashboardGridGeometry; contact?: DashboardItem; context: MovementAxes }
): boolean {
  const { literal, contact, context } = input;
  if (areGridGeometriesEqual(candidate.placedItem, literal)) return true;

  return (
    getDisplacedItems(candidate, placement.items, placement.source).length > 0 &&
    hasMovementAxisContact(candidate.placedItem, contact, context)
  );
}

function resolveMovement(
  placement: PlacementInput,
  intent: Extract<DashboardIntent, { kind: 'coordinate' | 'pointer' | 'advance' }>
): PlacementCandidate | undefined {
  const { items, source, autoSettle } = placement;
  const aimGeometry = intent.kind === 'pointer' ? intent.position.aimGeometry : intent.geometry;
  if (intent.kind !== 'advance' && areGridGeometriesEqual(source, aimGeometry)) {
    return createUnchangedCandidate(items, source);
  }
  if (intent.kind !== 'advance') {
    return findPointerPlacementPlan(placement, aimGeometry, intent.kind === 'pointer' ? intent.position : undefined);
  }

  const { step } = intent;
  const context = getMovementAxes(source, intent.geometry, step);
  const candidates = getUniqueCandidates(generateCandidates(placement, intent.geometry, context));
  const pool = getLocalCandidates(candidates, placement, context);

  return findBestCandidate(pool, { source, aimGeometry: intent.geometry, context, step, autoSettle });
}

function generateCandidates(
  placement: PlacementInput,
  target: DashboardGridGeometry,
  context: MovementAxes
): PlacementCandidate[] {
  const { source } = placement;
  const { movementAxis, perpendicularAxis, perpendicularSpanKey, direction } = context;
  if ((target[movementAxis] - source[movementAxis]) * direction < 0) return [];

  const sharedStart = Math.max(source[perpendicularAxis], target[perpendicularAxis]);
  const sharedEnd = Math.min(
    source[perpendicularAxis] + source[perpendicularSpanKey],
    target[perpendicularAxis] + target[perpendicularSpanKey]
  );
  const candidates = createVacancyCandidates(placement, target, context);

  if (sharedStart >= sharedEnd) {
    const exchange = createExchangeCandidate(placement, target);

    if (exchange) {
      candidates.push(exchange);
    }
  } else {
    candidates.push(...createFrontierCandidates(placement, target, context));
  }

  return candidates;
}

function createVacancyCandidates(
  placement: PlacementInput,
  target: DashboardGridGeometry,
  context: MovementAxes
): PlacementCandidate[] {
  const { items, source, tracks } = placement;
  const { movementAxis, movementSpanKey, direction } = context;
  const max = (movementAxis === 'column' ? tracks : extent) - source[movementSpanKey];
  const ranges = getClearIntervals(
    getOccupiedIntervals(
      items.filter(item => item.id !== source.id),
      target,
      context
    ),
    max,
    source[movementSpanKey]
  );
  const candidates: PlacementCandidate[] = [];

  for (const interval of ranges) {
    const lo = Math.max(0, interval[0], direction > 0 ? source[movementAxis] : 0);
    const hi = Math.min(max, interval[1], direction < 0 ? source[movementAxis] : max);

    if (lo > hi) continue;

    const carried = { ...target, id: source.id, [movementAxis]: Math.max(lo, Math.min(hi, target[movementAxis])) };
    const plan = items.map(item => (item.id === source.id ? carried : item));

    if (isPlacementPlanValid(plan, tracks)) {
      candidates.push({ items: plan, placedItem: carried, priority: 1 });
    }
  }

  return candidates;
}

function createAdvanceCandidate(
  candidate: PlacementCandidate,
  input: { source: DashboardItem; step: DashboardGridPoint; autoSettle?: boolean }
): RankedCandidate | undefined {
  const { source, step, autoSettle } = input;
  const items = autoSettle ? settleDashboardItems(candidate.items) : candidate.items;
  const final = items?.find(item => item.id === source.id);
  const movementAxis = step.column ? 'column' : 'row';
  const direction = step[movementAxis];
  if (!items || !final || (final[movementAxis] - source[movementAxis]) * direction <= 0) {
    return undefined;
  }

  return {
    ...candidate,
    items,
    skipSettling: true,
    distance: Math.abs(final[movementAxis] - source[movementAxis]),
    rankCoordinate: final[movementAxis]
  };
}

/** Protected items seed the cascade and cannot move when another collision reaches them. */
function propagateDisplacement(
  items: readonly DashboardItem[],
  protectedIds: ReadonlySet<string>,
  input: { movementAxis: Axis; direction: Direction; tracks: number }
): DashboardItem[] | undefined {
  const result = new Map(items.map(item => [item.id, { ...item }]));
  const queue = [...protectedIds];

  for (let cursor = 0; cursor < queue.length; cursor++) {
    if (cursor >= items.length * items.length + items.length) return undefined;

    const id = queue[cursor];
    const blocker = id === undefined ? undefined : result.get(id);
    if (!blocker) return undefined;

    const updates = getDisplacementUpdates(blocker, [...result.values()], { ...input, protectedIds });
    if (!updates) return undefined;

    for (const next of updates) {
      result.set(next.id, next);
      queue.push(next.id);
    }
  }

  return [...result.values()];
}

function contains(outer: DashboardGridGeometry, inner: DashboardGridGeometry): boolean {
  return (
    inner.column >= outer.column &&
    inner.row >= outer.row &&
    inner.column + inner.columnSpan <= outer.column + outer.columnSpan &&
    inner.row + inner.rowSpan <= outer.row + outer.rowSpan
  );
}

function isPlacementPlanValid(items: readonly DashboardItem[], tracks: number): boolean {
  return items.every(
    (item, index) =>
      item.column >= 0 &&
      item.row >= 0 &&
      item.column + item.columnSpan <= tracks &&
      item.row + item.rowSpan <= extent &&
      items.slice(index + 1).every(peer => !doDashboardGridGeometriesOverlap(item, peer))
  );
}

export function orientDashboardItem(item: DashboardItem, flow: DashboardLayout['grid']['flow']): DashboardItem {
  return { id: item.id, ...orientDashboardGridGeometry(item, flow) };
}

function orientDashboardGridGeometry(
  geometry: DashboardGridGeometry,
  flow: DashboardLayout['grid']['flow']
): DashboardGridGeometry {
  return flow === 'vertical'
    ? { column: geometry.column, row: geometry.row, columnSpan: geometry.columnSpan, rowSpan: geometry.rowSpan }
    : transposeDashboardGridGeometry(geometry);
}

function compareItems(a: DashboardItem, b: DashboardItem): number {
  return a.row - b.row || a.column - b.column || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

interface PlacementInput {
  readonly items: readonly DashboardItem[];
  readonly source: DashboardItem;
  readonly tracks: number;
  readonly autoSettle?: boolean;
}

function selectPlan(placement: PlacementInput, intent: DashboardIntent): PlacementPlan | undefined {
  switch (intent.kind) {
    case 'start':
      return createStartPlan(placement, intent.geometry);
    case 'resize':
      return createResizePlan(placement, intent.geometry);
    case 'coordinate':
    case 'pointer':
    case 'advance':
      return resolveMovement(placement, intent);
    default: {
      const exhaustive: never = intent;
      return exhaustive;
    }
  }
}

function createStartPlan(placement: PlacementInput, target: DashboardGridGeometry): PlacementPlan | undefined {
  const { items, source, tracks } = placement;
  const carried = { ...target, id: source.id, columnSpan: source.columnSpan, rowSpan: source.rowSpan, row: 0 };
  const vacancy = createVacantPlacementCandidate(placement, carried);
  if (vacancy) return vacancy;

  const others = items.filter(item => item.id !== source.id);
  const minimum = others.length ? Math.min(...others.map(item => item.row)) : source.rowSpan;
  const shift = Math.max(0, source.rowSpan - minimum);
  const plan = items.map(item => (item.id === source.id ? carried : { ...item, row: item.row + shift }));

  return isPlacementPlanValid(plan, tracks) ? { items: plan } : undefined;
}

function createResizePlan(placement: PlacementInput, geometry: DashboardGridGeometry): PlacementPlan | undefined {
  const { items, source, tracks } = placement;
  const target = { id: source.id, ...geometry };
  const proposed = items.map(item => (item.id === source.id ? target : item));
  const primary = findPrimaryResizePressure(source, target);
  if (!primary) {
    return isPlacementPlanValid(proposed, tracks) ? { items: proposed } : undefined;
  }

  let result = propagateDisplacement(proposed, new Set([source.id]), {
    movementAxis: primary.movementAxis,
    direction: primary.direction,
    tracks
  });

  if (result && !isPlacementPlanValid(result, tracks)) {
    result = undefined;
  }

  if (!result && (primary.movementAxis !== 'row' || primary.direction !== 1)) {
    result = propagateDisplacement(proposed, new Set([source.id]), { movementAxis: 'row', direction: 1, tracks });
  }

  return result && isPlacementPlanValid(result, tracks) ? { items: result } : undefined;
}

function findPrimaryResizePressure(
  source: DashboardGridGeometry,
  target: DashboardGridGeometry
): ResizePressure | undefined {
  const outward = (
    [
      { movementAxis: 'column', direction: -1, amount: source.column - target.column },
      {
        movementAxis: 'column',
        direction: 1,
        amount: target.column + target.columnSpan - source.column - source.columnSpan
      },
      { movementAxis: 'row', direction: -1, amount: source.row - target.row },
      { movementAxis: 'row', direction: 1, amount: target.row + target.rowSpan - source.row - source.rowSpan }
    ] satisfies ResizePressure[]
  ).filter(edge => edge.amount > 0);

  outward.sort(
    (a, b) =>
      b.amount - a.amount ||
      (b.movementAxis === 'row' ? 1 : 0) - (a.movementAxis === 'row' ? 1 : 0) ||
      b.direction - a.direction
  );

  return outward[0];
}

function getContactPlacements(
  source: DashboardItem,
  literal: DashboardGridGeometry,
  input: { contact?: DashboardItem; context: MovementAxes }
): DashboardGridGeometry[] {
  const { contact, context } = input;
  const poses = [literal];
  if (!contact) return poses;

  for (const coordinate of [
    contact[context.movementAxis],
    contact[context.movementAxis] + contact[context.movementSpanKey] - source[context.movementSpanKey],
    contact[context.movementAxis] - source[context.movementSpanKey],
    contact[context.movementAxis] + contact[context.movementSpanKey]
  ]) {
    poses.push({ ...literal, [context.movementAxis]: coordinate });
  }

  return poses;
}

function createExchangeCandidate(
  placement: PlacementInput,
  target: DashboardGridGeometry
): PlacementCandidate | undefined {
  const { items, source, tracks } = placement;
  const occupants = items.filter(item => item.id !== source.id && doDashboardGridGeometriesOverlap(item, target));
  if (!occupants.length || !occupants.every(item => contains(target, item))) return undefined;

  const ids = new Set(occupants.map(item => item.id));
  const targetItem = { ...target, id: source.id };
  const plan = items.map(item => {
    if (item.id === source.id) return targetItem;
    if (ids.has(item.id)) {
      return { ...item, column: item.column + source.column - target.column, row: item.row + source.row - target.row };
    }

    return item;
  });

  return isPlacementPlanValid(plan, tracks) ? { items: plan, placedItem: targetItem, priority: 0 } : undefined;
}

function createFrontierCandidates(
  placement: PlacementInput,
  target: DashboardGridGeometry,
  context: MovementAxes
): PlacementCandidate[] {
  const { items, source } = placement;
  const { movementAxis, perpendicularAxis, movementSpanKey, perpendicularSpanKey, direction } = context;
  const sharedStart = Math.max(source[perpendicularAxis], target[perpendicularAxis]);
  const sharedEnd = Math.min(
    source[perpendicularAxis] + source[perpendicularSpanKey],
    target[perpendicularAxis] + target[perpendicularSpanKey]
  );
  const ahead = items.filter(
    item =>
      item.id !== source.id &&
      item[perpendicularAxis] < sharedEnd &&
      item[perpendicularAxis] + item[perpendicularSpanKey] > sharedStart &&
      (direction > 0
        ? item[movementAxis] >= source[movementAxis] + source[movementSpanKey]
        : item[movementAxis] + item[movementSpanKey] <= source[movementAxis])
  );
  const frontiers = [
    null,
    ...new Set(ahead.map(item => (direction > 0 ? item[movementAxis] + item[movementSpanKey] : item[movementAxis])))
  ];

  return frontiers
    .map(frontier => createFrontierCandidate(placement, { target, context, ahead, frontier }))
    .filter(isDefined);
}

function createFrontierCandidate(
  placement: PlacementInput,
  input: {
    target: DashboardGridGeometry;
    context: MovementAxes;
    ahead: readonly DashboardItem[];
    frontier: number | null;
  }
): PlacementCandidate | undefined {
  const { items, source, tracks } = placement;
  const { target, context, ahead, frontier } = input;
  const { movementAxis, movementSpanKey, direction } = context;
  const crossed =
    frontier === null
      ? []
      : ahead.filter(item =>
          direction > 0 ? item[movementAxis] + item[movementSpanKey] <= frontier : item[movementAxis] >= frontier
        );
  const ids = new Set(crossed.map(item => item.id));
  const remaining = ahead.filter(item => !ids.has(item.id));
  const { lo, hi, shift } = getFrontierRange(placement, { crossed, remaining, context });
  if (lo > hi) return undefined;

  const carried = { ...target, id: source.id, [movementAxis]: Math.max(lo, Math.min(hi, target[movementAxis])) };
  const protectedIds = new Set([source.id, ...ids]);
  const proposed = items.map(item => {
    if (item.id === source.id) return carried;
    if (ids.has(item.id)) return { ...item, [movementAxis]: item[movementAxis] + shift };

    return item;
  });
  const plan = propagateDisplacement(proposed, protectedIds, {
    movementAxis,
    direction: direction === 1 ? -1 : 1,
    tracks
  });

  return plan && isPlacementPlanValid(plan, tracks) ? { items: plan, placedItem: carried, priority: 0 } : undefined;
}

function getFrontierRange(
  placement: PlacementInput,
  input: { crossed: readonly DashboardItem[]; remaining: readonly DashboardItem[]; context: MovementAxes }
): { lo: number; hi: number; shift: number } {
  const { source, tracks } = placement;
  const { crossed, remaining, context } = input;
  const { movementAxis, movementSpanKey, direction } = context;
  if (direction > 0) {
    return {
      lo: Math.max(
        source[movementAxis],
        crossed.length
          ? Math.max(...crossed.map(item => item[movementAxis] + item[movementSpanKey])) - source[movementSpanKey]
          : source[movementAxis]
      ),
      hi: Math.min(
        movementAxis === 'column' ? tracks - source[movementSpanKey] : extent - source[movementSpanKey],
        remaining.length ? Math.min(...remaining.map(item => item[movementAxis])) - source[movementSpanKey] : Infinity
      ),
      shift: crossed.length ? source[movementAxis] - Math.min(...crossed.map(item => item[movementAxis])) : 0
    };
  }

  return {
    lo: Math.max(
      0,
      remaining.length ? Math.max(...remaining.map(item => item[movementAxis] + item[movementSpanKey])) : 0
    ),
    hi: Math.min(
      source[movementAxis],
      crossed.length ? Math.min(...crossed.map(item => item[movementAxis])) : source[movementAxis]
    ),
    shift: crossed.length
      ? source[movementAxis] +
        source[movementSpanKey] -
        Math.max(...crossed.map(item => item[movementAxis] + item[movementSpanKey]))
      : 0
  };
}

function getOccupiedIntervals(
  items: readonly DashboardItem[],
  target: DashboardGridGeometry,
  context: MovementAxes
): [number, number][] {
  const { movementAxis, perpendicularAxis, movementSpanKey, perpendicularSpanKey } = context;
  const occupied = items
    .filter(
      item =>
        item[perpendicularAxis] < target[perpendicularAxis] + target[perpendicularSpanKey] &&
        item[perpendicularAxis] + item[perpendicularSpanKey] > target[perpendicularAxis]
    )
    .map((item): [number, number] => [item[movementAxis], item[movementAxis] + item[movementSpanKey]])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: [number, number][] = [];

  for (const interval of occupied) {
    const last = merged.at(-1);

    if (last && interval[0] <= last[1]) {
      last[1] = Math.max(last[1], interval[1]);
    } else {
      merged.push([interval[0], interval[1]]);
    }
  }

  return merged;
}

function getClearIntervals(occupied: readonly [number, number][], max: number, span: number): [number, number][] {
  const clear: [number, number][] = [];
  let start = 0;

  for (const interval of occupied) {
    if (start <= interval[0] - span) {
      clear.push([start, interval[0] - span]);
    }

    start = Math.max(start, interval[1]);
  }

  if (start <= max) {
    clear.push([start, max]);
  }

  return clear;
}

function getDisplacementUpdates(
  blocker: DashboardItem,
  items: readonly DashboardItem[],
  input: { movementAxis: Axis; direction: Direction; tracks: number; protectedIds: ReadonlySet<string> }
): DashboardItem[] | undefined {
  const { movementAxis, direction, tracks, protectedIds } = input;
  const movementSpanKey = movementAxis === 'column' ? 'columnSpan' : 'rowSpan';
  const collisions = items
    .filter(item => item.id !== blocker.id && doDashboardGridGeometriesOverlap(item, blocker))
    .sort((a, b) => direction * (a[movementAxis] - b[movementAxis]) || compareItems(a, b));
  const updates: DashboardItem[] = [];

  for (const item of collisions) {
    if (protectedIds.has(item.id)) return undefined;

    const next = {
      ...item,
      [movementAxis]:
        direction < 0 ? blocker[movementAxis] - item[movementSpanKey] : blocker[movementAxis] + blocker[movementSpanKey]
    };
    if (next.column < 0 || next.row < 0 || next.column + next.columnSpan > tracks || next.row + next.rowSpan > extent) {
      return undefined;
    }

    updates.push(next);
  }

  return updates;
}
