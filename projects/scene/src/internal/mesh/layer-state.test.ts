// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createConstructedMeshRenderData } from './layer-state.js';

const triangle = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

describe(createConstructedMeshRenderData.name, () => {
  it('should create a ready identity render snapshot for valid constructed geometry', () => {
    const data = createConstructedMeshRenderData({
      color: [1, 1, 1, 1],
      colors: null,
      geometryError: false,
      identityInstance: true,
      indices: null,
      normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
      positions: triangle,
      texture: null,
      topologyVersion: 3,
      uvs: null,
      version: 7
    });

    expect(data).toMatchObject({
      geometryError: false,
      identityInstance: true,
      ready: true,
      shading: 'lit',
      topologyVersion: 3,
      transparent: false,
      version: 7
    });
    expect(data.positions).toBe(triangle);
    expect(data.uploadRanges).toEqual([]);
  });

  it('should classify any translucent vertex color as transparent', () => {
    const data = createConstructedMeshRenderData({
      color: [1, 1, 1, 1],
      colors: new Float32Array([1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1]),
      geometryError: false,
      identityInstance: true,
      indices: null,
      normals: null,
      positions: triangle,
      texture: null,
      topologyVersion: 1,
      uvs: null,
      version: 1
    });

    expect(data.transparent).toBe(true);
  });

  it('should preserve an explicit unlit shading mode for constructed geometry', () => {
    const data = createConstructedMeshRenderData({
      color: [1, 1, 1, 1],
      colors: null,
      geometryError: false,
      identityInstance: true,
      indices: null,
      normals: null,
      positions: triangle,
      shading: 'unlit',
      texture: null,
      topologyVersion: 1,
      uvs: null,
      version: 1
    });

    expect(data.shading).toBe('unlit');
  });

  it('should require UVs before treating a texture as renderable and transparent', () => {
    const texture = {} as ImageBitmap;
    const withoutUvs = createConstructedMeshRenderData({
      color: [1, 1, 1, 1],
      colors: null,
      geometryError: false,
      identityInstance: true,
      indices: null,
      normals: null,
      positions: triangle,
      texture,
      topologyVersion: 1,
      uvs: null,
      version: 1
    });
    const withUvs = createConstructedMeshRenderData({
      ...withoutUvs,
      texture,
      uvs: new Float32Array([0, 0, 1, 0, 0, 1])
    });

    expect(withoutUvs).toMatchObject({ texture: null, transparent: false });
    expect(withUvs).toMatchObject({ texture, transparent: true });
  });

  it('should keep invalid and empty constructed geometry inert', () => {
    const data = createConstructedMeshRenderData({
      color: [1, 1, 1, 1],
      colors: null,
      geometryError: true,
      identityInstance: true,
      indices: null,
      normals: null,
      positions: null,
      texture: null,
      topologyVersion: 1,
      uvs: null,
      version: 1
    });

    expect(data).toMatchObject({ identityInstance: false, ready: false });
  });
});
