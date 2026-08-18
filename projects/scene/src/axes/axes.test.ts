// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { LAYER_CHILD } from '../errors.js';
import { readLineVertex } from '../internal/layouts/helpers.js';
import { takeStreamingLayerRenderData } from '../internal/streaming-layer-state.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { SceneAxes } from './axes.js';
import './define.js';

describe(SceneAxes.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('defines a six-vertex, non-pickable segmented reference layer', async () => {
    fixture = await createFixture(html`<nve-scene-axes></nve-scene-axes>`);
    const axes = fixture.querySelector<SceneAxes>(SceneAxes.metadata.tag);
    if (!axes) throw new Error('Expected axes layer.');
    await elementIsStable(axes);

    expect(customElements.get(SceneAxes.metadata.tag)).toBe(SceneAxes);
    expect(takeStreamingLayerRenderData(axes)).toMatchObject({
      count: 6,
      kind: 'line',
      pickable: false,
      ready: true,
      topology: 'segments',
      widthUnit: 'pixel'
    });
  });

  it('reflects valid attributes, falls back from malformed attributes, and regenerates length vertices', async () => {
    fixture = await createFixture(html`<nve-scene-axes length="2.5" width="4"></nve-scene-axes>`);
    const axes = fixture.querySelector<SceneAxes>(SceneAxes.metadata.tag);
    if (!axes) throw new Error('Expected axes layer.');
    await elementIsStable(axes);

    expect(axes).toMatchObject({ length: 2.5, width: 4 });
    axes.length = 3;
    axes.width = 5;
    await elementIsStable(axes);
    expect(axes.getAttribute('length')).toBe('3');
    expect(axes.getAttribute('width')).toBe('5');
    expect(readLineVertex(takeStreamingLayerRenderData(axes).bytes!, 1).position).toEqual([3, 0, 0]);

    axes.setAttribute('length', 'not-a-number');
    axes.setAttribute('width', '-1');
    await elementIsStable(axes);
    expect(axes).toMatchObject({ length: 1, width: 2 });
    expect(axes.getAttribute('length')).toBe('1');
    expect(axes.getAttribute('width')).toBe('2');
    expect(readLineVertex(takeStreamingLayerRenderData(axes).bytes!, 1).position).toEqual([1, 0, 0]);
  });

  it('reserializes malformed attributes when the matching default is already settled', async () => {
    fixture = await createFixture(html`<nve-scene-axes></nve-scene-axes>`);
    const axes = fixture.querySelector<SceneAxes>(SceneAxes.metadata.tag);
    if (!axes) throw new Error('Expected axes layer.');
    await elementIsStable(axes);

    axes.setAttribute('length', 'not-a-number');
    axes.setAttribute('width', '0');
    await elementIsStable(axes);

    expect(axes).toMatchObject({ length: 1, width: 2 });
    expect(axes.getAttribute('length')).toBe('1');
    expect(axes.getAttribute('width')).toBe('2');
  });

  it('becomes inert for element children and recovers after they are removed', async () => {
    fixture = await createFixture(html`<nve-scene-axes></nve-scene-axes>`);
    const axes = fixture.querySelector<SceneAxes>(SceneAxes.metadata.tag);
    if (!axes) throw new Error('Expected axes layer.');
    const errors: SceneErrorDetail[] = [];
    axes.addEventListener('nve-scene-error', event => errors.push((event as CustomEvent<SceneErrorDetail>).detail));

    axes.append(document.createElement('span'));
    await elementIsStable(axes);
    expect(errors.at(-1)).toMatchObject({ code: LAYER_CHILD, element: axes, severity: 'error' });
    expect(takeStreamingLayerRenderData(axes).ready).toBe(false);

    axes.replaceChildren();
    await elementIsStable(axes);
    expect(takeStreamingLayerRenderData(axes)).toMatchObject({ count: 6, ready: true });
  });

  it('is hidden by the standard hidden state', async () => {
    fixture = await createFixture(html`<nve-scene-axes hidden></nve-scene-axes>`);
    const axes = fixture.querySelector<SceneAxes>(SceneAxes.metadata.tag);
    if (!axes) throw new Error('Expected axes layer.');
    await elementIsStable(axes);
    expect(getComputedStyle(axes).display).toBe('none');
  });
});
