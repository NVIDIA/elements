// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, expectTypeOf, it } from 'vitest';
import * as scenePackage from './index.js';
import type {
  CameraState,
  FieldSpec,
  FieldType,
  LayoutDescriptor,
  LineVertexFields,
  MarkerFields,
  Mat4,
  PointFields,
  Quaternion,
  RGBA,
  TriVertexFields,
  Vec3
} from './index.js';
import {
  MARKER,
  Scene,
  SceneArrows,
  SceneAxes,
  SceneCamera,
  SceneCones,
  SceneCubes,
  SceneCylinders,
  SceneFrame,
  SceneGridlines,
  SceneHeightfield,
  SceneLabel,
  SceneMarker,
  SceneLines,
  SceneMesh,
  SceneModel,
  ScenePart,
  ScenePoints,
  ScenePyramids,
  SceneSpheres,
  SceneTriangles,
  VERSION,
  writeMarker
} from './index.js';

const expectedLayoutRuntimeExports = [
  'LINE_VERTEX',
  'MARKER',
  'POINT',
  'TRI_VERTEX',
  'defineLayout',
  'readLineVertex',
  'readMarker',
  'readPoint',
  'readTriVertex',
  'writeLineVertex',
  'writeMarker',
  'writePoint',
  'writeTriVertex'
] as const;

const internalLayoutRuntimeExports = ['FIELD_BYTE_WIDTHS'] as const;

const internalMathRuntimeExports = [
  'DEFAULT_CAMERA_STATE',
  'IDENTITY_QUATERNION',
  'applyOrbitDrag',
  'applyOrbitKey',
  'applyOrbitWheel',
  'assertCameraState',
  'cameraEye',
  'clampOrbit',
  'composeMat4',
  'copyCameraState',
  'createCameraViewProjection',
  'createOrthographicMatrix',
  'createPerspectiveMatrix',
  'identityMat4',
  'multiplyMat4',
  'multiplyQuaternions',
  'normalizeQuaternion',
  'pinchDistance',
  'slerpQuaternions',
  'transformPointMat4'
] as const;

describe('@nvidia-elements/scene', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('0.0.0');
  });

  it('should export element classes without a registration side effect', () => {
    expect(Scene.metadata.tag).toBe('nve-scene');
    expect(SceneAxes.metadata.tag).toBe('nve-scene-axes');
    expect(SceneCamera.metadata.tag).toBe('nve-scene-camera');
    expect(SceneFrame.metadata.tag).toBe('nve-scene-frame');
    expect(SceneGridlines.metadata.tag).toBe('nve-scene-gridlines');
    expect(SceneHeightfield.metadata.tag).toBe('nve-scene-heightfield');
    expect(SceneLabel.metadata.tag).toBe('nve-scene-label');
    expect(SceneMarker.metadata.tag).toBe('nve-scene-marker');
    expect(SceneMesh.metadata.tag).toBe('nve-scene-mesh');
    expect(SceneModel.metadata.tag).toBe('nve-scene-model');
    expect(ScenePart.metadata.tag).toBe('nve-scene-part');
    expect(ScenePyramids.metadata.tag).toBe('nve-scene-pyramids');
    expect(SceneMesh.layout).toBe(MARKER);
    expect(
      [SceneArrows, SceneCones, SceneCubes, SceneCylinders, ScenePyramids, SceneSpheres].map(element => element.layout)
    ).toEqual(Array.from({ length: 6 }, () => MARKER));
    expect(SceneLines.layout.name).toBe('nve.line-vertex');
    expect(ScenePoints.layout.name).toBe('nve.point');
    expect(SceneTriangles.layout.name).toBe('nve.tri-vertex');
  });

  it('should export the public layout API', () => {
    const bytes = new Uint8Array(MARKER.stride);
    writeMarker(bytes, 0, { position: [1, 2, 3] });

    expect(MARKER.name).toBe('nve.marker');
    expect(new DataView(bytes.buffer).getFloat32(8, true)).toBe(3);
  });

  it('should preserve required layout helpers without exporting runtime math utilities', () => {
    for (const name of expectedLayoutRuntimeExports) {
      expect(scenePackage).toHaveProperty(name);
    }
    for (const name of internalLayoutRuntimeExports) {
      expect(scenePackage).not.toHaveProperty(name);
    }
    for (const name of internalMathRuntimeExports) {
      expect(scenePackage).not.toHaveProperty(name);
    }

    expectTypeOf<FieldType>().toEqualTypeOf<'f32' | 'f32x2' | 'f32x3' | 'f32x4' | 'u32' | 'unorm8x4'>();
    expectTypeOf<FieldSpec['type']>().toEqualTypeOf<FieldType>();
    expectTypeOf<LayoutDescriptor['fields']>().toEqualTypeOf<Readonly<Record<string, Readonly<FieldSpec>>>>();
    expectTypeOf<LineVertexFields>().toEqualTypeOf<PointFields>();
    expectTypeOf<TriVertexFields>().toEqualTypeOf<PointFields>();
    expectTypeOf<MarkerFields['position']>().toEqualTypeOf<Vec3>();
    expectTypeOf<NonNullable<MarkerFields['orientation']>>().toEqualTypeOf<Quaternion>();
    expectTypeOf<NonNullable<MarkerFields['scale']>>().toEqualTypeOf<Vec3>();
    expectTypeOf<NonNullable<MarkerFields['color']>>().toEqualTypeOf<RGBA>();
    expectTypeOf<NonNullable<MarkerFields['outlineColor']>>().toEqualTypeOf<RGBA>();
    expectTypeOf<Mat4>().toEqualTypeOf<Float32Array>();
    expectTypeOf<Vec3>().toEqualTypeOf<[number, number, number]>();
    expectTypeOf<Quaternion>().toEqualTypeOf<[number, number, number, number]>();
    expectTypeOf<RGBA>().toEqualTypeOf<[number, number, number, number]>();
    expectTypeOf<CameraState['target']['position']>().toEqualTypeOf<Vec3>();
  });

  it('should register the current inventory from the all-elements bundle', async () => {
    const bundle = await import('./bundle.js');

    for (const element of [
      Scene,
      SceneArrows,
      SceneAxes,
      SceneCamera,
      SceneCones,
      SceneCubes,
      SceneCylinders,
      SceneFrame,
      SceneGridlines,
      SceneHeightfield,
      SceneLabel,
      SceneMarker,
      SceneMesh,
      SceneModel,
      ScenePart,
      ScenePyramids,
      SceneSpheres,
      SceneLines,
      ScenePoints,
      SceneTriangles
    ]) {
      expect(Reflect.get(bundle, element.name)).toBe(element);
      expect(customElements.get(element.metadata.tag)).toBe(element);
    }
  });
});
