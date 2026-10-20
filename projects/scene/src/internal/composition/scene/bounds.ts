// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FrameEvaluation } from '../frame/state.js';
import { POLYLINE_MITER_LIMIT } from '../../math/polyline.js';
import { SCENE_LAYER_SELECTOR } from '../../layers/registry.js';
import { getMarkerLayerRenderData, type MarkerLayerRenderData } from '../../layers/markers/layer-state.js';
import { getStreamingLayerRenderData } from '../../layers/streaming/layer-state.js';
import { getLabelLayerRenderData } from '../../layers/labels/layer-state.js';
import { getMeshRenderData } from '../../layers/mesh/layer-state.js';
import { takeBodyLayerRenderData } from '../../layers/body/layer-state.js';
import { takePolygonLayerRenderData } from '../../layers/polygon/layer-state.js';
import { takeHeightfieldLayerRenderData } from '../../layers/heightfield/layer-state.js';
import type { MeshRenderData } from '../../layers/mesh/render-data.js';
import { getMeshLocalBounds } from '../../layers/mesh/bounds.js';
import { lineJoinCount, lineSegmentCount } from '../../algorithms/line-topology.js';
import { BoundsAccumulator, type SceneBounds } from '../../math/bounds.js';
import { composeMat4Into, multiplyMat4Into } from '../../math/mat4.js';
import { PRIMITIVE_BOUNDS } from '../../math/primitive-bounds.js';
import { PreparedAffineTransform } from '../../math/affine-transform.js';
import type { Matrix4, Quaternion, Vec3 } from '../../math/types.js';
import { LABEL, LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from '../../records/layouts/built-ins.js';
import { getFieldOffset } from '../../records/layouts/define-layout.js';
import { resolveSceneLayer, type SceneLayerRecord } from './layer-record.js';

export interface SceneBoundsQueryOptions {
  /** Layers or ancestor containers whose scene-owned geometry contributes. */
  readonly content: Iterable<Element>;
  /** Elements and subtrees omitted from the selection. */
  readonly exclude?: Iterable<Element>;
  /** Includes layers beneath hidden attributes. Defaults to false. */
  readonly includeHidden?: boolean;
}

const WIDTH_OFFSET = getFieldOffset(LINE_VERTEX, 'width');
const POSITION_OFFSET = getFieldOffset(MARKER, 'position');
const ORIENTATION_OFFSET = getFieldOffset(MARKER, 'orientation');
const SCALE_OFFSET = getFieldOffset(MARKER, 'scale');

/** Queries published captures without taking a renderer snapshot or draining uploads. */
export function getSceneBounds(scene: HTMLElement, options: SceneBoundsQueryOptions): SceneBounds | null {
  const selection = {
    scene,
    content: ownedElements(scene, options.content),
    excluded: ownedElements(scene, options.exclude ?? []),
    includeHidden: options.includeHidden ?? false
  };
  const frames = new FrameEvaluation();
  const bounds = new BoundsAccumulator();
  for (const layer of scene.querySelectorAll<HTMLElement>(SCENE_LAYER_SELECTOR)) {
    if (!layerMatchesSelection(layer, selection)) continue;
    const record = resolveSceneLayer(layer);
    const matrix = frames.getWorldMatrix(layer);
    if (record && record.status === 'registered' && matrix) includeLayer(bounds, record, matrix);
  }
  return bounds.bounds;
}

function layerMatchesSelection(
  layer: HTMLElement,
  selection: {
    readonly scene: HTMLElement;
    readonly content: readonly Element[];
    readonly excluded: readonly Element[];
    readonly includeHidden: boolean;
  }
): boolean {
  return (
    layer.closest('nve-scene') === selection.scene &&
    selection.content.some(root => root.contains(layer)) &&
    !selection.excluded.some(root => root.contains(layer)) &&
    (selection.includeHidden || !layer.closest('[hidden]'))
  );
}

function ownedElements(scene: HTMLElement, elements: Iterable<Element>): Element[] {
  const result = new Set<Element>();
  for (const element of elements) {
    if (!(element instanceof Element) || element.closest('nve-scene') !== scene) {
      throw new TypeError('Bounds selections must belong to this scene.');
    }
    result.add(element);
  }
  return [...result];
}

function includeLayer(bounds: BoundsAccumulator, record: SceneLayerRecord, frame: Matrix4): void {
  if (record.status === 'pending') return;
  if (record.kind === 'marker') {
    const data = getMarkerLayerRenderData(record.layer);
    includeInstances(bounds, { data, frame, geometry: PRIMITIVE_BOUNDS[data.kind] });
  } else if (record.kind === 'label') {
    const data = getLabelLayerRenderData(record.layer);
    if (data.ready && data.bytes) includePositions(bounds, { ...data, frame, stride: LABEL.stride, radius: 0 });
  } else if (record.kind === 'point' || record.kind === 'line' || record.kind === 'triangle') {
    includeStream(bounds, record, frame);
  } else includeMesh(bounds, record, frame);
}

function includeStream(
  bounds: BoundsAccumulator,
  record: Extract<SceneLayerRecord, { kind: 'point' | 'line' | 'triangle' }>,
  frame: Matrix4
): void {
  const data = getStreamingLayerRenderData(record.layer);
  if (!data.ready || !data.bytes) return;
  if (record.kind === 'line' && lineSegmentCount(data.count, data.topology) === 0) return;
  const stride =
    record.kind === 'point' ? POINT.stride : record.kind === 'line' ? LINE_VERTEX.stride : TRIANGLE_VERTEX.stride;
  const radius = streamRadius(record, data);
  includePositions(bounds, { ...data, frame, stride, radius });
}

function streamRadius(
  record: Extract<SceneLayerRecord, { kind: 'point' | 'line' | 'triangle' }>,
  data: ReturnType<typeof getStreamingLayerRenderData>
): number {
  if (record.kind === 'point') return pointRadius(record.layer);
  if (record.kind !== 'line' || data.widthUnit !== 'world' || !data.bytes) return 0;
  const view = new DataView(data.bytes.buffer, data.bytes.byteOffset, data.bytes.byteLength);
  let width = 0;
  for (let index = 0; index < data.count; index++)
    width = Math.max(width, view.getFloat32(index * LINE_VERTEX.stride + WIDTH_OFFSET, true));
  const halfWidth = width * 0.5;
  return halfWidth * (lineJoinCount(data.count, data.topology) > 0 ? POLYLINE_MITER_LIMIT : 1);
}

function pointRadius(layer: HTMLElement): number {
  if (Reflect.get(layer, 'sizeUnit') !== 'world') return 0;
  const size: unknown = Reflect.get(layer, 'size');
  return typeof size === 'number' && Number.isFinite(size) && size > 0 ? size / Math.SQRT2 : 3 / Math.SQRT2;
}

function includePositions(
  bounds: BoundsAccumulator,
  options: {
    readonly bytes: Uint8Array | null;
    readonly count: number;
    readonly frame: Matrix4;
    readonly stride: number;
    readonly radius: number;
  }
): void {
  if (!options.bytes) return;
  const view = new DataView(options.bytes.buffer, options.bytes.byteOffset, options.bytes.byteLength);
  const transform = new PreparedAffineTransform(options.frame);
  const position: Vec3 = [0, 0, 0];
  for (let index = 0; index < options.count; index++) {
    const offset = index * options.stride;
    position[0] = view.getFloat32(offset, true);
    position[1] = view.getFloat32(offset + 4, true);
    position[2] = view.getFloat32(offset + 8, true);
    bounds.include(transform.writePosition(position, 0, position, 0), options.radius);
  }
}

function includeInstances(
  bounds: BoundsAccumulator,
  options: { readonly data: MarkerLayerRenderData; readonly geometry: SceneBounds; readonly frame: Matrix4 }
): void {
  const { data, geometry, frame } = options;
  if (!data.ready || !data.bytes) return;
  const view = new DataView(data.bytes.buffer, data.bytes.byteOffset, data.bytes.byteLength);
  const position: Vec3 = [0, 0, 0];
  const orientation: Quaternion = [0, 0, 0, 1];
  const scale: Vec3 = [1, 1, 1];
  const local = new Float64Array(16);
  const world = new Float64Array(16);
  for (let index = 0; index < data.count; index++) {
    const offset = index * MARKER.stride;
    readFloats(view, offset + POSITION_OFFSET, position);
    readFloats(view, offset + ORIENTATION_OFFSET, orientation);
    readFloats(view, offset + SCALE_OFFSET, scale);
    composeMat4Into(position, orientation, scale, local);
    bounds.includeBox(geometry, multiplyMat4Into(frame, local, world));
  }
}

function readFloats(view: DataView, byteOffset: number, target: number[]): void {
  for (let index = 0; index < target.length; index++) target[index] = view.getFloat32(byteOffset + index * 4, true);
}

function includeMesh(bounds: BoundsAccumulator, record: SceneLayerRecord, frame: Matrix4): void {
  const data = meshData(record);
  if (!data?.ready) return;
  const geometry = getMeshLocalBounds(data);
  if (!geometry) return;
  if (data.identityInstance) bounds.includeBox(geometry, frame);
  else includeInstances(bounds, { data: getMarkerLayerRenderData(record.layer), geometry, frame });
}

function meshData(record: SceneLayerRecord): MeshRenderData | undefined {
  if (record.kind === 'mesh') return getMeshRenderData(record.layer);
  if (record.kind === 'body') return takeBodyLayerRenderData(record.layer);
  if (record.kind === 'polygon') return takePolygonLayerRenderData(record.layer);
  if (record.kind === 'heightfield') return takeHeightfieldLayerRenderData(record.layer);
  return undefined;
}
