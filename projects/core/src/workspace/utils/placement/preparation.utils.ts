// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rect } from '@nvidia-elements/core/internal';

import { admitsWorkspaceMove } from '../geometry/sizing.utils.js';
import { preservesGroupMembership } from '../model/membership.utils.js';
import { sameWorkspaceLayout } from '../model/value.utils.js';
import { resolveSelectedPlacementPlan } from './acquisition-sizing.utils.js';
import { planWorkspacePlacement } from './planner.utils.js';
import { sizePreferredSplit } from './split-sizing.utils.js';
import { getTabCue } from '../presentation/groups.utils.js';
import { getOfferAllocation, getOfferPresentation } from '../presentation/offers.utils.js';

import type { WorkspacePlacedRegion } from '../geometry/allocation.utils.js';
import type { WorkspacePlacementIntent } from '../interaction/command.utils.js';
import type { WorkspaceDragOffer, WorkspaceOfferContext } from '../interaction/drag-preview.utils.js';
import type { WorkspaceLayout } from '../model/layout.utils.js';
import type { WorkspacePlacementPlan, WorkspacePlacementPlanner } from './planner.utils.js';
import type { WorkspacePlacementSession } from './session.utils.js';
import type { WorkspaceMeasurements } from '../presentation/measurements.utils.js';
import type { WorkspaceEvaluation } from '../evaluation.utils.js';

interface PreparationInput {
  evaluation: WorkspaceEvaluation;
  layout: WorkspaceLayout;
  measurements: WorkspaceMeasurements;
}

interface CandidateInput extends PreparationInput {
  source: string[];
  intent: WorkspacePlacementIntent;
  planner?: WorkspacePlacementPlanner;
  placementSession?: WorkspacePlacementSession;
}

export interface WorkspacePlacementOfferInputs extends CandidateInput {
  context?: WorkspaceOfferContext;
  groupable: boolean;
  currentRegions(): WorkspacePlacedRegion[];
}

export function getAdmissiblePlacementLayout(
  input: CandidateInput & { groupable: boolean; candidate?: WorkspaceLayout }
): WorkspaceLayout | undefined {
  const { evaluation, layout, source, intent, groupable } = input;
  if (!groupable && !preservesGroupMembership({ root: layout.root, source, intent })) {
    return undefined;
  }
  const candidate = input.candidate ?? placementCandidate(input)?.layout;
  if (!candidate || sameWorkspaceLayout(candidate, layout)) {
    return undefined;
  }
  if (!placementFits({ ...input, candidate: evaluation.project(candidate) })) {
    return undefined;
  }
  return candidate;
}

export function evaluatePlacementOffer(input: WorkspacePlacementOfferInputs): WorkspaceDragOffer | undefined {
  return input.placementSession && !input.planner
    ? input.placementSession.prepareOffer(input)
    : computePlacementOffer(input);
}

function placementCandidate(input: CandidateInput): WorkspacePlacementPlan | undefined {
  const { evaluation, layout, source, intent, planner = planWorkspacePlacement } = input;
  const planning = {
    layout,
    source,
    destination: intent.destination,
    operation: intent.kind,
    available: evaluation.available,
    projectLayout: evaluation.projectLayout
  };
  const plan = input.placementSession && !input.planner ? input.placementSession.plan(planning) : planner(planning);
  return plan ? preferredPlacement(input, plan) : undefined;
}

function placementFits(input: PreparationInput & { candidate: WorkspaceLayout }): boolean {
  return admitsWorkspaceMove({
    current: input.evaluation.project(input.layout).root,
    candidate: input.candidate.root,
    viewport: { width: input.measurements.width, height: input.measurements.height },
    requirements: input.evaluation.requirements
  });
}

// Keep discovery structural; fit the acquired candidate before admission and preview.
export function computePlacementOffer(input: WorkspacePlacementOfferInputs): WorkspaceDragOffer | undefined {
  const { evaluation, source, intent, context } = input;
  const acquisition = context?.acquisition;
  const plan = acquisition ? preferredPlacement(input, acquisition.plan) : placementCandidate(input);
  if (!plan) return undefined;
  const { width, height } = evaluation.geometry(evaluation.project(plan.layout));
  const fit = resolveSelectedPlacementPlan({
    plan,
    source,
    available: evaluation.available,
    previous: context?.selected,
    intent,
    acquisition,
    current: input.currentRegions(),
    rect: { x: 0, y: 0, width, height },
    clientOrigin: evaluation.client({ x: 0, y: 0, width: 0, height: 0 }),
    requirements: evaluation.requirements,
    placementSession: input.planner ? undefined : input.placementSession
  });
  return placementOffer(input, fit ?? plan, !!fit);
}

function preferredPlacement(input: CandidateInput, plan: WorkspacePlacementPlan): WorkspacePlacementPlan {
  if (plan.kind !== 'split') return plan;
  const { evaluation, source } = input;
  return sizePreferredSplit({
    plan,
    source,
    available: evaluation.available,
    projectLayout: evaluation.projectLayout,
    preference: {
      allocation: evaluation.detached(source).regions,
      requirements: evaluation.requirements,
      resolveScopeRect: evaluation.resolveScopeRect
    }
  });
}

function placementOffer(
  input: WorkspacePlacementOfferInputs,
  plan: WorkspacePlacementPlan,
  fitted: boolean
): WorkspaceDragOffer | undefined {
  const { evaluation, layout, measurements, source, intent } = input;
  const candidate = evaluation.project(plan.layout);
  const geometry = evaluation.geometry(candidate);
  const group = geometry.groups.find(item => item.panels.some(panel => source.includes(panel.id)));
  if (!group) return undefined;
  const rect = evaluation.client(group.rect);
  const { cue, bounds } =
    intent.kind === 'tab'
      ? getTabCue({
          group,
          source,
          intent,
          root: layout.root,
          spatial: () => evaluation.detached(source).groups,
          measurements,
          viewport: evaluation.bounds(),
          client: target => evaluation.client(target),
          scroll: target => evaluation.scroll(target)
        })
      : { cue: rect, bounds: evaluation.bounds() };
  const feasible =
    fitted &&
    placementFits({ ...input, candidate }) &&
    (input.groupable || preservesGroupMembership({ root: layout.root, source, intent }));
  const presentation = getOfferPresentation({
    plan,
    regions: geometry.regions,
    sourceKey: group.key,
    sourceRect: rect,
    cue,
    bounds,
    destination: intent.destination,
    feasible,
    split: intent.kind === 'split' ? { ...evaluation.detached(source), source } : undefined,
    client: target => evaluation.client(target)
  });
  if (!hasVisiblePlacementCue(intent, presentation.cue)) return undefined;
  return {
    ...presentation,
    cue: { kind: intent.kind === 'tab' ? 'tab' : 'group', rect: presentation.cue },
    feasible,
    ...getOfferAllocation(plan, feasible)
  };
}

function hasVisiblePlacementCue(intent: WorkspacePlacementIntent, cue: Rect): boolean {
  return intent.kind === 'tab' || (cue.width !== 0 && cue.height !== 0);
}
