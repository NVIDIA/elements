// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import { registerMarkerLayer, setLayerInstances } from '../markers/layer-state.js';
import { MarkerBuffer } from '../markers/buffer.js';
import {
  beginModelLayerAsset,
  connectModelLayer,
  disconnectModelLayer,
  failModelLayerAsset,
  getModelLayerGeometry,
  getModelLayerTopologyVersion,
  isModelLayerRegistered,
  notifyOwningModelPart,
  registerModelLayer,
  setModelLayerGeometry,
  setModelLayerTint,
  takeModelLayerRenderData
} from './layer-state.js';

function layer(): HTMLElement {
  const element = document.createElement('nve-scene-model');
  registerMarkerLayer(element, 'cube');
  registerModelLayer(element);
  return element;
}
describe('model layer state', () => {
  it('captures geometry independently of readback and keeps tint edits outside topology updates', () => {
    const model = layer();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const nodes = [{ geometry: { positions } }];
    setModelLayerGeometry(model, nodes);
    expect(isModelLayerRegistered(model)).toBe(true);
    expect(getModelLayerGeometry(model)).toBe(nodes);
    const before = takeModelLayerRenderData(model);
    const topology = getModelLayerTopologyVersion(model);
    positions.fill(9);
    setModelLayerTint(model, '#ff0000');
    const after = takeModelLayerRenderData(model);
    expect(after.positions).toBe(before.positions);
    expect(after.positions?.[0]).toBe(0);
    expect(after.color).toEqual([1, 0, 0, 1]);
    expect(after.version).toBeGreaterThan(before.version);
    expect(getModelLayerTopologyVersion(model)).toBe(topology);
    setLayerInstances(model, new MarkerBuffer({ records: [{}] }));
    expect(takeModelLayerRenderData(model).identityInstance).toBe(false);
  });

  it('makes pending and failed assets inert and restores authored geometry after clearing authority', () => {
    const model = layer();
    const part = document.createElement('nve-scene-part');
    model.append(part);
    setModelLayerGeometry(model, null);
    expect(getModelLayerGeometry(model)).toHaveLength(1);
    beginModelLayerAsset(model);
    expect(getModelLayerGeometry(model)).toBeNull();
    expect(takeModelLayerRenderData(model).ready).toBe(false);
    failModelLayerAsset(model);
    expect(takeModelLayerRenderData(model).geometryError).toBe(true);
    setModelLayerGeometry(model, []);
    expect(takeModelLayerRenderData(model).geometryError).toBe(false);
    expect(getModelLayerGeometry(model)).toEqual([]);
    setModelLayerGeometry(model, null);
    expect(getModelLayerGeometry(model)).toHaveLength(1);
  });

  it('observes declarative children only while connected and applies part changes synchronously', async () => {
    const model = layer();
    connectModelLayer(model);
    const part = document.createElement('nve-scene-part');
    model.append(part);
    await vi.waitFor(() => expect(getModelLayerGeometry(model)).toHaveLength(1));
    part.setAttribute('position', '[2,0,0]');
    notifyOwningModelPart(part);
    expect(getModelLayerGeometry(model)?.[0]?.position).toEqual([2, 0, 0]);
    disconnectModelLayer(model);
    model.replaceChildren();
    await Promise.resolve();
    expect(getModelLayerGeometry(model)).toHaveLength(1);
    connectModelLayer(model);
    expect(getModelLayerGeometry(model)).toEqual([]);
    disconnectModelLayer(model);
  });

  it('keeps accepted geometry after invalid input and rejects access to unregistered elements', () => {
    const model = layer();
    setModelLayerGeometry(model, [{ shape: 'cube' }]);
    const before = takeModelLayerRenderData(model);
    expect(() => setModelLayerGeometry(model, [{ shape: 'cube', scale: [0, 1, 1] }])).toThrow();
    expect(takeModelLayerRenderData(model).positions).toBe(before.positions);
    expect(() => getModelLayerGeometry(document.createElement('div'))).toThrow(TypeError);
  });
});
