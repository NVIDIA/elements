// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Point, Rect } from '@nvidia-elements/core/internal';

import type { WorkspaceLayout } from '../model/layout.utils.js';
import type { WorkspaceDestination } from '../model/operations.utils.js';
import type { WorkspacePlacementContext } from '../placement/context.utils.js';
import type { WorkspacePlacementPlan } from '../placement/planner.utils.js';
import type { WorkspaceSeamPreview } from '../presentation/offers.utils.js';

type TabDestination = Omit<WorkspaceDestination, 'position'> & { position: 'tab' };

type SplitDestination = Omit<WorkspaceDestination, 'position'> & {
  position: Exclude<WorkspaceDestination['position'], 'tab'>;
};

export type WorkspaceDropIntent =
  | { kind: 'tab'; destination: TabDestination }
  | { kind: 'split' | 'order'; destination: SplitDestination }
  | { kind: 'insert'; destination: SplitDestination }
  | { kind: 'invalid' };

export interface WorkspaceDragCue {
  rect: Rect;
  kind: 'tab' | 'group';
}

interface PreviewPresentation {
  seams?: WorkspaceSeamPreview;
  context?: WorkspacePlacementContext;
  source: string[];
  point?: Point;
  cue: WorkspaceDragCue;
}

interface AttachedPreview extends PreviewPresentation {
  phase: 'attached';
  intent: { kind: 'invalid' };
  blocked: false;
}

export type WorkspaceDragAllocation =
  | { allocation: 'overlay' | 'committed' }
  | { allocation: 'reserved'; layout: WorkspaceLayout };

export type WorkspaceDragOffer = {
  cue: WorkspaceDragCue;
  feasible: boolean;
  seams?: WorkspaceSeamPreview;
  context?: WorkspacePlacementContext;
} & WorkspaceDragAllocation;

type DetachedPreview = PreviewPresentation &
  WorkspaceDragAllocation & {
    phase: 'detached';
    intent: WorkspaceDropIntent;
    blocked: boolean;
  };

export type WorkspaceDragPreview =
  | AttachedPreview
  | DetachedPreview
  | (PreviewPresentation &
      WorkspaceDragAllocation & {
        phase: 'returning-attached' | 'returning-detached';
        intent: { kind: 'invalid' };
        blocked: false;
      });

export interface WorkspacePlacementAcquisition {
  plan: WorkspacePlacementPlan;
  rect: Rect;
}

export interface WorkspaceOfferContext {
  selected?: WorkspaceDragPreview;
  acquisition?: WorkspacePlacementAcquisition & { point: Point };
}

export function clipCue(rect: Rect, bounds: Rect): Rect {
  const x = Math.max(bounds.x, Math.min(rect.x, bounds.x + bounds.width));
  const y = Math.max(bounds.y, Math.min(rect.y, bounds.y + bounds.height));
  return {
    x,
    y,
    width: Math.max(0, Math.min(rect.x + rect.width, bounds.x + bounds.width) - x),
    height: Math.max(0, Math.min(rect.y + rect.height, bounds.y + bounds.height) - y)
  };
}

export function matchesPlacementIntent(a: WorkspaceDropIntent, b: WorkspaceDropIntent) {
  if (a.kind === 'invalid' || b.kind === 'invalid' || a.kind !== b.kind) return false;
  return (
    a.destination.target === b.destination.target &&
    a.destination.region === b.destination.region &&
    a.destination.position === b.destination.position &&
    a.destination.index === b.destination.index
  );
}
