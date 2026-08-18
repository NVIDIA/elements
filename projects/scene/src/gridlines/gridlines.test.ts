// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { LAYER_CHILD } from '../errors.js';
import { takeStreamingLayerRenderData } from '../internal/streaming-layer-state.js';
import { readLineVertex } from '../internal/layouts/helpers.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { SceneGridlines } from './gridlines.js';
import './define.js';

describe(SceneGridlines.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('defines a depth-biased, non-pickable segmented reference layer', async () => {
    fixture = await createFixture(html`<nve-scene-gridlines></nve-scene-gridlines>`);
    const grid = fixture.querySelector<SceneGridlines>(SceneGridlines.metadata.tag);
    if (!grid) throw new Error('Expected grid layer.');
    await elementIsStable(grid);

    expect(customElements.get(SceneGridlines.metadata.tag)).toBe(SceneGridlines);
    expect(takeStreamingLayerRenderData(grid)).toMatchObject({
      count: 84,
      depthBias: true,
      kind: 'line',
      pickable: false,
      ready: true,
      topology: 'segments',
      widthUnit: 'pixel'
    });
    expect(grid.color).toBe('#a2a2a2');
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0).color).toEqual([
      162 / 255,
      162 / 255,
      162 / 255,
      1
    ]);
  });

  it('reflects attributes, regenerates vertices, and falls back from malformed values', async () => {
    fixture = await createFixture(
      html`<nve-scene-gridlines spacing="0.5" count="2" color="rgb(255 128 0 / 50%)" width="4"></nve-scene-gridlines>`
    );
    const grid = fixture.querySelector<SceneGridlines>(SceneGridlines.metadata.tag);
    if (!grid) throw new Error('Expected grid layer.');
    await elementIsStable(grid);

    expect(grid).toMatchObject({ color: 'rgb(255 128 0 / 50%)', count: 2, spacing: 0.5, width: 4 });
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0)).toEqual({
      color: [1, 128 / 255, 0, 128 / 255],
      dash: 0,
      gap: 0,
      normal: [0, 0, 1],
      position: [-1, -1, 0],
      width: 4
    });

    grid.spacing = 2;
    grid.count = 1;
    grid.color = 'rebeccapurple';
    grid.width = 3;
    await elementIsStable(grid);
    expect(grid.getAttribute('spacing')).toBe('2');
    expect(grid.getAttribute('count')).toBe('1');
    expect(grid.getAttribute('color')).toBe('rebeccapurple');
    expect(grid.getAttribute('width')).toBe('3');
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0).position).toEqual([-2, -2, 0]);

    grid.setAttribute('spacing', '-1');
    grid.setAttribute('count', '32768');
    grid.setAttribute('color', 'not-a-color');
    grid.setAttribute('width', '0');
    await elementIsStable(grid);
    expect(grid).toMatchObject({ color: '#a2a2a2', count: 10, spacing: 1, width: 1 });
    expect(grid.getAttributeNames()).toEqual(expect.arrayContaining(['spacing', 'count', 'color', 'width']));

    grid.spacing = Number.MAX_VALUE;
    await elementIsStable(grid);
    expect(grid).toMatchObject({ spacing: 1 });
    expect(grid.getAttribute('spacing')).toBe('1');
  });

  it('reserializes malformed attributes after the matching defaults have settled', async () => {
    fixture = await createFixture(html`<nve-scene-gridlines></nve-scene-gridlines>`);
    const grid = fixture.querySelector<SceneGridlines>(SceneGridlines.metadata.tag);
    if (!grid) throw new Error('Expected grid layer.');
    await elementIsStable(grid);

    grid.setAttribute('spacing', 'Infinity');
    grid.setAttribute('count', '0');
    grid.setAttribute('color', 'var(--unsupported-color)');
    grid.setAttribute('width', 'NaN');
    await elementIsStable(grid);

    expect(grid.getAttribute('spacing')).toBe('1');
    expect(grid.getAttribute('count')).toBe('10');
    expect(grid.getAttribute('color')).toBe('#a2a2a2');
    expect(grid.getAttribute('width')).toBe('1');
  });

  it('becomes inert for element children and recovers after they are removed', async () => {
    fixture = await createFixture(html`<nve-scene-gridlines></nve-scene-gridlines>`);
    const grid = fixture.querySelector<SceneGridlines>(SceneGridlines.metadata.tag);
    if (!grid) throw new Error('Expected grid layer.');
    const errors: SceneErrorDetail[] = [];
    grid.addEventListener('nve-scene-error', event => errors.push((event as CustomEvent<SceneErrorDetail>).detail));

    grid.append(document.createElement('span'));
    await elementIsStable(grid);
    expect(errors.at(-1)).toMatchObject({ code: LAYER_CHILD, element: grid, severity: 'error' });
    expect(takeStreamingLayerRenderData(grid).ready).toBe(false);

    grid.replaceChildren();
    await elementIsStable(grid);
    expect(takeStreamingLayerRenderData(grid)).toMatchObject({ count: 84, ready: true });
  });

  it('is hidden by the standard hidden state', async () => {
    fixture = await createFixture(html`<nve-scene-gridlines hidden></nve-scene-gridlines>`);
    const grid = fixture.querySelector<SceneGridlines>(SceneGridlines.metadata.tag);
    if (!grid) throw new Error('Expected grid layer.');
    await elementIsStable(grid);
    expect(getComputedStyle(grid).display).toBe('none');
  });
});
