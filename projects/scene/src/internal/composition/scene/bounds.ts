// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FrameEvaluation } from '../frame/state.js';
import { SCENE_LAYER_SELECTOR } from '../../layers/registry.js';
import { getMarkerLayerRenderData, type MarkerLayerRenderData } from '../../layers/markers/layer-state.js';
import { getStreamingLayerRenderData } from '../../layers/streaming/layer-state.js';
import { getLabelLayerRenderData } from '../../layers/labels/layer-state.js';
import { getMeshRenderData } from '../../layers/mesh/layer-state.js';
import { takeModelLayerRenderData } from '../../layers/model/layer-state.js';
import { takePolygonLayerRenderData } from '../../layers/polygon/layer-state.js';
import { takeHeightfieldLayerRenderData } from '../../layers/heightfield/layer-state.js';
import type { MeshRenderData } from '../../layers/mesh/render-data.js';
import { lineSegmentCount } from '../../layers/lines/data.js';
import { BoundsAccumulator, type SceneBounds } from '../../math/bounds.js';
import { composePreciseMat4, multiplyPreciseMat4, transformPointMat4 } from '../../math/mat4.js';
import type { Matrix4, Vec3 } from '../../math/types.js';
import { LABEL, LINE_VERTEX, POINT, TRIANGLE_VERTEX } from '../../records/layouts/built-ins.js';
import { readMarker } from '../../records/layouts/codecs.js';
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

const CENTERED_BOX: SceneBounds = { minimum: [-0.5, -0.5, -0.5], maximum: [0.5, 0.5, 0.5] };
const ARROW_BOX: SceneBounds = { minimum: [-1, -1, 0], maximum: [1, 1, 1] };
const WIDTH_OFFSET = getFieldOffset(LINE_VERTEX, 'width');

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
    includeInstances(bounds, { data, frame, geometry: data.kind === 'arrow' ? ARROW_BOX : CENTERED_BOX });
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
  // World joins cap miters at four half-widths. Independent segments have no joins.
  return width * (data.topology !== 'segments' && data.count > 2 ? 2 : 0.5);
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
  for (let index = 0; index < options.count; index++) {
    const offset = index * options.stride;
    const position: Vec3 = [
      view.getFloat32(offset, true),
      view.getFloat32(offset + 4, true),
      view.getFloat32(offset + 8, true)
    ];
    bounds.include(transformPointMat4(options.frame, position), options.radius);
  }
}

function includeInstances(
  bounds: BoundsAccumulator,
  options: { readonly data: MarkerLayerRenderData; readonly geometry: SceneBounds; readonly frame: Matrix4 }
): void {
  const { data, geometry, frame } = options;
  if (!data.ready || !data.bytes) return;
  for (let index = 0; index < data.count; index++) {
    const marker = readMarker(data.bytes, index);
    const matrix = multiplyPreciseMat4(frame, composePreciseMat4(marker.position, marker.orientation, marker.scale));
    bounds.includeBox(geometry, matrix);
  }
}

function includeMesh(bounds: BoundsAccumulator, record: SceneLayerRecord, frame: Matrix4): void {
  const data = meshData(record);
  if (!data?.ready) return;
  const geometry = meshBounds(data);
  if (!geometry) return;
  if (data.identityInstance) bounds.includeBox(geometry, frame);
  else includeInstances(bounds, { data: getMarkerLayerRenderData(record.layer), geometry, frame });
}

function meshData(record: SceneLayerRecord): MeshRenderData | undefined {
  if (record.kind === 'mesh') return getMeshRenderData(record.layer);
  if (record.kind === 'model') return takeModelLayerRenderData(record.layer);
  if (record.kind === 'polygon') return takePolygonLayerRenderData(record.layer);
  if (record.kind === 'heightfield') return takeHeightfieldLayerRenderData(record.layer);
  return undefined;
}

function meshBounds(data: MeshRenderData): SceneBounds | null {
  const bounds = new BoundsAccumulator();
  if (data.heightfield) {
    const grid = data.heightfield;
    for (let index = 0; index < grid.heights.length; index++) {
      bounds.include([
        Math.fround(grid.origin[0] + (index % grid.columns) * grid.spacing),
        Math.fround(grid.origin[1] + Math.floor(index / grid.columns) * grid.spacing),
        grid.heights[index]!
      ]);
    }
  } else if (data.positions) {
    const positions = data.positions;
    const count = data.indices?.length ?? positions.length / 3;
    for (let index = 0; index < count; index++) {
      const offset = (data.indices?.[index] ?? index) * 3;
      bounds.include([positions[offset]!, positions[offset + 1]!, positions[offset + 2]!]);
    }
  }
  return bounds.bounds;
}
