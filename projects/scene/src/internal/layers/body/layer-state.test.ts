// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import { registerMarkerLayer, setLayerInstances } from '../markers/layer-state.js';
import { MarkerBuffer } from '../markers/buffer.js';
import {
  beginBodyLayerAsset,
  connectBodyLayer,
  disconnectBodyLayer,
  failBodyLayerAsset,
  getBodyLayerGeometry,
  getBodyLayerTopologyVersion,
  isBodyLayerRegistered,
  notifyOwningBodyShape,
  registerBodyLayer,
  setBodyLayerGeometry,
  setBodyLayerTint,
  takeBodyLayerRenderData
} from './layer-state.js';

function layer(): HTMLElement {
  const element = document.createElement('nve-scene-body');
  registerMarkerLayer(element, 'cube');
  registerBodyLayer(element);
  return element;
}
describe('body layer state', () => {
  it('captures compiled alpha independently of tint and replaces it with each compiled generation', () => {
    const body = layer();
    setBodyLayerGeometry(body, [{ kind: 'cube', color: [1, 1, 1, 0.999] }]);
    const translucent = takeBodyLayerRenderData(body);
    expect(translucent.transparent).toBe(true);
    setBodyLayerTint(body, '#ffffff');
    expect(takeBodyLayerRenderData(body).transparent).toBe(true);
    expect(() => setBodyLayerGeometry(body, [{ kind: 'cube', scale: [0, 1, 1] }])).toThrow();
    expect(takeBodyLayerRenderData(body).transparent).toBe(true);
    setBodyLayerGeometry(body, [{ kind: 'cube' }]);
    expect(takeBodyLayerRenderData(body).transparent).toBe(false);
    setBodyLayerTint(body, '#ffffff80');
    expect(takeBodyLayerRenderData(body).transparent).toBe(true);
    setBodyLayerTint(body, '#ffffff');
    expect(takeBodyLayerRenderData(body).transparent).toBe(false);
    setBodyLayerGeometry(body, [{ kind: 'cube', color: [1, 1, 1, 0] }]);
    expect(takeBodyLayerRenderData(body).transparent).toBe(true);
    beginBodyLayerAsset(body);
    expect(takeBodyLayerRenderData(body)).toMatchObject({ ready: false, transparent: false });
    expect(translucent.transparent).toBe(true);
  });

  it('captures geometry independently of readback and keeps tint edits outside topology updates', () => {
    const body = layer();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const nodes = [{ geometry: { positions } }];
    setBodyLayerGeometry(body, nodes);
    expect(isBodyLayerRegistered(body)).toBe(true);
    expect(getBodyLayerGeometry(body)).toBe(nodes);
    const before = takeBodyLayerRenderData(body);
    const topology = getBodyLayerTopologyVersion(body);
    positions.fill(9);
    setBodyLayerTint(body, '#ff0000');
    const after = takeBodyLayerRenderData(body);
    expect(after.positions).toBe(before.positions);
    expect(after.positions?.[0]).toBe(0);
    expect(after.color).toEqual([1, 0, 0, 1]);
    expect(after.version).toBeGreaterThan(before.version);
    expect(getBodyLayerTopologyVersion(body)).toBe(topology);
    setLayerInstances(body, new MarkerBuffer({ records: [{}] }));
    expect(takeBodyLayerRenderData(body).identityInstance).toBe(false);
  });

  it('makes pending and failed assets inert and restores authored geometry after clearing authority', () => {
    const body = layer();
    const shape = document.createElement('nve-scene-shape');
    body.append(shape);
    setBodyLayerGeometry(body, null);
    expect(getBodyLayerGeometry(body)).toHaveLength(1);
    beginBodyLayerAsset(body);
    expect(getBodyLayerGeometry(body)).toBeNull();
    expect(takeBodyLayerRenderData(body).ready).toBe(false);
    failBodyLayerAsset(body);
    expect(takeBodyLayerRenderData(body).geometryError).toBe(true);
    setBodyLayerGeometry(body, []);
    expect(takeBodyLayerRenderData(body).geometryError).toBe(false);
    expect(getBodyLayerGeometry(body)).toEqual([]);
    setBodyLayerGeometry(body, null);
    expect(getBodyLayerGeometry(body)).toHaveLength(1);
  });

  it('observes declarative children only while connected and applies shape changes synchronously', async () => {
    const body = layer();
    connectBodyLayer(body);
    const shape = document.createElement('nve-scene-shape');
    body.append(shape);
    await vi.waitFor(() => expect(getBodyLayerGeometry(body)).toHaveLength(1));
    shape.setAttribute('position', '[2,0,0]');
    notifyOwningBodyShape(shape);
    expect(getBodyLayerGeometry(body)?.[0]?.position).toEqual([2, 0, 0]);
    disconnectBodyLayer(body);
    body.replaceChildren();
    await Promise.resolve();
    expect(getBodyLayerGeometry(body)).toHaveLength(1);
    connectBodyLayer(body);
    expect(getBodyLayerGeometry(body)).toEqual([]);
    disconnectBodyLayer(body);
  });

  it('keeps accepted geometry after invalid input and rejects access to unregistered elements', () => {
    const body = layer();
    setBodyLayerGeometry(body, [{ kind: 'cube' }]);
    const before = takeBodyLayerRenderData(body);
    expect(() => setBodyLayerGeometry(body, [{ kind: 'cube', scale: [0, 1, 1] }])).toThrow();
    expect(takeBodyLayerRenderData(body).positions).toBe(before.positions);
    expect(() => getBodyLayerGeometry(document.createElement('div'))).toThrow(TypeError);
  });
});
