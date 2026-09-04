// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { POINT, PointBuffer } from '@nvidia-elements/scene';
import { LAYER_CHILD } from '../errors.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { ScenePoints } from './points.js';
import './define.js';

describe(ScenePoints.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('exposes the point streaming contract', async () => {
    fixture = await createFixture(html`<nve-scene-points size="5"></nve-scene-points>`);
    const layer = required(fixture.querySelector<ScenePoints>(ScenePoints.metadata.tag), 'Expected points fixture.');
    await elementIsStable(layer);
    const points = new PointBuffer({ capacity: 2 });
    points.add({ position: [0, 0, 0] });
    points.add({ position: [1, 2, 3] });
    expect(ScenePoints.layout).toBe(POINT);
    expect(layer?.size).toBe(5);
    expect(layer?.sizeUnit).toBe('pixel');
    if (!layer) throw new Error('Expected point layer.');
    expect(layer.interactive).toBe(false);
    layer.interactive = true;
    await elementIsStable(layer);
    expect(layer.interactive).toBe(true);
    expect(layer.hasAttribute('interactive')).toBe(false);
    layer.interactive = true;
    expect(layer.interactive).toBe(true);
    layer.instances = points;
    layer.count = 1;
    expect(layer.instances).toBe(points);
    expect(layer.count).toBe(1);
    expect(() => layer.commit()).not.toThrow();
    layer.instances = null;
    expect(layer.instances).toBeNull();
    expect(() => layer.commit()).not.toThrow();
    layer.instances = points;
    layer.count = 1;
    expect(() => (layer.count = 3)).toThrow(RangeError);
    expect(layer.count).toBe(1);
  });

  it('rejects element children through the layer contract', async () => {
    fixture = await createFixture(html`<nve-scene-points></nve-scene-points>`);
    const layer = required(fixture.querySelector<ScenePoints>(ScenePoints.metadata.tag), 'Expected points fixture.');
    if (!layer) throw new Error('Expected point layer.');
    const errors: SceneErrorDetail[] = [];
    layer.addEventListener('nve-scene-error', event => errors.push((event as CustomEvent<SceneErrorDetail>).detail));
    layer.innerHTML = '<div></div>';
    await elementIsStable(layer);
    expect(errors.at(-1)).toMatchObject({ code: LAYER_CHILD, severity: 'error', element: layer });
    layer.replaceChildren();
    await elementIsStable(layer);
    layer.append(document.createElement('span'));
    await elementIsStable(layer);
    expect(errors.filter(error => error.code === LAYER_CHILD)).toHaveLength(2);
  });

  it('restores the default size for invalid values', async () => {
    fixture = await createFixture(html`<nve-scene-points size="0"></nve-scene-points>`);
    const layer = required(fixture.querySelector<ScenePoints>(ScenePoints.metadata.tag), 'Expected points fixture.');
    await elementIsStable(layer);
    expect(layer?.size).toBe(3);
    if (!layer) throw new Error('Expected point layer.');
    layer.setAttribute('size', 'NaN');
    await elementIsStable(layer);
    expect(layer.size).toBe(3);
    layer.setAttribute('size', '-1');
    await elementIsStable(layer);
    expect(layer.size).toBe(3);
    layer.removeAttribute('size');
    await elementIsStable(layer);
    expect(layer.size).toBe(3);
  });

  it('supports world-sized points and normalizes invalid size units', async () => {
    fixture = await createFixture(html`<nve-scene-points size-unit="world"></nve-scene-points>`);
    const layer = required(fixture.querySelector<ScenePoints>(ScenePoints.metadata.tag), 'Expected points fixture.');
    await elementIsStable(layer);
    expect(layer?.sizeUnit).toBe('world');
    if (!layer) throw new Error('Expected point layer.');

    layer.sizeUnit = 'pixel';
    await elementIsStable(layer);
    expect(layer.sizeUnit).toBe('pixel');
    layer.setAttribute('size-unit', 'unknown');
    await elementIsStable(layer);
    expect(layer.sizeUnit).toBe('pixel');
    layer.sizeUnit = 'invalid' as 'world';
    await elementIsStable(layer);
    expect(layer.sizeUnit).toBe('pixel');
    layer.removeAttribute('size-unit');
    await elementIsStable(layer);
    expect(layer.sizeUnit).toBe('pixel');
  });
});
