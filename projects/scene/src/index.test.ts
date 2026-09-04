// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, expectTypeOf, it } from 'vitest';
import { ScenePolygon as ScenePolygonFromPath } from '@nvidia-elements/scene/polygon';
import type { PolygonGeometry as PolygonGeometryFromPath } from '@nvidia-elements/scene/polygon';
import * as scenePackage from './index.js';
import type {
  ExternalLineVertexSource,
  ExternalLabelSource,
  ExternalMarkerSource,
  ExternalPointSource,
  ExternalTriangleVertexSource,
  SceneCameraChangeDetail,
  SceneCameraState,
  SceneErrorDetail,
  SceneEventMap,
  ScenePose,
  FieldSpec,
  FieldType,
  LayoutDescriptor,
  LabelSource,
  LineVertexSource,
  MarkerSource,
  Mat4,
  PointSource,
  PolygonGeometry,
  PolygonPoint,
  PolygonRing,
  Quaternion,
  RGBA,
  SceneClientPoint,
  SceneFeatureIdMap,
  SceneFeatureIds,
  SceneMeshGeometry,
  ScenePickHit,
  ScenePickTarget,
  ScenePublishOptions,
  SceneRay,
  SceneTextureCaptureResult,
  TriangleVertexSource,
  Vec3
} from './index.js';
import {
  LINE_VERTEX,
  LABEL,
  LabelBuffer,
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
  SceneLabels,
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
  TRIANGLE_VERTEX,
  LineVertexBuffer,
  PointBuffer,
  TriangleVertexBuffer,
  createLineVertexSource,
  createLabelSource,
  createMarkerSource,
  createPointSource,
  createTriangleVertexSource,
  VERSION
} from './index.js';

type RootModule = typeof scenePackage;
type HasPublicDefineLayout = 'defineLayout' extends keyof RootModule ? true : false;
type PointSourceIsMarkerSource = PointSource extends MarkerSource ? true : false;
type RawMarkerSourceIsAccepted = Uint8Array extends MarkerSource ? true : false;
type SceneCameraHasHeight = 'height' extends keyof SceneCamera ? true : false;
type SceneCameraHasFovy = 'fovy' extends keyof SceneCamera ? true : false;
type SceneCameraHasMode = 'mode' extends keyof SceneCamera ? true : false;
type SceneCameraHasPhi = 'phi' extends keyof SceneCamera ? true : false;
type SceneCameraHasTheta = 'theta' extends keyof SceneCamera ? true : false;
type SceneHitHasInstanceIndex = 'instanceIndex' extends keyof ScenePickHit ? true : false;
type SceneLabelsHasStale = 'stale' extends keyof SceneLabels ? true : false;
type SceneMeshGeometryArrayKey = Extract<'colors' | 'indices' | 'normals' | 'positions' | 'uvs', keyof SceneMesh>;
type SceneMeshHasSetGeometry = 'setGeometry' extends keyof SceneMesh ? true : false;
type SceneMeshHasTexture = 'texture' extends keyof SceneMesh ? true : false;
type MarkerBufferHasBytes = 'bytes' extends keyof MarkerBuffer ? true : false;
type MarkerBufferHasCommit = 'commit' extends keyof MarkerBuffer ? true : false;
type SceneCubesHasCommit = 'commit' extends keyof SceneCubes ? true : false;
type SceneFrameHasSetTransform = 'setTransform' extends keyof SceneFrame ? true : false;
type SceneFrameHasTransform = 'transform' extends keyof SceneFrame ? true : false;
type SceneLinesHasInstances = 'instances' extends keyof SceneLines ? true : false;
type SceneLinesHasVertices = 'vertices' extends keyof SceneLines ? true : false;
type InstanceTarget = Extract<ScenePickTarget, { kind: 'instance' }>;
type LabelTarget = Extract<ScenePickTarget, { kind: 'label' }>;
type PointTarget = Extract<ScenePickTarget, { kind: 'point' }>;
type SegmentTarget = Extract<ScenePickTarget, { kind: 'segment' }>;
type SurfaceTarget = Extract<ScenePickTarget, { kind: 'surface' }>;
type TriangleTarget = Extract<ScenePickTarget, { kind: 'triangle' }>;
type SurfaceTargetHasIndex = 'index' extends keyof SurfaceTarget ? true : false;

const expectedLayoutRuntimeExports = ['LABEL', 'LINE_VERTEX', 'MARKER', 'POINT', 'TRIANGLE_VERTEX'] as const;

const internalLayoutRuntimeExports = [
  'FIELD_BYTE_WIDTHS',
  'defineLayout',
  'readLineVertex',
  'readMarker',
  'readPoint',
  'readTriangleVertex',
  'writeLineVertex',
  'writeMarker',
  'writePoint',
  'writeTriangleVertex'
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
    expect(SceneLabels.metadata.tag).toBe('nve-scene-labels');
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
    expect(SceneLabels.layout).toBe(LABEL);
    expect(SceneLines.layout).toBe(LINE_VERTEX);
    expect(ScenePoints.layout).toBe(POINT);
    expect(SceneTriangles.layout).toBe(TRIANGLE_VERTEX);
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

    expect({ LABEL, LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX }).toEqual({
      LABEL: {
        fields: {
          color: { offset: 16, type: 'unorm8x4' },
          position: { offset: 0, type: 'f32x3' },
          scale: { offset: 12, type: 'f32' }
        },
        name: 'nve.label',
        stride: 20
      },
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
      TRIANGLE_VERTEX: {
        fields: {
          color: { offset: 12, type: 'unorm8x4' },
          position: { offset: 0, type: 'f32x3' }
        },
        name: 'nve.triangle-vertex',
        stride: 16
      }
    });
    for (const layout of [LABEL, LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX]) {
      expect(Object.isFrozen(layout)).toBe(true);
      expect(Object.isFrozen(layout.fields)).toBe(true);
      for (const field of Object.values(layout.fields)) {
        expect(Object.isFrozen(field)).toBe(true);
      }
    }
    expect(marker.position.z).toBe(3);
    const labels = new LabelBuffer({ capacity: 1 });
    labels.add({ position: [1, 2, 3], scale: 18, text: 'sensor' });
    expect(labels.at(0).text).toBe('sensor');
    expect(markers.mutableBytes).toHaveLength(MARKER.stride * 2);
    expect(new PointBuffer({ capacity: 2 }).mutableBytes).toHaveLength(POINT.stride * 2);
    expect(new LineVertexBuffer({ capacity: 2 }).mutableBytes).toHaveLength(LINE_VERTEX.stride * 2);
    expect(new TriangleVertexBuffer({ capacity: 3 }).mutableBytes).toHaveLength(TRIANGLE_VERTEX.stride * 3);
    expect(createMarkerSource({ bytes: new Uint8Array(MARKER.stride), count: 0 }).kind).toBe('marker');
    expect(createLabelSource({ bytes: new Uint8Array(LABEL.stride), count: 0, texts: [''] }).kind).toBe('label');
    expect(createPointSource({ bytes: new Uint8Array(POINT.stride), count: 0 }).kind).toBe('point');
    expect(createLineVertexSource({ bytes: new Uint8Array(LINE_VERTEX.stride), count: 0 }).kind).toBe('line-vertex');
    expect(createTriangleVertexSource({ bytes: new Uint8Array(TRIANGLE_VERTEX.stride), count: 0 }).kind).toBe(
      'triangle-vertex'
    );
    expect('commit' in markers).toBe(false);
    expect('commit' in SceneCubes.prototype).toBe(false);
    expect('height' in SceneCamera.prototype).toBe(false);
    expect('setTransform' in SceneFrame.prototype).toBe(false);
    expect('texture' in SceneMesh.prototype).toBe(false);
  });

  it('should preserve required layout helpers without exporting runtime math utilities', () => {
    for (const name of expectedLayoutRuntimeExports) {
      expect(scenePackage).toHaveProperty(name);
    }
    for (const name of internalLayoutRuntimeExports) {
      expect(scenePackage).not.toHaveProperty(name);
    }
    expect(scenePackage).not.toHaveProperty('TRI_VERTEX');
    for (const name of internalMathRuntimeExports) {
      expect(scenePackage).not.toHaveProperty(name);
    }

    expectTypeOf<HasPublicDefineLayout>().toEqualTypeOf<false>();
    expectTypeOf<MarkerBufferHasCommit>().toEqualTypeOf<false>();
    expectTypeOf<PointSourceIsMarkerSource>().toEqualTypeOf<false>();
    expectTypeOf<RawMarkerSourceIsAccepted>().toEqualTypeOf<false>();
    expectTypeOf<SceneCameraHasFovy>().toEqualTypeOf<false>();
    expectTypeOf<SceneCameraHasHeight>().toEqualTypeOf<false>();
    expectTypeOf<SceneCameraHasMode>().toEqualTypeOf<false>();
    expectTypeOf<SceneCameraHasPhi>().toEqualTypeOf<false>();
    expectTypeOf<SceneCameraHasTheta>().toEqualTypeOf<false>();
    expectTypeOf<SceneCubesHasCommit>().toEqualTypeOf<false>();
    expectTypeOf<SceneFrameHasSetTransform>().toEqualTypeOf<false>();
    expectTypeOf<SceneFrameHasTransform>().toEqualTypeOf<false>();
    expectTypeOf<SceneHitHasInstanceIndex>().toEqualTypeOf<false>();
    expectTypeOf<SceneLabelsHasStale>().toEqualTypeOf<false>();
    expectTypeOf<SceneLabels['source']>().toEqualTypeOf<LabelSource | null>();
    expectTypeOf<ExternalLabelSource>().toMatchTypeOf<LabelSource>();
    expectTypeOf<SceneLinesHasInstances>().toEqualTypeOf<false>();
    expectTypeOf<SceneLinesHasVertices>().toEqualTypeOf<false>();
    expectTypeOf<SceneMeshGeometryArrayKey>().toEqualTypeOf<never>();
    expectTypeOf<SceneMeshHasSetGeometry>().toEqualTypeOf<false>();
    expectTypeOf<SceneMeshHasTexture>().toEqualTypeOf<false>();
    expectTypeOf<MarkerBufferHasBytes>().toEqualTypeOf<false>();
    expectTypeOf<FieldType>().toEqualTypeOf<'f32' | 'f32x2' | 'f32x3' | 'f32x4' | 'u32' | 'unorm8x4'>();
    expectTypeOf<FieldSpec['type']>().toEqualTypeOf<FieldType>();
    expectTypeOf<LayoutDescriptor['fields']>().toEqualTypeOf<Readonly<Record<string, Readonly<FieldSpec>>>>();
    expectTypeOf<SceneLines['source']>().toEqualTypeOf<LineVertexSource | null>();
    expectTypeOf<SceneLines['featureIds']>().toEqualTypeOf<SceneFeatureIds | null>();
    expectTypeOf<SceneCubes['featureIds']>().toEqualTypeOf<SceneFeatureIds | null>();
    expectTypeOf<SceneMesh['featureIds']>().toEqualTypeOf<SceneFeatureIds | null>();
    expectTypeOf<SceneModel['featureIds']>().toEqualTypeOf<SceneFeatureIds | null>();
    expectTypeOf<ScenePolygon['featureIds']>().toEqualTypeOf<SceneFeatureIds | null>();
    expectTypeOf<ScenePoints['source']>().toEqualTypeOf<PointSource | null>();
    expectTypeOf<SceneTriangles['source']>().toEqualTypeOf<TriangleVertexSource | null>();
    expectTypeOf<ScenePolygon['geometry']>().toEqualTypeOf<PolygonGeometry | null>();
    expectTypeOf<PolygonPoint>().toEqualTypeOf<readonly [number, number]>();
    expectTypeOf<PolygonRing>().toEqualTypeOf<readonly PolygonPoint[]>();
    expectTypeOf<Mat4>().toEqualTypeOf<Float32Array>();
    expectTypeOf<Vec3>().toEqualTypeOf<[number, number, number]>();
    expectTypeOf<Quaternion>().toEqualTypeOf<[number, number, number, number]>();
    expectTypeOf<RGBA>().toEqualTypeOf<[number, number, number, number]>();
    expectTypeOf<SceneCameraState['pose']>().toEqualTypeOf<ScenePose>();
    expectTypeOf<SceneCameraState['pose']['position']>().toEqualTypeOf<Readonly<Vec3>>();
    expectTypeOf<SceneCameraState['pose']['orientation']>().toEqualTypeOf<Readonly<Quaternion>>();
    expectTypeOf<SceneCameraState['projection']['near']>().toEqualTypeOf<number>();
    expectTypeOf<SceneCameraState['projection']['far']>().toEqualTypeOf<number>();
    expectTypeOf<ScenePose['position']>().toEqualTypeOf<Readonly<Vec3>>();
    expectTypeOf<ScenePose['orientation']>().toEqualTypeOf<Readonly<Quaternion>>();
    expectTypeOf<ExternalMarkerSource['kind']>().toEqualTypeOf<'marker'>();
    expectTypeOf<ExternalLineVertexSource['kind']>().toEqualTypeOf<'line-vertex'>();
    expectTypeOf<ExternalPointSource['kind']>().toEqualTypeOf<'point'>();
    expectTypeOf<ExternalTriangleVertexSource['kind']>().toEqualTypeOf<'triangle-vertex'>();
    expectTypeOf<ScenePublishOptions['activeCount']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<SceneMeshGeometry['positions']>().toEqualTypeOf<Float32Array>();
    expectTypeOf<SceneTextureCaptureResult['status']>().toEqualTypeOf<'applied' | 'failed' | 'superseded'>();
    expectTypeOf<SceneClientPoint['visibility']>().toEqualTypeOf<'clipped' | 'visible'>();
    expectTypeOf<SceneRay['origin']>().toEqualTypeOf<Readonly<Vec3>>();
    expectTypeOf<ScenePickHit['target']>().toEqualTypeOf<ScenePickTarget>();
    expectTypeOf<ScenePickHit['clientX']>().toEqualTypeOf<number>();
    expectTypeOf<ScenePickHit['clientY']>().toEqualTypeOf<number>();
    expectTypeOf<ScenePickHit['featureId']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<SceneFeatureIdMap['values']>().toEqualTypeOf<Uint32Array>();
    expectTypeOf<InstanceTarget['index']>().toEqualTypeOf<number>();
    expectTypeOf<LabelTarget['index']>().toEqualTypeOf<number>();
    expectTypeOf<PointTarget['index']>().toEqualTypeOf<number>();
    expectTypeOf<SegmentTarget['index']>().toEqualTypeOf<number>();
    expectTypeOf<TriangleTarget['index']>().toEqualTypeOf<number>();
    expectTypeOf<SurfaceTargetHasIndex>().toEqualTypeOf<false>();
    expectTypeOf<HTMLElementEventMap['nve-scene-click']['detail']>().toEqualTypeOf<ScenePickHit>();
    expectTypeOf<SceneEventMap['nve-scene-camera-change']['detail']>().toEqualTypeOf<SceneCameraChangeDetail>();
    expectTypeOf<SceneEventMap['nve-scene-error']['detail']>().toEqualTypeOf<SceneErrorDetail>();
    expectTypeOf<SceneEventMap['nve-scene-pointerenter']['detail']>().toEqualTypeOf<ScenePickHit>();
    expectTypeOf<SceneEventMap['nve-scene-pointerleave']['detail']>().toEqualTypeOf<ScenePickHit>();
    expectTypeOf<SceneEventMap['nve-scene-ready']>().toEqualTypeOf<CustomEvent<void>>();
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
      SceneLabels,
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
