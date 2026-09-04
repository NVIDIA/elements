// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { LABEL, LabelBuffer } from '@nvidia-elements/scene';
import { LAYER_CHILD } from '../errors.js';
import type { SceneErrorDetail } from '../scene/scene.js';
import { SceneLabels } from './labels.js';
import './define.js';

describe(SceneLabels.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('exposes the label streaming contract', async () => {
    fixture = await createFixture(html`<nve-scene-labels scale-unit="world"></nve-scene-labels>`);
    const layer = required(fixture.querySelector<SceneLabels>(SceneLabels.metadata.tag), 'Expected labels fixture.');
    await elementIsStable(layer);
    const labels = new LabelBuffer({ capacity: 2 });
    labels.add({ text: 'first', position: [0, 0, 0] });
    labels.add({ text: 'second', position: [1, 2, 3] });
    expect(SceneLabels.layout).toBe(LABEL);
    expect(layer.scaleUnit).toBe('world');
    expect(layer.interactive).toBe(false);
    layer.interactive = true;
    layer.interactive = true;
    layer.source = labels;
    layer.countLimit = 1;
    await elementIsStable(layer);
    expect(layer.interactive).toBe(true);
    expect(layer.hasAttribute('interactive')).toBe(false);
    expect(layer.source).toBe(labels);
    expect(layer.countLimit).toBe(1);
    expect(() => layer.publish()).not.toThrow();
    expect(() => (layer.countLimit = 3)).toThrow(RangeError);
    layer.source = null;
    expect(layer.source).toBeNull();
  });

  it('normalizes invalid scale units to pixels', async () => {
    fixture = await createFixture(html`<nve-scene-labels scale-unit="invalid"></nve-scene-labels>`);
    const layer = required(fixture.querySelector<SceneLabels>(SceneLabels.metadata.tag), 'Expected labels fixture.');
    await elementIsStable(layer);
    expect(layer.scaleUnit).toBe('pixel');
    layer.scaleUnit = 'invalid' as 'world';
    await elementIsStable(layer);
    expect(layer.scaleUnit).toBe('pixel');
  });

  it('rejects element children', async () => {
    fixture = await createFixture(html`<nve-scene-labels></nve-scene-labels>`);
    const layer = required(fixture.querySelector<SceneLabels>(SceneLabels.metadata.tag), 'Expected labels fixture.');
    const errors: SceneErrorDetail[] = [];
    layer.addEventListener('nve-scene-error', event => errors.push((event as CustomEvent<SceneErrorDetail>).detail));
    layer.append(document.createElement('span'));
    await elementIsStable(layer);
    expect(errors.at(-1)).toMatchObject({ code: LAYER_CHILD, element: layer, severity: 'error' });
  });
});

describe(LabelBuffer.name, () => {
  it('stores mutable text, position, scale, and color records', () => {
    const labels = new LabelBuffer({ capacity: 1 });
    const label = labels.add({ text: 'robot', position: [1, 2, 3], scale: 20, color: 'cyan' });
    expect(label.text).toBe('robot');
    expect(label.position.toArray()).toEqual([1, 2, 3]);
    expect(label.scale).toBe(20);
    expect(label.color).toEqual([0, 1, 1, 1]);
    const version = labels.version;
    label.text = 'vehicle';
    const textVersion = labels.version;
    label.text = 'vehicle';
    expect(labels.version).toBe(textVersion);
    label.position.set(4, 5, 6);
    label.scale = 24;
    label.color = 'magenta';
    expect(label.text).toBe('vehicle');
    expect(label.position.toArray()).toEqual([4, 5, 6]);
    expect(label.scale).toBe(24);
    expect(label.color).toEqual([1, 0, 1, 1]);
    expect(labels.version).toBeGreaterThan(version);
  });

  it('rejects invalid label values', () => {
    expect(() => Reflect.construct(LabelBuffer, [null])).toThrow(TypeError);
    expect(() => new LabelBuffer({ capacity: -1 })).toThrow(RangeError);
    const labels = new LabelBuffer({ capacity: 1 });
    expect(() => labels.add({ text: 'invalid', scale: 0 })).toThrow(RangeError);
    expect(() => labels.add({ text: 'invalid', scale: Number.NaN })).toThrow(RangeError);
    expect(() => labels.add({ text: 2 as unknown as string })).toThrow(TypeError);
  });
});
