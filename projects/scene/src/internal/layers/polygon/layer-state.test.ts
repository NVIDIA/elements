// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { registerMarkerLayer } from '../markers/layer-state.js';
import {
  getPolygonLayerGeometry,
  getPolygonLayerTopologyVersion,
  getPolygonLayerVersion,
  isPolygonLayerRegistered,
  registerPolygonLayer,
  setPolygonLayerColor,
  setPolygonLayerGeometry,
  takePolygonLayerRenderData
} from './layer-state.js';
import type { PolygonGeometry } from './types.js';

function layer(): HTMLElement {
  const element = document.createElement('div');
  registerMarkerLayer(element, 'cube');
  registerPolygonLayer(element, [1, 1, 1, 1]);
  return element;
}
describe('polygon layer state', () => {
  it('captures producer coordinates and changes color without rebuilding topology', () => {
    const element = layer();
    const outer: [number, number][] = [
      [0, 0],
      [1, 0],
      [0, 1]
    ];
    const geometry: PolygonGeometry = { outer };
    setPolygonLayerGeometry(element, geometry);
    expect(isPolygonLayerRegistered(element)).toBe(true);
    const before = takePolygonLayerRenderData(element);
    const topology = getPolygonLayerTopologyVersion(element);
    outer[0]![0] = 10;
    expect(getPolygonLayerGeometry(element)?.outer[0]).toEqual([0, 0]);
    setPolygonLayerColor(element, [1, 0, 0, 1]);
    expect(takePolygonLayerRenderData(element).positions).toBe(before.positions);
    expect(getPolygonLayerTopologyVersion(element)).toBe(topology);
    const version = getPolygonLayerVersion(element);
    setPolygonLayerColor(element, [1, 0, 0, 1]);
    expect(getPolygonLayerVersion(element)).toBe(version);
  });

  it('becomes inert for invalid polygons and recovers after replacement or clearing', () => {
    const element = layer();
    setPolygonLayerGeometry(element, {
      outer: [
        [0, 0],
        [1, 1]
      ]
    });
    expect(takePolygonLayerRenderData(element)).toMatchObject({ ready: false, geometryError: true });
    setPolygonLayerGeometry(element, {
      outer: [
        [0, 0],
        [1, 0],
        [0, 1]
      ]
    });
    expect(takePolygonLayerRenderData(element)).toMatchObject({
      ready: true,
      geometryError: false,
      identityInstance: true
    });
    setPolygonLayerGeometry(element, null);
    expect(getPolygonLayerGeometry(element)).toBeNull();
    expect(takePolygonLayerRenderData(element).geometryError).toBe(false);
    expect(() => getPolygonLayerVersion(document.createElement('div'))).toThrow(TypeError);
  });
});
