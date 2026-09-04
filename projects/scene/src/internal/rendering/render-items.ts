// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { lineSegmentCount, type LineTopology, type LineWidthUnit } from '../lines/data.js';
import type { MarkerLayerRenderData } from '../markers/layer-state.js';
import type { MeshRenderData } from '../mesh/layer-state.js';
import type { PointSizeUnit } from '../points/data.js';
import type { LabelScaleUnit } from '../labels/data.js';
import type { LabelLayerRenderData } from '../labels/layer-state.js';
import type { StreamingLayerRenderData as StreamLayerRenderData } from '../streaming-layer-state.js';
import type { Matrix4 } from '../types.js';
import type { SceneFeatureIdSnapshot } from '../feature-ids.js';

interface FeatureIdentifiedRenderItem {
  readonly featureIds?: SceneFeatureIdSnapshot;
}

export interface MarkerRenderItem extends FeatureIdentifiedRenderItem {
  readonly data: MarkerLayerRenderData;
  readonly frameMatrix: Matrix4;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  readonly type: 'marker';
}

export interface PointRenderItem extends FeatureIdentifiedRenderItem {
  readonly data: StreamLayerRenderData;
  readonly frameMatrix: Matrix4;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  /** CSS pixels or world units, as selected by sizeUnit. */
  readonly size: number;
  readonly sizeUnit: PointSizeUnit;
  readonly type: 'point';
}

export interface LineRenderItem extends FeatureIdentifiedRenderItem {
  readonly data: StreamLayerRenderData;
  readonly frameMatrix: Matrix4;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  readonly topology: LineTopology;
  readonly type: 'line';
  readonly widthUnit: LineWidthUnit;
}

export interface TriangleRenderItem extends FeatureIdentifiedRenderItem {
  readonly data: StreamLayerRenderData;
  readonly frameMatrix: Matrix4;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  readonly type: 'triangle';
}

export interface LabelRenderItem extends FeatureIdentifiedRenderItem {
  readonly data: LabelLayerRenderData;
  readonly frameMatrix: Matrix4;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  readonly scaleUnit: LabelScaleUnit;
  readonly type: 'label';
}

/** A mesh keeps geometry planar until the lazy mesh renderer uploads it. */
export interface MeshRenderItem extends FeatureIdentifiedRenderItem {
  readonly data: MeshRenderData;
  readonly frameMatrix: Matrix4;
  readonly instances: MarkerLayerRenderData | undefined;
  readonly interactive: boolean;
  readonly layer: HTMLElement;
  readonly type: 'mesh';
}

export type SceneRenderItem =
  | LabelRenderItem
  | MarkerRenderItem
  | PointRenderItem
  | LineRenderItem
  | TriangleRenderItem
  | MeshRenderItem;

export function isLabelRenderItem(item: SceneRenderItem): item is LabelRenderItem {
  return item.type === 'label';
}

export function isMarkerRenderItem(item: SceneRenderItem): item is MarkerRenderItem {
  return item.type === 'marker';
}

export function markerOutlinePassIsVisible(item: MarkerRenderItem, transparent: boolean): boolean {
  return transparent ? item.data.outlineTransparent : item.data.outlineOpaque;
}

export function isCubeMarkerRenderItem(item: SceneRenderItem): item is MarkerRenderItem {
  return isMarkerRenderItem(item) && item.data.kind === 'cube';
}

export function isMeshRenderItem(item: SceneRenderItem): item is MeshRenderItem {
  return item.type === 'mesh';
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

export function getPickItemCount(item: SceneRenderItem): number {
  if (isMeshRenderItem(item)) return item.data.identityInstance ? 1 : (item.instances?.count ?? 0);
  if (item.type === 'line') return lineSegmentCount(item.data.count, item.topology);
  if (item.type === 'label') return item.data.count;
  return item.type === 'triangle' ? item.data.count / 3 : item.data.count;
}

export function topologyUniform(topology: LineTopology): number {
  if (topology === 'loop') return 1;
  if (topology === 'segments') return 2;
  return 0;
}
