// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { finiteOr, nonnegativeFiniteOr, positiveFiniteOr } from '@nvidia-elements/core/internal';
import type { ViewportRect, ViewportTransform } from './viewport.types.js';

export interface ViewportClientRect {
  readonly height: number;
  readonly left: number;
  readonly top: number;
  readonly width: number;
}

interface ViewportClientFrame {
  readonly left: number;
  readonly top: number;
}

export interface ViewportFitOptions {
  readonly inset?: number;
  readonly scale?: number;
}

/** Converts measurable client-space rectangles into their single content-space union. */
export function contentBoundsFromClientRects(
  clientRects: Iterable<ViewportClientRect>,
  viewportFrame: ViewportClientFrame,
  transform: ViewportTransform
): ViewportRect | undefined {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const clientRect of clientRects) {
    const contentRect = contentRectFromClientRect(clientRect, viewportFrame, transform);
    if (!contentRect) continue;
    left = Math.min(left, contentRect.x);
    top = Math.min(top, contentRect.y);
    right = Math.max(right, contentRect.x + contentRect.width);
    bottom = Math.max(bottom, contentRect.y + contentRect.height);
  }
  if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(right) || !Number.isFinite(bottom)) {
    return undefined;
  }
  return { height: bottom - top, width: right - left, x: left, y: top };
}

function contentRectFromClientRect(
  clientRect: ViewportClientRect,
  viewportFrame: ViewportClientFrame,
  transform: ViewportTransform
): ViewportRect | undefined {
  if (!(clientRect.width > 0) || !(clientRect.height > 0)) return undefined;
  return {
    height: clientRect.height / transform.scale,
    width: clientRect.width / transform.scale,
    x: transform.x + (clientRect.left - viewportFrame.left) / transform.scale,
    y: transform.y + (clientRect.top - viewportFrame.top) / transform.scale
  };
}

/** Calculates the viewport transform that centers or fits a content-space region. */
export function revealTarget(
  region: { x: number; y: number; width?: number; height?: number },
  configuration: {
    options: ViewportFitOptions;
    scaleRange: { min: number; max: number };
    transform: ViewportTransform;
    viewport: { width: number; height: number };
  }
): ViewportTransform {
  const { options, scaleRange, transform, viewport } = configuration;
  const inset = nonnegativeFiniteOr(options.inset, 0);
  const width = positiveFiniteOr(region.width, 0);
  const height = positiveFiniteOr(region.height, 0);
  const isRect = width > 0 && height > 0;
  const availableWidth = Math.max(0, viewport.width - inset * 2);
  const availableHeight = Math.max(0, viewport.height - inset * 2);
  const requestedScale =
    options.scale ??
    (isRect && availableWidth > 0 && availableHeight > 0
      ? Math.min(availableWidth / width, availableHeight / height)
      : transform.scale);
  const scale = Math.min(scaleRange.max, Math.max(scaleRange.min, positiveFiniteOr(requestedScale, scaleRange.min)));
  const centerX = finiteOr(region.x, 0) + (isRect ? width / 2 : 0);
  const centerY = finiteOr(region.y, 0) + (isRect ? height / 2 : 0);
  return {
    scale,
    x: centerX - viewport.width / (2 * scale),
    y: centerY - viewport.height / (2 * scale)
  };
}
