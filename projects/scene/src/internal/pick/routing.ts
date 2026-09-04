// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from '../../internal/types.js';
import { createPickHit } from './math.js';
import type { PickHit } from './types.js';

export type { PickHit } from './types.js';

/** Renderer-owned result before the scene creates an immutable public copy. */
export interface ScenePickResult {
  readonly layer: HTMLElement;
  readonly marker?: HTMLElement;
  readonly instanceIndex: number;
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

const testingDrivers = new WeakMap<HTMLElement, ScenePickDriver>();
const PICK_DRIVER_SET = Symbol.for('nve.scene.pick-driver.set');

Reflect.set(globalThis, PICK_DRIVER_SET, (scene: HTMLElement, driver: ScenePickDriver | undefined) => {
  if (driver) testingDrivers.set(scene, driver);
  else testingDrivers.delete(scene);
});

/** Converts client coordinates to the current device-pixel canvas location and requests an ID readback. */
export function requestScenePick(options: {
  scene: HTMLElement;
  renderer: unknown;
  canvas: HTMLCanvasElement;
  clientX: number;
  clientY: number;
  scope?: PickScope;
}): Promise<ScenePickResult | null> {
  const request = createPickRequest(options.canvas, options.clientX, options.clientY);
  if (!request) {
    return Promise.resolve(null);
  }
  const driver = testingDrivers.get(options.scene) ?? getRendererPickDriver(options.renderer);
  return driver ? driver(request, options.scope ?? 'all') : Promise.resolve(null);
}

export function copyPickHit(result: ScenePickResult): PickHit {
  return createPickHit(
    {
      layer: result.layer,
      marker: result.marker,
      instanceIndex: result.instanceIndex
    },
    result.worldPosition as Vec3
  );
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

function getRendererPickDriver(renderer: unknown): ScenePickDriver | undefined {
  if (typeof renderer !== 'object' || renderer === null) {
    return undefined;
  }
  const pick = Reflect.get(renderer, 'pick');
  if (typeof pick !== 'function') {
    return undefined;
  }
  return (request, scope) =>
    Promise.resolve(Reflect.apply(pick, renderer, [request, scope])).then(validateRendererPickResult);
}

function validateRendererPickResult(value: unknown): ScenePickResult | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'object' || value === null) {
    throw new TypeError('The scene renderer returned an invalid pick result.');
  }
  const layer = Reflect.get(value, 'layer');
  const marker = Reflect.get(value, 'marker');
  const instanceIndex = Reflect.get(value, 'instanceIndex');
  const worldPosition = Reflect.get(value, 'worldPosition');
  if (!isPickTarget(layer, marker)) {
    throw new TypeError('The scene renderer returned an invalid pick target.');
  }
  if (!Number.isInteger(instanceIndex) || instanceIndex < 0) {
    throw new RangeError('The scene renderer returned an invalid pick instance index.');
  }
  if (!isWorldPosition(worldPosition)) {
    throw new RangeError('The scene renderer returned an invalid pick world position.');
  }
  return { layer, marker, instanceIndex, worldPosition: [worldPosition[0], worldPosition[1], worldPosition[2]] };
}

function isPickTarget(layer: unknown, marker: unknown): layer is HTMLElement {
  return layer instanceof HTMLElement && (marker === undefined || marker instanceof HTMLElement);
}

function isWorldPosition(position: unknown): position is Vec3 {
  return Array.isArray(position) && position.length === 3 && position.every(coordinate => Number.isFinite(coordinate));
}
