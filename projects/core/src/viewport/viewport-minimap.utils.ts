// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ViewportPoint, ViewportRect } from './viewport.types.js';

const PROJECTION_PADDING = 0.1;

export interface ViewportMinimapProjection {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly scale: number;
}

export function hasPositiveFiniteRect(rect: ViewportRect): boolean {
  return (
    Number.isFinite(rect.x) &&
    Number.isFinite(rect.y) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    rect.width > 0 &&
    rect.height > 0
  );
}

export function createViewportMinimapProjection(
  content: readonly ViewportRect[],
  visible: ViewportRect,
  size: { readonly width: number; readonly height: number }
): ViewportMinimapProjection | undefined {
  if (size.width <= 0 || size.height <= 0 || visible.width <= 0 || visible.height <= 0) return undefined;
  const extent = unionRects([visible, ...content]);
  if (!extent) return undefined;
  const paddingX = Math.max(extent.width * PROJECTION_PADDING, Number.EPSILON);
  const paddingY = Math.max(extent.height * PROJECTION_PADDING, Number.EPSILON);
  const coverage = {
    x: extent.x - paddingX,
    y: extent.y - paddingY,
    width: extent.width + paddingX * 2,
    height: extent.height + paddingY * 2
  };
  const scale = Math.min(size.width / coverage.width, size.height / coverage.height);
  if (!Number.isFinite(scale) || scale <= 0) return undefined;
  return {
    offsetX: (size.width - coverage.width * scale) / 2 - coverage.x * scale,
    offsetY: (size.height - coverage.height * scale) / 2 - coverage.y * scale,
    scale
  };
}

export function projectViewportMinimapRect(rect: ViewportRect, projection: ViewportMinimapProjection): ViewportRect {
  return {
    x: rect.x * projection.scale + projection.offsetX,
    y: rect.y * projection.scale + projection.offsetY,
    width: rect.width * projection.scale,
    height: rect.height * projection.scale
  };
}

export function unprojectViewportMinimapPoint(
  point: ViewportPoint,
  projection: ViewportMinimapProjection
): ViewportPoint {
  return {
    x: (point.x - projection.offsetX) / projection.scale,
    y: (point.y - projection.offsetY) / projection.scale
  };
}

function unionRects(rects: readonly ViewportRect[]): ViewportRect | undefined {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const rect of rects) {
    if (!hasPositiveFiniteRect(rect)) continue;
    left = Math.min(left, rect.x);
    top = Math.min(top, rect.y);
    right = Math.max(right, rect.x + rect.width);
    bottom = Math.max(bottom, rect.y + rect.height);
  }
  if (!Number.isFinite(left) || !Number.isFinite(top) || right <= left || bottom <= top) return undefined;
  return { x: left, y: top, width: right - left, height: bottom - top };
}
