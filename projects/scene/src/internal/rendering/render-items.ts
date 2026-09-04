// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { lineSegmentCount, type LineTopology, type LineWidthUnit } from '../lines/data.js';
import type { MarkerLayerRenderData } from '../markers/layer-state.js';
import type { MeshRenderData } from '../mesh/layer-state.js';
import type { PointSizeUnit } from '../points/data.js';
import type { StreamingLayerRenderData as StreamLayerRenderData } from '../streaming-layer-state.js';
import type { Mat4 } from '../types.js';

export interface MarkerRenderItem {
  readonly data: MarkerLayerRenderData;
  readonly frameMatrix: Mat4;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
}

export interface PointRenderItem {
  readonly data: StreamLayerRenderData;
  readonly frameMatrix: Mat4;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  /** CSS pixels or world units, as selected by sizeUnit. */
  readonly size: number;
  readonly sizeUnit: PointSizeUnit;
  readonly type: 'point';
}

export interface LineRenderItem {
  readonly data: StreamLayerRenderData;
  readonly frameMatrix: Mat4;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  readonly topology: LineTopology;
  readonly type: 'line';
  readonly widthUnit: LineWidthUnit;
}

export interface TriangleRenderItem {
  readonly data: StreamLayerRenderData;
  readonly frameMatrix: Mat4;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  readonly type: 'triangle';
}

/** A mesh keeps geometry planar until the lazy mesh renderer uploads it. */
export interface MeshRenderItem {
  readonly data: MeshRenderData;
  readonly frameMatrix: Mat4;
  readonly instances: MarkerLayerRenderData | undefined;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  readonly type: 'mesh';
}

export type SceneRenderItem = MarkerRenderItem | PointRenderItem | LineRenderItem | TriangleRenderItem | MeshRenderItem;

export function isMarkerRenderItem(item: SceneRenderItem): item is MarkerRenderItem {
  return !('type' in item);
}

export function isCubeMarkerRenderItem(item: SceneRenderItem): item is MarkerRenderItem {
  return isMarkerRenderItem(item) && item.data.kind === 'cube';
}

export function isMeshRenderItem(item: SceneRenderItem): item is MeshRenderItem {
  return 'type' in item && item.type === 'mesh';
}

export function isPickableItem(item: SceneRenderItem): boolean {
  return isMarkerRenderItem(item) || isMeshRenderItem(item) || item.data.pickable;
}

export function isInteractiveItem(item: SceneRenderItem): boolean {
  return item.interactive && isPickableItem(item);
}

export function hasPickTargets(items: readonly SceneRenderItem[]): boolean {
  return items.some(item => isPickableItem(item) && getPickItemCount(item) > 0);
}

export function isTransparentItem(item: SceneRenderItem): boolean {
  return (
    item.data.transparent ||
    (isMarkerRenderItem(item) && item.data.outlineTransparent) ||
    (isMeshRenderItem(item) && item.instances?.transparent === true)
  );
}

/** Mesh opacity remains conservative because texture alpha is not available to CPU classification. */
export function isOpaqueItem(item: SceneRenderItem): boolean {
  return isMeshRenderItem(item) || item.data.opaque;
}

export function getStreamSize(item: PointRenderItem | LineRenderItem | TriangleRenderItem): number {
  return item.type === 'point' ? item.size : 0;
}

export function getLineVertexCount(item: LineRenderItem): number {
  const segments = lineSegmentCount(item.data.count, item.topology);
  const joins =
    item.topology === 'segments' ? 0 : item.topology === 'loop' ? item.data.count : Math.max(0, item.data.count - 2);
  return segments * 6 + joins * 3;
}

export function getPickItemCount(item: SceneRenderItem): number {
  if (isMeshRenderItem(item)) return item.data.identityInstance ? 1 : (item.instances?.count ?? 0);
  if ('type' in item && item.type === 'line') return lineSegmentCount(item.data.count, item.topology);
  return item.data.count;
}

export function topologyUniform(topology: LineTopology): number {
  if (topology === 'loop') return 1;
  if (topology === 'segments') return 2;
  return 0;
}
