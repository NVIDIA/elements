// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rect } from '@nvidia-elements/core/internal';

import { sameWorkspaceRequirements } from '../geometry/sizing.utils.js';
import { sameDestination } from '../model/operations.utils.js';
import { canReuseLayoutProjection } from '../model/projection.utils.js';
import { computeGroupInsertion } from './group-insertion.utils.js';
import { createWorkspacePlacementPlanner, planWorkspacePlacement } from './planner.utils.js';
import { computePlacementOffer } from './preparation.utils.js';
import { sameArrayItems, sameRect } from '../comparison.utils.js';

import type { WorkspaceRequirements } from '../geometry/sizing.utils.js';
import type { WorkspaceDragOffer } from '../interaction/drag-preview.utils.js';
import type { WorkspaceLayout } from '../model/layout.utils.js';
import type { WorkspaceDestination } from '../model/operations.utils.js';
import type { GroupInsertion, GroupInsertionInputs } from './group-insertion.utils.js';
import type { WorkspacePlacementPlanner } from './planner.utils.js';
import type { WorkspacePlacementOfferInputs } from './preparation.utils.js';
import type { WorkspaceMeasurements } from '../presentation/measurements.utils.js';

interface CachedInsertion {
  source: string[];
  available: string[];
  closed: string[];
  insertion: GroupInsertion | undefined;
}

interface CachedSplitOffer {
  layout: WorkspaceLayout;
  measurements: WorkspaceMeasurements;
  groupable: boolean;
  source: string[];
  available: string[];
  requirements: WorkspaceRequirements;
  destination: WorkspaceDestination;
  bounds: Rect;
  origin: Rect;
  offer: WorkspaceDragOffer | undefined;
}

/** Owns reusable planning work until the component finishes its current drag. */
export class WorkspacePlacementSession {
  readonly #planner = createWorkspacePlacementPlanner();
  readonly #producedLayouts = new WeakSet<WorkspaceLayout>();
  readonly #insertions = new WeakMap<WorkspaceLayout, CachedInsertion>();
  #splitOffer?: CachedSplitOffer;

  plan(input: Parameters<WorkspacePlacementPlanner>[0]) {
    if (!canReuseLayoutProjection(input.projectLayout)) return planWorkspacePlacement(input);
    const plan = this.#planner(input);
    if (plan) this.#producedLayouts.add(plan.layout);
    return plan;
  }

  getInsertion(input: GroupInsertionInputs): GroupInsertion | undefined {
    const layout = input.plan.layout;
    if (input.planPlacement || !this.#producedLayouts.has(layout) || !canReuseLayoutProjection(input.projectLayout)) {
      this.#insertions.delete(layout);
      return computeGroupInsertion(input);
    }
    const previous = this.#insertions.get(layout);
    if (
      previous &&
      sameArrayItems(previous.source, input.source) &&
      sameArrayItems(previous.available, input.available) &&
      sameArrayItems(previous.closed, layout.closed)
    )
      return previous.insertion;
    this.#insertions.delete(layout);
    const insertion = computeGroupInsertion(input);
    this.#insertions.set(layout, {
      source: [...input.source],
      available: [...input.available],
      closed: [...layout.closed],
      insertion
    });
    return insertion;
  }

  prepareOffer(input: WorkspacePlacementOfferInputs): WorkspaceDragOffer | undefined {
    if (!canReuseSplitOffer(input)) {
      this.#splitOffer = undefined;
      return this.#computeOffer(input);
    }
    const bounds = input.evaluation.bounds();
    const origin = input.evaluation.client({ x: 0, y: 0, width: 0, height: 0 });
    const previous = this.#splitOffer;
    if (
      previous &&
      sameOfferInputs(previous, input) &&
      sameRect(previous.bounds, bounds) &&
      sameRect(previous.origin, origin)
    ) {
      return previous.offer;
    }
    this.#splitOffer = undefined;
    const offer = this.#computeOffer(input);
    const { target, position, region, index } = input.intent.destination;
    this.#splitOffer = {
      layout: input.layout,
      measurements: input.measurements,
      groupable: input.groupable,
      source: [...input.source],
      available: input.evaluation.available,
      requirements: input.evaluation.requirements,
      destination: { target, position, region, index },
      bounds,
      origin,
      offer
    };
    return offer;
  }

  #computeOffer(input: WorkspacePlacementOfferInputs) {
    const sessionInput =
      input.planner || input.placementSession === this ? input : { ...input, placementSession: this };
    return computePlacementOffer(sessionInput);
  }
}

function canReuseSplitOffer(input: WorkspacePlacementOfferInputs) {
  return (
    !input.planner &&
    canReuseLayoutProjection(input.evaluation.projectLayout) &&
    input.intent.kind === 'split' &&
    !input.context?.acquisition &&
    !input.context?.selected?.blocked
  );
}

function sameOfferInputs(previous: CachedSplitOffer, input: WorkspacePlacementOfferInputs) {
  return (
    previous.layout === input.layout &&
    previous.measurements === input.measurements &&
    previous.groupable === input.groupable &&
    sameArrayItems(previous.source, input.source) &&
    sameArrayItems(previous.available, input.evaluation.available) &&
    sameDestination(previous.destination, input.intent.destination) &&
    sameWorkspaceRequirements(previous.requirements, input.evaluation.requirements)
  );
}
