// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { EMPTY_ALPHA_SUMMARY, summarizeRGBAAlpha } from '../../color/alpha.js';
import { createConstructedMeshRenderData } from './render-data.js';

const triangle = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

describe(createConstructedMeshRenderData.name, () => {
  it('should create a ready identity render snapshot for valid constructed geometry', () => {
    const data = createConstructedMeshRenderData({
      alphaSummary: EMPTY_ALPHA_SUMMARY,
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

  it('uses captured alpha counts without reading vertex color values', () => {
    const colors = new Float32Array([1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1]);
    const alphaSummary = summarizeRGBAAlpha(colors);
    const unreadable = new Proxy(colors, {
      get: () => {
        throw new Error('Snapshot construction must not scan colors.');
      }
    });
    const data = createConstructedMeshRenderData({
      alphaSummary,
      color: [1, 1, 1, 1],
      colors: unreadable,
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
    expect(data.colors).toBe(unreadable);
  });

  it('should preserve an explicit unlit shading mode for constructed geometry', () => {
    const data = createConstructedMeshRenderData({
      alphaSummary: EMPTY_ALPHA_SUMMARY,
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
      alphaSummary: EMPTY_ALPHA_SUMMARY,
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
      alphaSummary: EMPTY_ALPHA_SUMMARY,
      texture,
      uvs: new Float32Array([0, 0, 1, 0, 0, 1])
    });

    expect(withoutUvs).toMatchObject({ texture: null, transparent: false });
    expect(withUvs).toMatchObject({ texture, transparent: true });
  });

  it('should keep invalid and empty constructed geometry inert', () => {
    const data = createConstructedMeshRenderData({
      alphaSummary: EMPTY_ALPHA_SUMMARY,
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
