// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from '../../internal/types.js';
import { createPickHit } from './math.js';
import type { ScenePickHit, ScenePickTarget } from './types.js';

export type { ScenePickHit, ScenePickTarget } from './types.js';

/** Renderer-owned result before the scene creates an immutable public copy. */
export interface ScenePickResult {
  readonly clientX: number;
  readonly clientY: number;
  readonly featureId?: number;
  readonly layer: HTMLElement;
  readonly marker?: HTMLElement;
  readonly instanceIndex: number;
  readonly target: ScenePickTarget;
  readonly worldPosition: Readonly<Vec3>;
}

export interface ScenePickRequest {
  readonly canvas: HTMLCanvasElement;
  readonly clientX: number;
  readonly clientY: number;
  readonly pixelX: number;
  readonly pixelY: number;
}

export type PickScope = 'all' | 'interactive';

export type ScenePickDriver = (request: ScenePickRequest, scope: PickScope) => Promise<ScenePickResult | null>;

/** Converts client coordinates to the current device-pixel canvas location and requests an ID readback. */
export function requestScenePick(options: {
  /** Per-scene operation supplied by the Scene composition root. */
  driver: ScenePickDriver;
  canvas: HTMLCanvasElement;
  clientX: number;
  clientY: number;
  scope?: PickScope;
}): Promise<ScenePickResult | null> {
  const request = createPickRequest(options.canvas, options.clientX, options.clientY);
  if (!request) {
    return Promise.resolve(null);
  }
  return options.driver(request, options.scope ?? 'all');
}

export function copyPickHit(result: ScenePickResult): ScenePickHit {
  const hit = createPickHit(
    {
      layer: result.layer,
      marker: result.marker,
      instanceIndex: result.instanceIndex
    },
    result.worldPosition as Vec3
  );
  return Object.freeze({
    clientX: result.clientX,
    clientY: result.clientY,
    element: hit.element,
    ...(result.featureId === undefined ? {} : { featureId: result.featureId }),
    layer: hit.layer,
    target: copyPickTarget(result.target),
    worldPosition: hit.worldPosition
  });
}

function createPickRequest(canvas: HTMLCanvasElement, clientX: number, clientY: number): ScenePickRequest | undefined {
  const rect = canvas.getBoundingClientRect();
  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    clientX < rect.left ||
    clientX >= rect.right ||
    clientY < rect.top ||
    clientY >= rect.bottom
  ) {
    return undefined;
  }
  const pixelX = Math.floor(((clientX - rect.left) / rect.width) * canvas.width);
  const pixelY = Math.floor(((clientY - rect.top) / rect.height) * canvas.height);
  return { canvas, clientX, clientY, pixelX, pixelY };
}

function copyPickTarget(target: ScenePickTarget): ScenePickTarget {
  if (target.kind === 'segment') {
    return Object.freeze({
      ...target,
      vertexIndices: Object.freeze([...target.vertexIndices]) as readonly [number, number]
    });
  }
  if (target.kind === 'triangle') {
    return Object.freeze({
      ...target,
      vertexIndices: Object.freeze([...target.vertexIndices]) as readonly [number, number, number]
    });
  }
  return Object.freeze({ ...target });
}
