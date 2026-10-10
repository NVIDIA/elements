// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface ViewportTransform {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export interface ViewportPoint {
  readonly x: number;
  readonly y: number;
}

export interface ViewportRect extends ViewportPoint {
  readonly width: number;
  readonly height: number;
}

export type ViewportPanBehavior = boolean | 'space';

export type ViewportNavigationSource = 'pointer' | 'wheel' | 'pinch' | 'keyboard' | 'command' | 'minimap' | 'control';

export interface ViewportPanProposal {
  readonly source: ViewportNavigationSource;
  readonly event: Event;
  readonly next: ViewportTransform;
  readonly clientX?: number;
  readonly clientY?: number;
  readonly deltaX?: number;
  readonly deltaY?: number;
}

export type ViewportPanUpdateProposal = Omit<ViewportPanProposal, 'source'>;

export interface ViewportPanDetail extends ViewportPanProposal {
  readonly start: ViewportTransform;
}

export interface ViewportPointerPanDetail extends ViewportPanDetail {
  readonly source: 'pointer';
  readonly event: PointerEvent;
  readonly clientX: number;
  readonly clientY: number;
  readonly movementX: number;
  readonly movementY: number;
  readonly startClientX: number;
  readonly startClientY: number;
  readonly totalDisplacementX: number;
  readonly totalDisplacementY: number;
}
export type ViewportWheelPanDetail = ViewportPanDetail & {
  readonly source: 'wheel';
  readonly event: WheelEvent;
  readonly clientX: number;
  readonly clientY: number;
  readonly deltaX: number;
  readonly deltaY: number;
};
export type ViewportDiscretePanDetail = ViewportPanDetail & {
  readonly source: 'keyboard' | 'command';
  readonly event: KeyboardEvent | CommandEvent;
};

export type ViewportPanEndReason = 'up' | 'cancel' | 'lost-capture' | 'buttons-released' | 'pinch';

export interface ViewportPanEndRequest {
  readonly event: Event;
  readonly interrupted: boolean;
  readonly reason: ViewportPanEndReason;
}

export interface ViewportPanEndDetail extends ViewportPanEndRequest {
  readonly source: ViewportNavigationSource;
  readonly start: ViewportTransform;
  readonly transform: ViewportTransform;
}

export interface ViewportPanSession {
  readonly start: ViewportTransform;
  update(proposal: ViewportPanUpdateProposal): boolean;
  end(request: ViewportPanEndRequest): void;
}

export interface ViewportZoomProposal {
  readonly source: ViewportNavigationSource;
  readonly event: Event;
  readonly clientX?: number;
  readonly clientY?: number;
  readonly anchor: ViewportPoint;
  readonly factor: number;
  readonly next: ViewportTransform;
}

export interface ViewportZoomRequestOptions {
  readonly animated?: boolean;
}

export interface ViewportZoomDetail extends ViewportZoomProposal {
  readonly start: ViewportTransform;
}

export interface ViewportAnimationOptions {
  readonly duration?: number;
}

export interface ViewportRevealOptions {
  /** Uniform CSS-pixel inset reserved around the revealed bounds. */
  readonly inset?: number;
  readonly scale?: number;
  readonly animated?: boolean;
  readonly duration?: number;
}
