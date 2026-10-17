// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { allocatedContextRect, type WorkspaceContextRectResolver } from './workspace-context.utils.js';
import { panelIds, fitSizes, type WorkspaceNode, type WorkspaceSplit } from './workspace-layout.utils.js';
import { projectLayout } from './workspace-operations.utils.js';
import type { WorkspacePlacedRegion } from './workspace-placement.utils.js';
import type { WorkspacePlacementPlan } from './workspace-planner.utils.js';
import { rebaseProjectedSplit } from './workspace-resize.utils.js';
import { minimumWorkspace, type WorkspaceRequirements } from './workspace-sizing.utils.js';
import type { WorkspaceLayoutProjector } from './workspace-projection.utils.js';

export interface WorkspaceSplitPreference {
  allocation: WorkspacePlacedRegion[];
  requirements: WorkspaceRequirements;
  contextRect?: WorkspaceContextRectResolver;
}

/** Fits placements to the final normalized branch budget, including every separator. */
export function sizePreferredSplit(input: {
  plan: WorkspacePlacementPlan;
  preference?: WorkspaceSplitPreference;
  source: string[];
  available: string[];
  projectLayout?: WorkspaceLayoutProjector;
}): WorkspacePlacementPlan {
  const { plan, preference, source, available } = input;
  if (!preference || !plan.context || plan.kind !== 'split') return plan;
  const visible = (input.projectLayout ?? projectLayout)(plan.layout, available).root;
  const branch = sourceBranch(visible, source);
  if (!branch) return plan;
  const sizing = splitSizingInput({ branch, preference, source, recipients: plan.context.members });
  if (!sizing) return plan;
  const sizes = preferredSizes(sizing);
  if (!sizes) return plan;
  const layout = rebaseProjectedSplit(plan.layout, branch, sizes, available, input.projectLayout);
  return layout ? { ...plan, layout } : plan;
}

function splitSizingInput(input: {
  branch: WorkspaceSplit;
  preference: WorkspaceSplitPreference;
  source: string[];
  recipients: string[];
}) {
  const { branch, preference, source, recipients } = input;
  const axis = branch.axis === 'horizontal' ? 'width' : 'height';
  const extent = (preference.contextRect ?? allocatedContextRect)({
    members: panelIds(branch).filter(id => !source.includes(id)),
    allocation: preference.allocation,
    source
  });
  if (!extent) return undefined;
  const entries = splitEntries({ branch, preference, source, recipients });
  if (!entries) return undefined;
  return {
    entries,
    preferred: recipientPreference({ members: recipients, preference, source, axis }),
    budget: extent[axis] - preference.requirements.gap * (entries.length - 1)
  };
}

function recipientPreference(input: {
  members: string[];
  preference: WorkspaceSplitPreference;
  source: string[];
  axis: 'width' | 'height';
}) {
  const rect = (input.preference.contextRect ?? allocatedContextRect)({
    members: input.members,
    allocation: input.preference.allocation,
    source: input.source
  });
  return rect ? Math.max(0, (rect[input.axis] - input.preference.requirements.gap) / 2) : Number.NaN;
}

function splitEntries(input: {
  branch: WorkspaceSplit;
  preference: WorkspaceSplitPreference;
  source: string[];
  recipients: string[];
}) {
  const { branch, preference, source, recipients } = input;
  const axis = branch.axis === 'horizontal' ? 'width' : 'height';
  const entries = branch.children.map(child => {
    const members = panelIds(child);
    const moving = members.every(id => source.includes(id));
    const donor = members.every(id => recipients.includes(id));
    const mixed = !donor && members.some(id => recipients.includes(id));
    const rect = moving
      ? undefined
      : (preference.contextRect ?? allocatedContextRect)({ members, allocation: preference.allocation, source });
    return {
      moving,
      donor,
      minimum: minimumWorkspace(child, preference.requirements)[axis],
      extent: rect?.[axis],
      mixed
    };
  });
  return entries.some(entry => entry.mixed || (!entry.moving && entry.extent === undefined)) ? undefined : entries;
}

function preferredSizes(input: {
  entries: NonNullable<ReturnType<typeof splitEntries>>;
  preferred: number;
  budget: number;
}) {
  const { entries, preferred, budget } = input;
  const moving = entries.find(entry => entry.moving);
  if (!moving || !Number.isFinite(preferred) || budget <= 0) return undefined;
  const fixed = entries.reduce((sum, entry) => sum + (!entry.moving && !entry.donor ? entry.extent! : 0), 0);
  const donors = entries.filter(entry => entry.donor && !entry.moving);
  const maximum = budget - fixed - donors.reduce((sum, entry) => sum + entry.minimum, 0);
  if (!donors.length) return undefined;
  const incoming = Math.max(moving.minimum, Math.min(preferred, maximum));
  if (maximum < moving.minimum) return minimumPressureSizes(entries, incoming, budget);
  const sizes = fitSizes(
    donors.map(entry => entry.extent!),
    donors.map(entry => entry.minimum),
    budget - fixed - incoming
  );
  let index = 0;

  function allocatedSize(entry: (typeof entries)[number]) {
    if (entry.moving) return incoming;
    if (entry.donor) return sizes[index++]!;
    return entry.extent!;
  }

  return entries.map(allocatedSize);
}

/** Reaches beyond the donor only for the unavoidable minimum shortfall. */
function minimumPressureSizes(entries: NonNullable<ReturnType<typeof splitEntries>>, incoming: number, budget: number) {
  const desired = entries.map(entry => pressureSize(entry, incoming));
  if (desired.some(value => value <= 0)) return undefined;
  return fitSizes(
    desired,
    entries.map(entry => entry.minimum),
    budget
  );
}

function pressureSize(entry: NonNullable<ReturnType<typeof splitEntries>>[number], incoming: number) {
  if (entry.moving) return incoming;
  if (entry.donor) return entry.minimum;
  return entry.extent!;
}

function sourceBranch(node: WorkspaceNode | null, source: string[]): WorkspaceSplit | undefined {
  if (!node || node.type === 'group') return undefined;
  if (node.children.some(child => child.type === 'group' && child.panels.some(id => source.includes(id)))) return node;
  for (const child of node.children) {
    const found = sourceBranch(child, source);
    if (found) return found;
  }
  return undefined;
}
