// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { LAYER_CHILD } from '../internal/diagnostics/errors.js';
import { takeStreamingLayerRenderData } from '../internal/layers/streaming/layer-state.js';
import { readLineVertex } from '../internal/records/layouts/codecs.js';
import { SceneContent } from '../internal/composition/scene/content.js';
import { createSceneLayerRenderItem, resolveSceneLayer } from '../internal/composition/scene/layer-record.js';
import { MAX_GRID_COUNT } from './utils.js';
import { getGridlinesStyleSampler } from '../internal/layers/gridlines.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { SceneGridlines } from './gridlines.js';
import './define.js';
import '../frame/define.js';

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
    expect(grid.pattern).toBe('lines');
    expect('color' in grid).toBe(false);
    expect('alternateColor' in grid).toBe(false);
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0).color).toEqual([
      162 / 255,
      162 / 255,
      162 / 255,
      1
    ]);
  });

  it('normalizes attributes and regenerates vertices without reflecting property changes', async () => {
    fixture = await createFixture(
      html`<nve-scene-gridlines spacing="0.5" count="2" style="--color: rgb(255 128 0 / 50%)" width="4"></nve-scene-gridlines>`
    );
    const grid = fixture.querySelector<SceneGridlines>(SceneGridlines.metadata.tag);
    if (!grid) throw new Error('Expected grid layer.');
    await elementIsStable(grid);

    expect(grid).toMatchObject({ count: 2, spacing: 0.5, width: 4 });
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
    grid.style.setProperty('--color', 'rebeccapurple');
    grid.width = 3;
    await elementIsStable(grid);
    expect(grid.getAttribute('spacing')).toBe('0.5');
    expect(grid.getAttribute('count')).toBe('2');
    expect(grid.getAttribute('width')).toBe('4');
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0).position).toEqual([-2, -2, 0]);

    grid.setAttribute('spacing', '-1');
    grid.setAttribute('count', '32768');
    grid.setAttribute('width', '0');
    await elementIsStable(grid);
    expect(grid).toMatchObject({ count: 10, spacing: 1, width: 1 });
    expect(grid.getAttributeNames()).toEqual(expect.arrayContaining(['spacing', 'count', 'width']));

    grid.spacing = Number.MAX_VALUE;
    await elementIsStable(grid);
    expect(grid).toMatchObject({ spacing: 1 });
    expect(grid.getAttribute('spacing')).toBe('-1');
  });

  it('leaves malformed attributes authored after the matching defaults have settled', async () => {
    fixture = await createFixture(html`<nve-scene-gridlines></nve-scene-gridlines>`);
    const grid = fixture.querySelector<SceneGridlines>(SceneGridlines.metadata.tag);
    if (!grid) throw new Error('Expected grid layer.');
    await elementIsStable(grid);

    grid.setAttribute('spacing', 'Infinity');
    grid.setAttribute('count', '0');
    grid.setAttribute('width', 'NaN');
    await elementIsStable(grid);

    expect(grid.getAttribute('spacing')).toBe('Infinity');
    expect(grid.getAttribute('count')).toBe('0');
    expect(grid.getAttribute('width')).toBe('NaN');
  });

  it('becomes inert for element children and recovers after they are removed', async () => {
    fixture = await createFixture(html`<nve-scene-gridlines></nve-scene-gridlines>`);
    const grid = fixture.querySelector<SceneGridlines>(SceneGridlines.metadata.tag);
    if (!grid) throw new Error('Expected grid layer.');
    const errors: SceneErrorDetail[] = [];
    grid.addEventListener('nve-scene-error', event => errors.push(event.detail));

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

  it('packs a finite checkerboard into two corners even at the maximum count', async () => {
    fixture = await createFixture(html`
      <nve-scene-gridlines pattern="checkerboard" spacing="0.5" count="2" style="--color: red; --alternate-color: blue">
      </nve-scene-gridlines>
    `);
    const grid = fixture.querySelector('nve-scene-gridlines');
    if (!grid) throw new Error('Expected grid layer.');
    await elementIsStable(grid);
    expect(grid.pattern).toBe('checkerboard');
    const initial = takeStreamingLayerRenderData(grid);
    expect(initial).toMatchObject({ count: 2, depthBias: true, pickable: false, ready: true });
    expect(readLineVertex(initial.bytes!, 0)).toMatchObject({ position: [-1, -1, 0], color: [1, 0, 0, 1] });
    expect(readLineVertex(initial.bytes!, 1)).toMatchObject({ position: [1, 1, 0], color: [0, 0, 1, 1] });

    grid.width = 8;
    await elementIsStable(grid);
    expect(takeStreamingLayerRenderData(grid).bytes).toBe(initial.bytes);
    grid.count = MAX_GRID_COUNT;
    await elementIsStable(grid);
    const largest = takeStreamingLayerRenderData(grid);
    expect(largest.bytes?.byteLength).toBe(initial.bytes?.byteLength);
    expect(readLineVertex(largest.bytes!, 1).position).toEqual([MAX_GRID_COUNT / 2, MAX_GRID_COUNT / 2, 0]);
    expect(grid.getAttribute('count')).toBe('2');
  });

  it('switches patterns without reflecting property changes', async () => {
    fixture = await createFixture(
      html`<nve-scene-gridlines pattern="checkerboard" style="--alternate-color: blue"></nve-scene-gridlines>`
    );
    const grid = fixture.querySelector('nve-scene-gridlines');
    if (!grid) throw new Error('Expected grid layer.');
    await elementIsStable(grid);
    grid.pattern = 'lines';
    grid.style.setProperty('--alternate-color', 'rebeccapurple');
    grid.width = 3;
    await elementIsStable(grid);
    expect(takeStreamingLayerRenderData(grid).count).toBe(84);
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0).width).toBe(3);
    expect(grid.getAttribute('pattern')).toBe('checkerboard');

    grid.pattern = 'checkerboard';
    await elementIsStable(grid);
    expect(takeStreamingLayerRenderData(grid).count).toBe(2);
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 1).color).toEqual([0.4, 0.2, 0.6, 1]);
    grid.setAttribute('pattern', 'unsupported');
    await elementIsStable(grid);
    expect(grid.pattern).toBe('lines');
    grid.removeAttribute('pattern');
    await elementIsStable(grid);
    expect(grid.pattern).toBe('lines');
  });

  it('resolves inherited variables and currentColor and avoids repacking unchanged colors', async () => {
    fixture = await createFixture(html`
      <div style="--grid-primary: red; --grid-alternate: blue">
        <nve-scene-gridlines pattern="checkerboard" style="--color: var(--grid-primary); --alternate-color: var(--grid-alternate); color: rebeccapurple"></nve-scene-gridlines>
      </div>
    `);
    const grid = fixture.querySelector('nve-scene-gridlines');
    const parent = grid?.parentElement;
    if (!grid || !parent) throw new Error('Expected styled grid.');
    await elementIsStable(grid);
    const sample = getGridlinesStyleSampler(grid);
    if (!sample) throw new Error('Expected grid style sampler.');
    const before = takeStreamingLayerRenderData(grid);
    expect(readLineVertex(before.bytes!, 0).color).toEqual([1, 0, 0, 1]);
    expect(readLineVertex(before.bytes!, 1).color).toEqual([0, 0, 1, 1]);
    sample();
    expect(takeStreamingLayerRenderData(grid).bytes).toBe(before.bytes);
    parent.style.setProperty('--grid-primary', 'lime');
    sample();
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0).color).toEqual([0, 1, 0, 1]);
    grid.style.setProperty('--alternate-color', 'currentColor');
    sample();
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 1).color).toEqual([0.4, 0.2, 0.6, 1]);
    grid.style.setProperty('--color', '  CURRENTcolor  ');
    sample();
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0).color).toEqual([0.4, 0.2, 0.6, 1]);
    grid.style.color = 'lime';
    sample();
    const changed = takeStreamingLayerRenderData(grid);
    expect(readLineVertex(changed.bytes!, 0).color).toEqual([0, 1, 0, 1]);
    expect(readLineVertex(changed.bytes!, 1).color).toEqual([0, 1, 0, 1]);
  });

  it('uses theme tokens for both defaults and updates line colors without a Lit update', async () => {
    fixture = await createFixture(html`
      <nve-scene style="--nve-ref-border-color: red; --nve-sys-layer-canvas-background: blue">
        <nve-scene-gridlines></nve-scene-gridlines>
      </nve-scene>
    `);
    const grid = fixture.querySelector('nve-scene-gridlines');
    const parent = grid?.parentElement;
    if (!grid || !parent) throw new Error('Expected themed grid.');
    await elementIsStable(grid);
    const content = new SceneContent(parent);
    content.refresh();
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0).color).toEqual([1, 0, 0, 1]);
    parent.style.setProperty('--nve-ref-border-color', 'lime');
    content.sampleStyles();
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 0).color).toEqual([0, 1, 0, 1]);
    grid.pattern = 'checkerboard';
    await elementIsStable(grid);
    expect(readLineVertex(takeStreamingLayerRenderData(grid).bytes!, 1).color).toEqual([0, 0, 1, 1]);
    const beforeRemoval = takeStreamingLayerRenderData(grid).bytes;
    grid.remove();
    content.refresh();
    grid.style.setProperty('--color', 'red');
    content.sampleStyles();
    expect(takeStreamingLayerRenderData(grid).bytes).toBe(beforeRemoval);
  });

  it.each([
    { color: 'red', alternateColor: 'blue', opaque: true, transparent: false },
    { color: 'transparent', alternateColor: 'blue', opaque: true, transparent: true },
    { color: 'red', alternateColor: 'transparent', opaque: true, transparent: true },
    { color: 'rgb(255 0 0 / 50%)', alternateColor: 'blue', opaque: true, transparent: true },
    { color: 'rgb(255 0 0 / 50%)', alternateColor: 'transparent', opaque: false, transparent: true },
    { color: 'transparent', alternateColor: 'transparent', opaque: false, transparent: false }
  ])(
    'classifies checkerboard passes for $color and $alternateColor',
    async ({ color, alternateColor, opaque, transparent }) => {
      fixture = await createFixture(html`
      <nve-scene-gridlines pattern="checkerboard" style=${`--color: ${color}; --alternate-color: ${alternateColor}`}></nve-scene-gridlines>
    `);
      const grid = fixture.querySelector('nve-scene-gridlines');
      if (!grid) throw new Error('Expected grid layer.');
      await elementIsStable(grid);
      const record = resolveSceneLayer(grid);
      if (!record) throw new Error('Expected registered grid layer.');
      expect(createSceneLayerRenderItem(record)).toMatchObject({ checkerboard: 10, data: { opaque, transparent } });
      grid.append(document.createElement('span'));
      await elementIsStable(grid);
      expect(createSceneLayerRenderItem(record)).toMatchObject({
        data: { opaque: false, transparent: false, ready: false }
      });
      grid.replaceChildren();
      await elementIsStable(grid);
      expect(createSceneLayerRenderItem(record)).toMatchObject({ data: { opaque, transparent, ready: true } });
    }
  );

  it('composes checkerboards with owning frames and the standard hidden state', async () => {
    fixture = await createFixture(html`
      <nve-scene>
        <nve-scene-frame position="[3,4,5]" orientation="[0,0,1,0]">
          <nve-scene-gridlines pattern="checkerboard"></nve-scene-gridlines>
        </nve-scene-frame>
      </nve-scene>
    `);
    const scene = fixture.querySelector('nve-scene');
    const frame = fixture.querySelector('nve-scene-frame');
    const grid = fixture.querySelector('nve-scene-gridlines');
    if (!scene || !frame || !grid) throw new Error('Expected framed grid.');
    await elementIsStable(frame);
    await elementIsStable(grid);
    const content = new SceneContent(scene);
    content.refresh();
    content.resolveFrames();
    const [item] = content.compileRenderItems();
    expect(item).toMatchObject({ checkerboard: 10, data: { count: 2, pickable: false } });
    expect(Array.from(item!.frameMatrix)).toEqual([-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 3, 4, 5, 1]);
    grid.hidden = true;
    expect(content.compileRenderItems()).toEqual([]);
  });
});
