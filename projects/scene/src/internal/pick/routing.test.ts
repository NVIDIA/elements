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
import { setScenePickDriverForTesting } from '../../internal/testing.js';

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
  } as DOMRect);
  return canvas;
}

function result(layer: HTMLElement, marker?: HTMLElement): ScenePickResult {
  return { layer, marker, instanceIndex: 2, worldPosition: [1, 2, 3] };
}

describe('pick routing', () => {
  it('returns null outside the canvas and uses an isolated testing driver inside it', async () => {
    const scene = document.createElement('div');
    const canvas = canvasWithRect();
    const layer = document.createElement('div');
    const requests: ScenePickRequest[] = [];
    setScenePickDriverForTesting(scene, request => {
      requests.push(request);
      return Promise.resolve(result(layer));
    });

    await expect(requestScenePick({ scene, renderer: null, canvas, clientX: 9, clientY: 10 })).resolves.toBeNull();
    await expect(
      requestScenePick({
        scene,
        renderer: null,
        canvas: canvasWithRect({ width: 0, right: 10 }),
        clientX: 10,
        clientY: 5
      })
    ).resolves.toBeNull();
    await expect(
      requestScenePick({
        scene,
        renderer: null,
        canvas: canvasWithRect({ height: 0, bottom: 5 }),
        clientX: 10,
        clientY: 5
      })
    ).resolves.toBeNull();
    await expect(requestScenePick({ scene, renderer: null, canvas, clientX: 60, clientY: 30 })).resolves.toEqual(
      result(layer)
    );
    expect(requests[0]).toMatchObject({ clientX: 60, clientY: 30, pixelX: 100, pixelY: 50 });
    setScenePickDriverForTesting(scene, undefined);
  });

  it('supports a renderer driver and preserves this binding while validating its result', async () => {
    const scene = document.createElement('div');
    const canvas = canvasWithRect();
    const layer = document.createElement('div');
    const marker = document.createElement('span');
    const scopes: Array<PickScope | undefined> = [];
    const renderer = {
      value: 4,
      pick: vi.fn(function (this: { value: number }, request: ScenePickRequest, scope?: PickScope) {
        expect(this.value).toBe(4);
        expect(request.pixelX).toBe(0);
        scopes.push(scope);
        return scopes.length === 1 ? result(layer, marker) : null;
      })
    };
    await expect(requestScenePick({ scene, renderer, canvas, clientX: 10, clientY: 5 })).resolves.toEqual(
      result(layer, marker)
    );
    await expect(
      requestScenePick({ scene, renderer, canvas, clientX: 10, clientY: 5, scope: 'interactive' })
    ).resolves.toBeNull();
    expect(renderer.pick).toHaveBeenCalledTimes(2);
    expect(scopes).toEqual(['all', 'interactive']);

    await expect(requestScenePick({ scene, renderer: {}, canvas, clientX: 20, clientY: 10 })).resolves.toBeNull();
    await expect(requestScenePick({ scene, renderer: 1, canvas, clientX: 20, clientY: 10 })).resolves.toBeNull();
  });

  it('rejects malformed renderer results', async () => {
    const scene = document.createElement('div');
    const canvas = canvasWithRect();
    const invalid = [
      1,
      { layer: document.createElement('div'), instanceIndex: -1, worldPosition: [0, 0, 0] },
      { layer: document.createElement('div'), instanceIndex: 0, worldPosition: [0, 0] },
      { layer: {}, instanceIndex: 0, worldPosition: [0, 0, 0] }
    ];
    for (const value of invalid) {
      const renderer = { pick: () => value };
      await expect(requestScenePick({ scene, renderer, canvas, clientX: 20, clientY: 10 })).rejects.toThrow();
    }
  });

  it('copies a result into a fresh immutable public hit', () => {
    const layer = document.createElement('div');
    const marker = document.createElement('span');
    const hit = copyPickHit(result(layer, marker));
    expect(hit).toEqual({ element: marker, layer, instanceIndex: 2, worldPosition: [1, 2, 3] });
    expect(Object.isFrozen(hit)).toBe(true);
    expect(Object.isFrozen(hit.worldPosition)).toBe(true);
  });
});
