// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { ScenePoints } from '../../../points/points.js';
import '../../../points/define.js';
import { PointBuffer } from '../points/buffer.js';
import { takeStreamingLayerRenderData } from './layer-state.js';

let fixture: HTMLElement;
afterEach(() => {
  if (fixture) removeFixture(fixture);
});
describe('streaming layer element contract', () => {
  it('captures source edits only at publication and applies a bounded active prefix', async () => {
    fixture = await createFixture(html`<nve-scene-points interactive></nve-scene-points>`);
    const points = fixture.querySelector<ScenePoints>('nve-scene-points')!;
    await elementIsStable(points);
    const source = new PointBuffer({ records: [{ position: [1, 0, 0] }, {}] });
    points.source = source;
    const initial = takeStreamingLayerRenderData(points);
    source.at(0).position.x = 42;
    expect(new DataView(initial.bytes!.buffer, initial.bytes!.byteOffset).getFloat32(0, true)).toBe(1);
    points.publish({ start: 0, count: 1 });
    const published = takeStreamingLayerRenderData(points);
    expect(new DataView(published.bytes!.buffer, published.bytes!.byteOffset).getFloat32(0, true)).toBe(42);
    points.countLimit = 1;
    expect(takeStreamingLayerRenderData(points).count).toBe(1);
    expect(points.interactive).toBe(true);
    expect(() => {
      points.countLimit = 3;
    }).toThrow(RangeError);
    points.source = null;
    expect(points.source).toBeNull();
  });
});
