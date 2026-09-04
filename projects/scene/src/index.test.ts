// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, expectTypeOf, it } from 'vitest';
import { ScenePolygon as ScenePolygonFromPath } from '@nvidia-elements/scene/polygon';
import type { PolygonGeometry as PolygonGeometryFromPath } from '@nvidia-elements/scene/polygon';
import * as scenePackage from './index.js';
import type {
  CameraPose,
  CameraState,
  FrameTransform,
  FieldSpec,
  FieldType,
  LayoutDescriptor,
  LineVertexInstanceSource,
  LineVertexFields,
  MarkerFields,
  Mat4,
  PointFields,
  PointInstanceSource,
  PolygonGeometry,
  PolygonPoint,
  PolygonRing,
  Quaternion,
  RGBA,
  TriVertexFields,
  TriangleVertexInstanceSource,
  Vec3
} from './index.js';
import {
  LINE_VERTEX,
  MARKER,
  MarkerBuffer,
  POINT,
  Scene,
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
  ScenePolygon,
  ScenePyramids,
  SceneSpheres,
  SceneTriangles,
  TRI_VERTEX,
  LineVertexBuffer,
  PointBuffer,
  TriangleVertexBuffer,
  VERSION
} from './index.js';

type RootModule = typeof scenePackage;
type HasPublicDefineLayout = 'defineLayout' extends keyof RootModule ? true : false;

const expectedLayoutRuntimeExports = ['LINE_VERTEX', 'MARKER', 'POINT', 'TRI_VERTEX'] as const;

const internalLayoutRuntimeExports = [
  'FIELD_BYTE_WIDTHS',
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
    expect(ScenePolygon.metadata.tag).toBe('nve-scene-polygon');
    expect(ScenePyramids.metadata.tag).toBe('nve-scene-pyramids');
    for (const element of [
      SceneCones,
      SceneCubes,
      SceneCylinders,
      SceneMesh,
      SceneModel,
      ScenePolygon,
      ScenePyramids,
      SceneSpheres
    ]) {
      expect(element.layout).toBe(MARKER);
    }
    expect(SceneLines.layout).toBe(LINE_VERTEX);
    expect(ScenePoints.layout).toBe(POINT);
    expect(SceneTriangles.layout).toBe(TRI_VERTEX);
  });

  it('should expose the polygon package entrypoints', async () => {
    expect(ScenePolygonFromPath).toBe(ScenePolygon);
    expectTypeOf<PolygonGeometryFromPath>().toEqualTypeOf<PolygonGeometry>();
    await import('@nvidia-elements/scene/polygon/define.js');
    expect(customElements.get(ScenePolygon.metadata.tag)).toBe(ScenePolygon);
  });

  it('should export the public layout API', () => {
    const markers = new MarkerBuffer({ capacity: 2 });
    const marker = markers.add({ position: [1, 2, 3] });

    expect({ LINE_VERTEX, MARKER, POINT, TRI_VERTEX }).toEqual({
      LINE_VERTEX: {
        fields: {
          color: { offset: 12, type: 'unorm8x4' },
          dash: { offset: 32, type: 'f32' },
          gap: { offset: 36, type: 'f32' },
          normal: { offset: 16, type: 'f32x3' },
          position: { offset: 0, type: 'f32x3' },
          width: { offset: 28, type: 'f32' }
        },
        name: 'nve.line-vertex',
        stride: 40
      },
      MARKER: {
        fields: {
          color: { offset: 40, type: 'unorm8x4' },
          orientation: { offset: 12, type: 'f32x4' },
          'outline-color': { offset: 44, type: 'unorm8x4' },
          position: { offset: 0, type: 'f32x3' },
          scale: { offset: 28, type: 'f32x3' }
        },
        name: 'nve.marker',
        stride: 48
      },
      POINT: {
        fields: {
          color: { offset: 12, type: 'unorm8x4' },
          position: { offset: 0, type: 'f32x3' }
        },
        name: 'nve.point',
        stride: 16
      },
      TRI_VERTEX: {
        fields: {
          color: { offset: 12, type: 'unorm8x4' },
          position: { offset: 0, type: 'f32x3' }
        },
        name: 'nve.tri-vertex',
        stride: 16
      }
    });
    for (const layout of [LINE_VERTEX, MARKER, POINT, TRI_VERTEX]) {
      expect(Object.isFrozen(layout)).toBe(true);
      expect(Object.isFrozen(layout.fields)).toBe(true);
      for (const field of Object.values(layout.fields)) {
        expect(Object.isFrozen(field)).toBe(true);
      }
    }
    expect(marker.position.z).toBe(3);
    expect(markers.bytes).toHaveLength(MARKER.stride * 2);
    expect(new PointBuffer({ capacity: 2 }).bytes).toHaveLength(POINT.stride * 2);
    expect(new LineVertexBuffer({ capacity: 2 }).bytes).toHaveLength(LINE_VERTEX.stride * 2);
    expect(new TriangleVertexBuffer({ capacity: 3 }).bytes).toHaveLength(TRI_VERTEX.stride * 3);
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

    expectTypeOf<HasPublicDefineLayout>().toEqualTypeOf<false>();
    expectTypeOf<FieldType>().toEqualTypeOf<'f32' | 'f32x2' | 'f32x3' | 'f32x4' | 'u32' | 'unorm8x4'>();
    expectTypeOf<FieldSpec['type']>().toEqualTypeOf<FieldType>();
    expectTypeOf<LayoutDescriptor['fields']>().toEqualTypeOf<Readonly<Record<string, Readonly<FieldSpec>>>>();
    expectTypeOf<LineVertexFields>().toExtend<PointFields>();
    expectTypeOf<TriVertexFields>().toEqualTypeOf<PointFields>();
    expectTypeOf<SceneLines['instances']>().toEqualTypeOf<LineVertexInstanceSource | null>();
    expectTypeOf<ScenePoints['instances']>().toEqualTypeOf<PointInstanceSource | null>();
    expectTypeOf<SceneTriangles['instances']>().toEqualTypeOf<TriangleVertexInstanceSource | null>();
    expectTypeOf<ScenePolygon['geometry']>().toEqualTypeOf<PolygonGeometry | undefined>();
    expectTypeOf<PolygonPoint>().toEqualTypeOf<readonly [number, number]>();
    expectTypeOf<PolygonRing>().toEqualTypeOf<readonly PolygonPoint[]>();
    expectTypeOf<MarkerFields['position']>().toEqualTypeOf<Vec3>();
    expectTypeOf<NonNullable<MarkerFields['orientation']>>().toEqualTypeOf<Quaternion>();
    expectTypeOf<NonNullable<MarkerFields['scale']>>().toEqualTypeOf<Vec3>();
    expectTypeOf<NonNullable<MarkerFields['color']>>().toEqualTypeOf<RGBA>();
    expectTypeOf<NonNullable<MarkerFields['outlineColor']>>().toEqualTypeOf<RGBA>();
    expectTypeOf<Mat4>().toEqualTypeOf<Float32Array>();
    expectTypeOf<Vec3>().toEqualTypeOf<[number, number, number]>();
    expectTypeOf<Quaternion>().toEqualTypeOf<[number, number, number, number]>();
    expectTypeOf<RGBA>().toEqualTypeOf<[number, number, number, number]>();
    expectTypeOf<CameraState['pose']>().toEqualTypeOf<CameraPose>();
    expectTypeOf<CameraState['pose']['position']>().toEqualTypeOf<Vec3>();
    expectTypeOf<CameraState['pose']['orientation']>().toEqualTypeOf<Quaternion>();
    expectTypeOf<CameraState['projection']['near']>().toEqualTypeOf<number>();
    expectTypeOf<CameraState['projection']['far']>().toEqualTypeOf<number>();
    expectTypeOf<FrameTransform['position']>().toEqualTypeOf<Vec3>();
    expectTypeOf<FrameTransform['orientation']>().toEqualTypeOf<Quaternion>();
  });

  it('should register the current inventory from the all-elements bundle', async () => {
    const bundle = await import('./bundle.js');

    for (const element of [
      Scene,
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
      ScenePolygon,
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
