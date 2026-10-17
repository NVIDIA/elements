// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, svg } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { contextKey, type WorkspaceContextProxy } from './workspace-context.utils.js';
import type { PlacementOffer } from './workspace-offers.utils.js';
import type { WorkspaceDragPreview, WorkspaceRect } from './workspace-rearrange.controller.js';
import type { WorkspacePlacedRegion } from './workspace-placement.utils.js';
import { regionCornerStyle } from './workspace-region-presentation.utils.js';

/** Renders independent carried-title and insertion cues without copying supplied content. */
export function renderPreview(input: {
  preview: WorkspaceDragPreview;
  contexts: WorkspaceContextProxy[];
  regions: WorkspacePlacedRegion[];
  x: number;
  y: number;
  bounds: WorkspaceRect;
  title: string;
  hint?: PlacementOffer;
}) {
  const { preview, x, y, bounds, title } = input;
  const { rect, kind } = preview.cue;
  const destination = { ...rect, x: rect.x - x, y: rect.y - y };
  const point = preview.point;
  return html`${input.hint ? html`<div class="order-overlay" data-order-slot=${input.hint.scope.index} data-placement-hint=${input.hint.kind} inert aria-hidden="true" style=${`left:${input.hint.rect.x - x}px;top:${input.hint.rect.y - y}px;width:${input.hint.rect.width}px;height:${input.hint.rect.height}px`}></div>` : null}${repeat(
    input.contexts,
    context => context.key,
    context =>
      html`<div class="context-boundary" data-context-boundary=${context.key} ?data-active=${preview.context && context.key === contextKey(preview.context.members)} inert aria-hidden="true" style=${`left:${context.rect.x}px;top:${context.rect.y}px;width:${context.rect.width}px;height:${context.rect.height}px;${regionCornerStyle(context.rect, input.regions)}`}></div>`
  )}<nve-ghost class="destination" part="ghost" data-destination-ghost ?data-cue-clipped=${rect.width <= 0 || rect.height <= 0} data-drag-phase=${preview.phase} ?data-drop-blocked=${preview.blocked} data-destination-kind=${kind} ?data-reserved-placement=${reservedPlacement(preview)} style=${`transform:translate(${rect.x - x}px,${rect.y - y}px);width:${rect.width}px;height:${rect.height}px;${regionCornerStyle(destination, input.regions)}`}>${preview.blocked ? html`<nve-icon part="blocked-icon" name="cancel" status="danger" size="lg" aria-hidden="true"></nve-icon>` : null}${seamBadges(preview)}</nve-ghost>${point ? renderCarried({ point, x, y, bounds, title }) : null}`;
}

function renderCarried(input: {
  point: { x: number; y: number };
  x: number;
  y: number;
  bounds: WorkspaceRect;
  title: string;
}) {
  const { point, x, y, bounds, title } = input;
  const right = bounds.x + bounds.width;
  const bottom = bounds.y + bounds.height;
  const px = Math.max(bounds.x, Math.min(point.x + 12, right));
  const py = Math.max(bounds.y, Math.min(point.y + 12, bottom));
  return html`<nve-ghost class="carried" part="carried-ghost" data-carried-ghost style=${`left:${px - x}px;top:${py - y}px;width:max-content;max-width:${Math.max(0, Math.min(240, bounds.width))}px;max-height:${bounds.height}px;transform:translate(min(0px,calc(${right - px}px - 100%)),min(0px,calc(${bottom - py}px - 100%)))`}>${title}</nve-ghost>`;
}

function reservedPlacement(preview: WorkspaceDragPreview) {
  return (
    !preview.blocked &&
    'allocation' in preview &&
    preview.allocation === 'reserved' &&
    (preview.intent.kind === 'order' ||
      preview.intent.kind === 'insert' ||
      (preview.phase === 'detached' && preview.intent.kind === 'invalid' && preview.cue.kind === 'group'))
  );
}

/** Waits only for the existing return animation on a still-current preview. */
export async function settlePreviewReturn(
  host: { updateComplete: Promise<boolean>; shadowRoot: ShadowRoot | null },
  current: () => boolean
) {
  await host.updateComplete;
  if (!current()) return;
  const ghost = host.shadowRoot?.querySelector('[data-destination-ghost]');
  if (!ghost) return;
  ghost.getBoundingClientRect();
  await Promise.allSettled(ghost.getAnimations().map(animation => animation.finished));
}

function seamBadges(preview: WorkspaceDragPreview | undefined) {
  if (!preview || preview.phase !== 'detached' || preview.blocked || !preview.seams) return null;
  const { kind, edges } = preview.seams;
  return html`${edges.map(edge => {
    const vertical = edge.side === 'left' || edge.side === 'right';
    const normal = edge.side === 'left' || edge.side === 'top' ? `-${edge.offset}px` : `calc(100% + ${edge.offset}px)`;
    const position = vertical
      ? `left:${normal};top:${edge.fraction * 100}%`
      : `left:${edge.fraction * 100}%;top:${normal}`;
    const rotation = { right: 0, bottom: 90, left: 180, top: 270 }[edge.side];
    return html`<div class="seam-badge" data-seam-badge=${kind} data-seam-side=${edge.side} inert aria-hidden="true" style=${position}>
        <svg class="seam-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style=${`transform:rotate(${rotation}deg)`}>
          ${
            kind === 'split'
              ? svg`<path d="M3 4h9v16H3z" fill="currentColor" fill-opacity=".2" stroke="none"></path><rect x="2" y="4" width="20" height="16" rx="1"></rect><path d="M12 4v16"></path>`
              : svg`<rect x="2" y="7" width="7" height="10" rx="1" fill="currentColor" fill-opacity=".2"></rect><path d="M22 4h-9v16h9"></path>`
          }
        </svg>
      </div>`;
  })}`;
}

/** Reads allocation only from a preview that owns a proposed destination. */
export function previewAllocation(preview: WorkspaceDragPreview | undefined) {
  return preview && 'allocation' in preview ? preview.allocation : undefined;
}
