// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import {
  copyPickHit,
  requestScenePick,
  type PickScope,
  type ScenePickRequest,
  type ScenePickResult
} from './routing.js';

function canvasWithRect(rect: Partial<DOMRect> = {}): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'width', { value: 200, writable: true });
  Object.defineProperty(canvas, 'height', { value: 100, writable: true });
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    bottom: 55,
    height: 50,
    left: 10,
    right: 110,
    top: 5,
    width: 100,
    x: 10,
    y: 5,
    toJSON: () => ({}),
    ...rect
  });
  return canvas;
}

function result(layer: HTMLElement): ScenePickResult {
  return {
    clientX: 60,
    clientY: 30,
    layer,
    instanceIndex: 2,
    target: { index: 2, kind: 'instance' },
    worldPosition: [1, 2, 3]
  };
}

describe('pick routing', () => {
  it('returns null outside the canvas and uses its supplied driver inside it', async () => {
    const canvas = canvasWithRect();
    const layer = document.createElement('div');
    const requests: ScenePickRequest[] = [];
    const driver = (request: ScenePickRequest) => {
      requests.push(request);
      return Promise.resolve(result(layer));
    };

    await expect(requestScenePick({ driver, canvas, clientX: 9, clientY: 10 })).resolves.toBeNull();
    await expect(
      requestScenePick({
        driver,
        canvas: canvasWithRect({ width: 0, right: 10 }),
        clientX: 10,
        clientY: 5
      })
    ).resolves.toBeNull();
    await expect(
      requestScenePick({
        driver,
        canvas: canvasWithRect({ height: 0, bottom: 5 }),
        clientX: 10,
        clientY: 5
      })
    ).resolves.toBeNull();
    await expect(requestScenePick({ driver, canvas, clientX: 60, clientY: 30 })).resolves.toEqual(result(layer));
    expect(requests[0]).toMatchObject({ clientX: 60, clientY: 30, pixelX: 100, pixelY: 50 });
  });

  it('passes the selected scope to its typed driver', async () => {
    const canvas = canvasWithRect();
    const layer = document.createElement('div');
    const scopes: Array<PickScope | undefined> = [];
    const driver = vi.fn((request: ScenePickRequest, scope: PickScope) => {
      expect(request.pixelX).toBe(0);
      scopes.push(scope);
      return Promise.resolve(scopes.length === 1 ? result(layer) : null);
    });
    await expect(requestScenePick({ driver, canvas, clientX: 10, clientY: 5 })).resolves.toEqual(result(layer));
    await expect(
      requestScenePick({ driver, canvas, clientX: 10, clientY: 5, scope: 'interactive' })
    ).resolves.toBeNull();
    expect(driver).toHaveBeenCalledTimes(2);
    expect(scopes).toEqual(['all', 'interactive']);
  });

  it('copies a result into a fresh immutable public hit', () => {
    const layer = document.createElement('div');
    const original = { ...result(layer), featureId: 1842 };
    const hit = copyPickHit(original);
    const second = copyPickHit(original);
    expect(second).not.toBe(hit);
    expect(second.worldPosition).not.toBe(hit.worldPosition);
    expect(hit.worldPosition).not.toBe(original.worldPosition);
    expect(hit.target).not.toBe(original.target);
    expect(hit).toEqual({
      clientX: 60,
      clientY: 30,
      element: layer,
      featureId: 1842,
      layer,
      target: { index: 2, kind: 'instance' },
      worldPosition: [1, 2, 3]
    });
    expect(Object.isFrozen(hit)).toBe(true);
    expect(Object.isFrozen(hit.target)).toBe(true);
    expect(Object.isFrozen(hit.worldPosition)).toBe(true);
  });

  it('validates a renderer result before creating a public hit', () => {
    const original = result(document.createElement('div'));
    expect(() => copyPickHit({ ...original, instanceIndex: -1 })).toThrow(RangeError);
    expect(() => copyPickHit({ ...original, instanceIndex: 0.5 })).toThrow(RangeError);
    expect(() => copyPickHit({ ...original, layer: {} as HTMLElement })).toThrow(TypeError);
    expect(() => copyPickHit({ ...original, worldPosition: [1, Number.NaN, 3] })).toThrow(RangeError);
    expect(() => copyPickHit({ ...original, worldPosition: [1, 2] as never })).toThrow(RangeError);
  });

  it('retains immutable topology snapshots when the renderer target changes', () => {
    const vertexIndices: [number, number, number] = [0, 1, 2];
    const original: ScenePickResult = {
      ...result(document.createElement('div')),
      target: { index: 0, kind: 'triangle', vertexIndices }
    };
    const hit = copyPickHit(original);
    vertexIndices[0] = 9;
    expect(hit.target).toEqual({ index: 0, kind: 'triangle', vertexIndices: [0, 1, 2] });
    expect(Object.isFrozen(hit.target)).toBe(true);
    if (hit.target.kind !== 'triangle') throw new Error('Expected a triangle target.');
    expect(Object.isFrozen(hit.target.vertexIndices)).toBe(true);
    expect(copyPickHit({ ...original, featureId: 0 }).featureId).toBe(0);
    expect(copyPickHit(original)).not.toHaveProperty('featureId');
  });
});
