// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import {
  LAYER_CHILD,
  LAYER_DUAL_SOURCE,
  LAYOUT_STRIDE_MISMATCH,
  LAYOUT_VALUE_INVALID,
  MARKER_ARROW_DEGENERATE,
  MARKER_ARROW_FORM,
  MARKER_PARENT,
  MARKER_VALUE
} from '../../errors.js';
import { MARKER } from '../layouts/built-ins.js';
import { readMarker, writeMarker } from '../layouts/helpers.js';
import type { Quaternion, Vec3 } from '../types.js';
import type { SceneErrorDetail } from '../../scene/scene.js';
import { takeMarkerLayerRenderData } from './layer-state.js';
import '@nvidia-elements/scene/arrows/define.js';
import '@nvidia-elements/scene/cubes/define.js';

describe('marker layer state', () => {
  let fixture: HTMLElement;
  let details: SceneErrorDetail[];
  let consoleError: ReturnType<typeof vi.spyOn>;
  let consoleWarn: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    fixture = await createFixture(html`<div></div>`);
    details = [];
    fixture.addEventListener('nve-scene-error', event => details.push((event as CustomEvent<SceneErrorDetail>).detail));
  });

  afterEach(() => {
    removeFixture(fixture);
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  it('should warn once per dual-source episode and restore marker fallback', async () => {
    const layer = createLayer('nve-scene-cubes');
    layer.append(createMarker());
    fixture.append(layer);
    await elementIsStable(layer);

    const records = createRecords(1);
    layer.instances = records;
    layer.instances = records;
    expect(details.filter(detail => detail.code === LAYER_DUAL_SOURCE)).toHaveLength(1);
    expect(takeMarkerLayerRenderData(layer).count).toBe(1);

    layer.instances = null;
    expect(layer.instances).toBeNull();
    expect(takeMarkerLayerRenderData(layer).count).toBe(1);

    layer.instances = records;
    expect(details.filter(detail => detail.code === LAYER_DUAL_SOURCE)).toHaveLength(2);
  });

  it('should make invalid children inert and report marker parent errors', async () => {
    const layer = createLayer('nve-scene-cubes');
    layer.append(createMarker(), document.createElement('div'));
    const orphan = createMarker();
    fixture.append(layer, orphan);
    await Promise.all([elementIsStable(layer), elementIsStable(orphan)]);

    expect(takeMarkerLayerRenderData(layer).count).toBe(0);
    expect(details.map(detail => detail.code)).toEqual(expect.arrayContaining([LAYER_CHILD, MARKER_PARENT]));
    expect(Object.keys(details.find(detail => detail.code === MARKER_PARENT) ?? {}).sort()).toEqual([
      'code',
      'element',
      'message',
      'severity'
    ]);
  });

  it('should exclude only malformed or hidden markers until corrected', async () => {
    const layer = createLayer('nve-scene-cubes');
    const valid = createMarker();
    Reflect.set(valid, 'color', null);
    Reflect.set(valid, 'orientation', null);
    Reflect.set(valid, 'position', null);
    Reflect.set(valid, 'scale', null);
    const invalid = createMarker();
    Reflect.set(invalid, 'position', [0, 0]);
    Reflect.set(invalid, 'orientation', [0, 0, 0]);
    const hidden = createMarker();
    hidden.hidden = true;
    layer.append(valid, invalid, hidden);
    fixture.append(layer);
    await elementIsStable(layer);

    expect(takeMarkerLayerRenderData(layer).count).toBe(1);
    expect(details.some(detail => detail.code === MARKER_VALUE && detail.element === invalid)).toBe(true);

    invalid.position = [0, 0, Number.NaN];
    invalid.orientation = [0, 0, Number.NaN, 1];
    await nextMutation();
    expect(takeMarkerLayerRenderData(layer).count).toBe(1);

    invalid.position = [1, 0, 0];
    invalid.orientation = [0, 0, 0, 1];
    await nextMutation();
    expect(takeMarkerLayerRenderData(layer).count).toBe(2);
  });

  it('should diagnose streamed layout failures and recover through ranged commit', async () => {
    const layer = createLayer('nve-scene-cubes');
    fixture.append(layer);
    await elementIsStable(layer);

    layer.instances = new Uint8Array(MARKER.stride - 1);
    expect(takeMarkerLayerRenderData(layer).ready).toBe(false);
    expect(details.some(detail => detail.code === LAYOUT_STRIDE_MISMATCH)).toBe(true);

    const records = createRecords(1);
    layer.instances = records;
    new DataView(records.buffer).setFloat32(0, Number.NaN, true);
    layer.commit(0, 1);
    expect(details.some(detail => detail.code === LAYOUT_VALUE_INVALID)).toBe(true);

    writeMarker(records, 0, { position: [2, 0, 0], orientation: [0, 0, 0, 2] });
    layer.commit(0, 1);
    const data = takeMarkerLayerRenderData(layer);
    expect(data).toMatchObject({ count: 1, ready: true });
    expect(readMarker(data.bytes ?? new Uint8Array(), 0).orientation).toEqual([0, 0, 0, 1]);
  });

  it('should preserve fitting counts and retain the source after a rejected replacement', async () => {
    const layer = createLayer('nve-scene-cubes');
    fixture.append(layer);
    await elementIsStable(layer);
    const twoRecords = createRecords(2);
    const oneRecord = createRecords(1);

    layer.instances = twoRecords;
    expect(() => {
      layer.count = -1;
    }).toThrow(RangeError);
    expect(layer.count).toBeUndefined();
    layer.count = 1;
    layer.count = 1;
    layer.instances = oneRecord;
    expect(layer.count).toBe(1);
    layer.instances = twoRecords;
    layer.count = 2;
    layer.instances = oneRecord;
    expect(layer.count).toBeUndefined();
    expect(() => Reflect.set(layer, 'instances', [])).toThrow(TypeError);
    expect(layer.instances).toBe(oneRecord);
  });

  it('should no-op marker commits and report transparent faces and outlines', async () => {
    const layer = createLayer('nve-scene-cubes');
    fixture.append(layer);
    await elementIsStable(layer);
    expect(() => layer.commit()).not.toThrow();
    expect(takeMarkerLayerRenderData(layer)).toMatchObject({
      outlineTransparent: false,
      outlineVisible: false,
      transparent: false
    });

    const records = createRecords(1);
    records[43] = 128;
    records[47] = 128;
    layer.instances = records;
    expect(takeMarkerLayerRenderData(layer)).toMatchObject({
      outlineTransparent: true,
      outlineVisible: true,
      transparent: true
    });
  });

  it('should validate arrow forms and compile exact negative-z orientation', async () => {
    const layer = createLayer('nve-scene-arrows');
    const malformed = createMarker();
    malformed.from = 'bad';
    malformed.to = '0 0 1';
    const degenerate = createMarker();
    degenerate.from = '1 1 1';
    degenerate.to = '1 1 1';
    const valid = createMarker();
    valid.from = '0 0 0';
    valid.to = '0 0 -2';
    layer.append(malformed, degenerate, valid);
    fixture.append(layer);
    await elementIsStable(layer);

    const data = takeMarkerLayerRenderData(layer);
    expect(data.count).toBe(1);
    expect(readMarker(data.bytes ?? new Uint8Array(), 0)).toMatchObject({
      position: [0, 0, 0],
      orientation: [1, 0, 0, 0],
      scale: [2, 2, 2]
    });
    expect(details.some(detail => detail.code === MARKER_ARROW_FORM && detail.element === malformed)).toBe(true);
    expect(details.some(detail => detail.code === MARKER_ARROW_DEGENERATE && detail.element === degenerate)).toBe(true);
    expect(details.some(detail => detail.code === MARKER_VALUE && detail.element === malformed)).toBe(false);
  });

  it('should reject missing arrow endpoints and transform fields in point-pair form', async () => {
    const layer = createLayer('nve-scene-arrows');
    const missingFrom = createMarker();
    missingFrom.to = '0 0 1';
    const missingTo = createMarker();
    missingTo.from = '0 0 0';
    const mixed = createMarker();
    mixed.from = '0 0 0';
    mixed.to = '0 0 1';
    mixed.setAttribute('position', '[1,0,0]');
    layer.append(missingFrom, missingTo, mixed);
    fixture.append(layer);
    await elementIsStable(layer);

    expect(takeMarkerLayerRenderData(layer).count).toBe(0);
    expect(details.filter(detail => detail.code === MARKER_ARROW_FORM)).toHaveLength(3);
  });

  it('should reject invalid colors without suppressing valid siblings', async () => {
    const layer = createLayer('nve-scene-cubes');
    const invalid = createMarker();
    invalid.setAttribute('color', 'not-a-color');
    layer.append(invalid, createMarker());
    fixture.append(layer);
    await elementIsStable(layer);

    expect(takeMarkerLayerRenderData(layer).count).toBe(1);
    expect(details.some(detail => detail.code === MARKER_VALUE && detail.element === invalid)).toBe(true);
  });

  it('should compile declarative markers inserted through native HTML parsing', async () => {
    fixture.innerHTML = `
      <nve-scene-cubes>
        <nve-scene-marker position="[0,0,0.5]"></nve-scene-marker>
      </nve-scene-cubes>
    `;
    const layer = fixture.querySelector<TestLayer>('nve-scene-cubes');
    if (!layer) throw new Error('Expected a scene cubes layer.');
    await elementIsStable(layer);

    expect(takeMarkerLayerRenderData(layer).count).toBe(1);
  });
});

interface TestLayer extends HTMLElement {
  instances: ArrayBufferView | null;
  count: number | undefined;
  commit(start?: number, count?: number): void;
}

interface TestMarker extends HTMLElement {
  color: string;
  outlineColor: string;
  orientation: Quaternion;
  position: Vec3;
  scale: Vec3;
  from: string | null;
  to: string | null;
}

function createLayer(tag: 'nve-scene-arrows' | 'nve-scene-cubes'): TestLayer {
  return document.createElement(tag);
}

function createMarker(): TestMarker {
  return document.createElement('nve-scene-marker');
}

function createRecords(count: number): Uint8Array {
  const records = new Uint8Array(count * MARKER.stride);
  for (let index = 0; index < count; index += 1) {
    writeMarker(records, index, { position: [index, 0, 0] });
  }
  return records;
}

async function nextMutation(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
