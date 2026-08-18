// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { HEIGHTFIELD_GRID, LAYER_CHILD } from '../errors.js';
import {
  getHeightfieldLayerTopologyVersion,
  getHeightfieldLayerVersion,
  takeHeightfieldLayerRenderData
} from '../internal/heightfield-layer-state.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { SceneHeightfield } from './heightfield.js';
import './define.js';

const validGrid = (
  overrides: Partial<{
    columns: number;
    colors: Uint8Array;
    heights: Float32Array;
    origin: [number, number];
    rows: number;
    spacing: number;
  }> = {}
) => ({
  columns: 2,
  heights: new Float32Array([0, 1, 2, 3]),
  rows: 2,
  spacing: 1,
  ...overrides
});

describe(SceneHeightfield.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
  });

  it('provides a reflected color and a property-only grid', async () => {
    fixture = await createFixture(html`<nve-scene-heightfield color="#123456"></nve-scene-heightfield>`);
    const heightfield = fixture.querySelector(SceneHeightfield.metadata.tag) as SceneHeightfield;
    await elementIsStable(heightfield);
    expect(heightfield.color).toBe('#123456');
    expect(heightfield.hasAttribute('grid')).toBe(false);
    heightfield.setAttribute('color', 'not-a-color');
    await elementIsStable(heightfield);
    expect(heightfield).toMatchObject({ color: '#808080' });
    expect(heightfield.getAttribute('color')).toBe('#808080');
  });

  it('reports validation failures, is inert, recovers, and begins a new error episode', async () => {
    fixture = await createFixture(html`<nve-scene-heightfield></nve-scene-heightfield>`);
    const heightfield = fixture.querySelector(SceneHeightfield.metadata.tag) as SceneHeightfield;
    const errors: CustomEvent<SceneErrorDetail>[] = [];
    heightfield.addEventListener('nve-scene-error', event => errors.push(event as CustomEvent<SceneErrorDetail>));
    const invalids = [
      validGrid({ heights: new Float32Array(3) }),
      validGrid({ colors: new Uint8Array(3) }),
      validGrid({ spacing: 0 }),
      validGrid({ rows: 1 }),
      validGrid({ columns: 1 }),
      validGrid({ rows: 2.5 }),
      validGrid({ columns: Number.MAX_SAFE_INTEGER }),
      validGrid({ origin: [Number.NaN, 0] }),
      validGrid({ heights: new Float32Array([0, 1, 2, Number.NaN]) }),
      { ...validGrid(), heights: [] },
      { ...validGrid(), colors: new Float32Array(16) }
    ];
    heightfield.grid = invalids[0] as never;
    heightfield.grid = invalids[0] as never;
    expect(errors.filter(error => error.detail.code === HEIGHTFIELD_GRID)).toHaveLength(1);
    heightfield.grid = validGrid();
    for (const grid of invalids) {
      heightfield.grid = grid as never;
      expect(takeHeightfieldLayerRenderData(heightfield).ready).toBe(false);
      heightfield.grid = validGrid();
      expect(takeHeightfieldLayerRenderData(heightfield).ready).toBe(true);
    }
    heightfield.grid = validGrid({ spacing: 0 });
    expect(errors.filter(error => error.detail.code === HEIGHTFIELD_GRID)).toHaveLength(invalids.length + 2);
    const error = errors[0];
    if (!error) throw new Error('Expected a heightfield-grid error.');
    expect(error).toMatchObject({ bubbles: true, cancelable: false, composed: true });
    expect(error.detail).toMatchObject({ code: HEIGHTFIELD_GRID, element: heightfield, severity: 'error' });
  });

  it('observes same-reference reassignment only after snapshot and retains topology', () => {
    const heightfield = new SceneHeightfield();
    const grid = validGrid();
    heightfield.grid = grid;
    const topologyVersion = getHeightfieldLayerTopologyVersion(heightfield);
    const version = getHeightfieldLayerVersion(heightfield);
    grid.heights[0] = 7;
    expect(heightfield.heightAt(0, 0)).toBe(0);
    heightfield.grid = grid;
    expect(heightfield.heightAt(0, 0)).toBe(7);
    expect(getHeightfieldLayerTopologyVersion(heightfield)).toBe(topologyVersion);
    expect(getHeightfieldLayerVersion(heightfield)).toBeGreaterThan(version);
    heightfield.grid = validGrid({ spacing: 2 });
    expect(getHeightfieldLayerTopologyVersion(heightfield)).toBeGreaterThan(topologyVersion);
  });

  it('multiplies parsed base color with samples and treats alpha as transparent', () => {
    const heightfield = new SceneHeightfield();
    heightfield.color = '#123456';
    heightfield.grid = validGrid({
      colors: new Uint8Array([255, 255, 255, 128, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255])
    });
    expect(takeHeightfieldLayerRenderData(heightfield)).toMatchObject({
      color: [0x12 / 255, 0x34 / 255, 0x56 / 255, 1],
      transparent: true
    });
  });

  it('uses owned terrain for local queries and drape semantics', () => {
    const heightfield = new SceneHeightfield();
    heightfield.grid = validGrid();
    expect(heightfield.heightAt(0.5, 0.5)).toBe(1.5);
    expect(heightfield.heightAt(-1, 0)).toBeUndefined();
    expect(heightfield.normalAt(0.5, 0.5)?.[2]).toBeGreaterThan(0);
    expect(heightfield.slopeAt(0.5, 0.5)).toBeGreaterThan(0);
    const points = new Float32Array([0, 0, 99, 4, 4, 7]);
    expect(heightfield.drape(points, 1)).toEqual(new Float32Array([0, 0, 1, 4, 4, 7]));
    expect(points[2]).toBe(99);
    heightfield.grid = null;
    expect(heightfield.heightAt(0, 0)).toBeUndefined();
    expect(heightfield.drape(points)).toEqual(points);
  });

  it('uses generic child diagnostics and recovers after removal', async () => {
    fixture = await createFixture(html`<nve-scene-heightfield></nve-scene-heightfield>`);
    const heightfield = fixture.querySelector(SceneHeightfield.metadata.tag) as SceneHeightfield;
    const errors: SceneErrorDetail[] = [];
    heightfield.addEventListener('nve-scene-error', event =>
      errors.push((event as CustomEvent<SceneErrorDetail>).detail)
    );
    heightfield.grid = validGrid();
    heightfield.append(document.createElement('span'));
    await elementIsStable(heightfield);
    expect(errors.at(-1)).toMatchObject({ code: LAYER_CHILD, element: heightfield, severity: 'error' });
    expect(takeHeightfieldLayerRenderData(heightfield).ready).toBe(false);
    heightfield.replaceChildren();
    await elementIsStable(heightfield);
    expect(takeHeightfieldLayerRenderData(heightfield).ready).toBe(true);
  });
});
