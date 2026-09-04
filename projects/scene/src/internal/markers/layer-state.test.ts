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
  MARKER_PARENT,
  MARKER_VALUE
} from '../../errors.js';
import { MARKER } from '../layouts/built-ins.js';
import { readMarker, writeMarker } from '../layouts/helpers.js';
import type { Quaternion, Vec3 } from '../types.js';
import type { SceneErrorDetail } from '../../scene/scene.js';
import { MarkerBuffer, type MarkerInstanceSource } from './buffer.js';
import {
  connectMarkerLayer,
  disconnectMarkerLayer,
  getMarkerLayerMarker,
  registerMarkerLayer,
  takeMarkerLayerRenderData
} from './layer-state.js';
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
    const marker = createMarker();
    layer.append(marker);
    fixture.append(layer);
    await elementIsStable(layer);

    expect(getMarkerLayerMarker(layer, 0)).toBe(marker);

    const records = createRecords(1);
    layer.instances = records;
    layer.instances = records;
    expect(getMarkerLayerMarker(layer, 0)).toBeUndefined();
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

  it('should accept MarkerBuffer directly and render only its added records', async () => {
    const layer = createLayer('nve-scene-cubes');
    fixture.append(layer);
    await elementIsStable(layer);
    const markers = new MarkerBuffer({ capacity: 2 });
    const marker = markers.add({ color: 'cyan' });
    marker.position.set(0, 0, 1);

    layer.instances = markers;
    expect(layer.instances).toBe(markers);
    expect(takeMarkerLayerRenderData(layer)).toMatchObject({
      bounds: {
        maximumX: 1,
        maximumY: 1,
        maximumZ: 2,
        minimumX: -1,
        minimumY: -1,
        minimumZ: 0
      },
      count: 1,
      ready: true
    });

    const second = markers.add({ position: [2, 0, 1] });
    expect(takeMarkerLayerRenderData(layer).count).toBe(1);
    layer.commit(marker.index, 1);
    expect(takeMarkerLayerRenderData(layer).count).toBe(1);
    layer.commit(second.index);
    expect(takeMarkerLayerRenderData(layer)).toMatchObject({ count: 2, ready: true });
    expect(readMarker(takeMarkerLayerRenderData(layer).bytes ?? new Uint8Array(), 1).position).toEqual([2, 0, 1]);
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
      opaque: false,
      outlineOpaque: false,
      outlineTransparent: false,
      outlineVisible: false,
      transparent: false
    });

    const records = createRecords(1);
    records[43] = 128;
    records[47] = 128;
    layer.instances = records;
    expect(takeMarkerLayerRenderData(layer)).toMatchObject({
      opaque: false,
      outlineOpaque: false,
      outlineTransparent: true,
      outlineVisible: true,
      transparent: true
    });

    const mixed = createRecords(2);
    mixed[43] = 128;
    mixed[47] = 128;
    mixed[MARKER.stride + 47] = 255;
    layer.instances = mixed;
    expect(takeMarkerLayerRenderData(layer)).toMatchObject({
      opaque: true,
      outlineOpaque: true,
      outlineTransparent: true,
      outlineVisible: true,
      transparent: true
    });
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

  it('should clear a declarative count when its marker list shrinks', async () => {
    const layer = createLayer('nve-scene-cubes');
    layer.append(createMarker(), createMarker());
    fixture.append(layer);
    await elementIsStable(layer);

    layer.count = 2;
    layer.lastElementChild?.remove();
    await elementIsStable(layer);

    expect(layer.count).toBeUndefined();
  });

  it('should ignore a queued reconciliation after disconnecting', async () => {
    const layer = document.createElement('div');
    registerMarkerLayer(layer, 'cube');
    connectMarkerLayer(layer);
    disconnectMarkerLayer(layer);
    await new Promise<void>(resolve => queueMicrotask(resolve));

    expect(takeMarkerLayerRenderData(layer).count).toBe(0);
  });

  it('should reject access to an unregistered marker layer', () => {
    expect(() => getMarkerLayerMarker(document.createElement('div'), 0)).toThrow(TypeError);
  });
});

interface TestLayer extends HTMLElement {
  instances: MarkerInstanceSource | null;
  count: number | undefined;
  commit(start?: number, count?: number): void;
}

interface TestMarker extends HTMLElement {
  color: string;
  outlineColor: string;
  orientation: Quaternion;
  position: Vec3;
  scale: Vec3;
}

function createLayer(tag: 'nve-scene-cubes'): TestLayer {
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
