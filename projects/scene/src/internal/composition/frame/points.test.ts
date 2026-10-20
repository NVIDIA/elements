// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { getLocalPoint, getWorldPoint } from './points.js';
import { invalidateFrameTransform, registerFrameState, setFrameTransform } from './state.js';

describe('frame point conversion', () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
  });

  it('round trips through translated and rotated ancestors with independent immutable outputs', async () => {
    fixture = await createFixture(html`<div id="parent"><div id="point"></div></div>`);
    const parent = fixture.querySelector<HTMLElement>('#parent')!;
    const frame = fixture.querySelector<HTMLElement>('#point')!;
    const scene = document.createElement('nve-scene');
    fixture.append(scene);
    scene.append(parent);
    registerFrameState(parent);
    registerFrameState(frame);
    setFrameTransform(parent, { position: [10, 20, 30], orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2] });
    setFrameTransform(frame, { position: [2, 0, 0], orientation: [0, 0, 0, 1] });
    const input: [number, number, number] = [3, 0, 0];
    const world = getWorldPoint(frame, input)!;
    expect(world[0]).toBeCloseTo(10);
    expect(world[1]).toBeCloseTo(25);
    expect(world[2]).toBeCloseTo(30);
    const local = getLocalPoint(frame, world)!;
    local.forEach((value, index) => expect(value).toBeCloseTo(input[index]!));
    expect(Object.isFrozen(world)).toBe(true);
    expect(Object.isFrozen(local)).toBe(true);
    expect(input).toEqual([3, 0, 0]);
    invalidateFrameTransform(parent);
    expect(getWorldPoint(frame, input)).toBeNull();
    expect(getLocalPoint(frame, world)).toBeNull();
  });

  it('returns null outside a connected scene and after removal', async () => {
    const detached = document.createElement('div');
    expect(getWorldPoint(detached, [0, 0, 0])).toBeNull();
    fixture = await createFixture(html`<div id="outside"></div><div id="inside"></div>`);
    const outside = fixture.querySelector<HTMLElement>('#outside')!;
    const inside = fixture.querySelector<HTMLElement>('#inside')!;
    const scene = document.createElement('nve-scene');
    fixture.append(scene);
    scene.append(inside);
    expect(getLocalPoint(outside, [0, 0, 0])).toBeNull();
    expect(getWorldPoint(inside, [1, 2, 3])).toEqual([1, 2, 3]);
    inside.remove();
    expect(getWorldPoint(inside, [1, 2, 3])).toBeNull();
  });

  it('rejects nonfinite or malformed points without throwing', async () => {
    fixture = await createFixture(html`<div id="point"></div>`);
    const frame = fixture.querySelector<HTMLElement>('#point')!;
    const scene = document.createElement('nve-scene');
    fixture.append(scene);
    scene.append(frame);
    expect(getWorldPoint(frame, [NaN, 0, 0])).toBeNull();
    expect(getLocalPoint(frame, [0, Infinity, 0])).toBeNull();
    // @ts-expect-error Validate malformed callers at the runtime boundary.
    expect(getWorldPoint(frame, [0, 0])).toBeNull();
  });
});
