// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ViewportPoint, ViewportTransform } from './viewport.types.js';

export function anchoredTransform(anchor: ViewportPoint, viewport: ViewportPoint, scale: number): ViewportTransform {
  return {
    scale,
    x: anchor.x - viewport.x / scale,
    y: anchor.y - viewport.y / scale
  };
}

export function contentPointFromViewport(
  viewportX: number,
  viewportY: number,
  transform: ViewportTransform
): ViewportPoint {
  return {
    x: viewportX / transform.scale + transform.x,
    y: viewportY / transform.scale + transform.y
  };
}

export function centeredScaleTransform(
  scale: number,
  transform: ViewportTransform,
  viewportSize: { width: number; height: number }
): ViewportTransform {
  const viewport = { x: viewportSize.width / 2, y: viewportSize.height / 2 };
  return anchoredTransform(contentPointFromViewport(viewport.x, viewport.y, transform), viewport, scale);
}
