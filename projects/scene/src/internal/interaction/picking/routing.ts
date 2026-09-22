// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from '../../math/types.js';
import { mapClientToDevicePixel } from './coordinates.js';
import type { ScenePickHit, ScenePickTarget } from './types.js';

export type { SceneClick, ScenePickHit, ScenePickTarget, ScenePointerEnter, ScenePointerLeave } from './types.js';

/** Renderer-owned result before the scene creates an immutable public copy. */
export interface ScenePickResult {
  readonly clientX: number;
  readonly clientY: number;
  readonly featureId?: number;
  readonly layer: HTMLElement;
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
  if (!Number.isInteger(result.instanceIndex) || result.instanceIndex < 0) {
    throw new RangeError('Pick instance index must be a nonnegative integer.');
  }
  if (!(result.layer instanceof Element)) {
    throw new TypeError('Pick layer must be an Element.');
  }
  const position = result.worldPosition;
  if (position.length !== 3 || position.some(value => !Number.isFinite(value))) {
    throw new RangeError('Pick world position must contain three finite values.');
  }
  return Object.freeze({
    clientX: result.clientX,
    clientY: result.clientY,
    element: result.layer,
    ...(result.featureId === undefined ? {} : { featureId: result.featureId }),
    layer: result.layer,
    target: copyPickTarget(result.target),
    worldPosition: Object.freeze<Vec3>([position[0], position[1], position[2]])
  });
}

function createPickRequest(canvas: HTMLCanvasElement, clientX: number, clientY: number): ScenePickRequest | undefined {
  const pixel = mapClientToDevicePixel({
    clientX,
    clientY,
    rect: canvas.getBoundingClientRect(),
    size: canvas
  });
  return pixel ? { canvas, clientX, clientY, pixelX: pixel.x, pixelY: pixel.y } : undefined;
}

function copyPickTarget(target: ScenePickTarget): ScenePickTarget {
  if (target.kind === 'segment') {
    return Object.freeze({
      ...target,
      vertexIndices: Object.freeze<[number, number]>([...target.vertexIndices])
    });
  }
  if (target.kind === 'triangle') {
    return Object.freeze({
      ...target,
      vertexIndices: Object.freeze<[number, number, number]>([...target.vertexIndices])
    });
  }
  return Object.freeze({ ...target });
}
