// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isHeightfieldLayerRegistered, takeHeightfieldLayerRenderData } from '../heightfield/layer-state.js';
import { isInteractiveLayer } from '../interaction.js';
import { identityPreciseMat4 } from '../math/mat4.js';
import {
  isMarkerLayerRegistered,
  takeMarkerLayerFeatureIdSnapshot,
  takeMarkerLayerRenderData
} from '../markers/layer-state.js';
import { isMeshLayerRegistered, takeMeshLayerRenderData } from '../mesh/layer-state.js';
import { isModelLayerRegistered, takeModelLayerRenderData } from '../model/layer-state.js';
import { isPolygonLayerRegistered, takePolygonLayerRenderData } from '../polygon/layer-state.js';
import type { MeshRenderItem, SceneRenderItem } from '../rendering/render-items.js';
import {
  getStreamingLayerKind,
  getStreamingLayerSource,
  isStreamingLayerRegistered,
  takeStreamingLayerRenderData
} from '../streaming-layer-state.js';
import { getFrameWorldMatrixPrecise } from '../frame/state.js';
import { takeSceneFeatureIdSnapshot } from '../feature-ids.js';
import { getPickItemCount } from '../rendering/render-items.js';
import { getLabelLayerSource, isLabelLayerRegistered, takeLabelLayerRenderData } from '../labels/layer-state.js';
import type { LabelScaleUnit } from '../labels/data.js';
import type { PointSizeUnit } from '../points/data.js';
import {
  getSceneLayerSpec,
  type MeshSceneLayerKind,
  type SceneLayerKind,
  type StreamSceneLayerKind
} from '../layer-tags.js';
import { getElementFeatureId, updateElementFeatureIdInactive } from '../element-feature-id.js';
import type { SceneFeatureIdSnapshot } from '../feature-ids.js';

export type { SceneLayerKind } from '../layer-tags.js';

type PendingLayerRecord = { readonly kind: SceneLayerKind; readonly layer: HTMLElement; readonly status: 'pending' };
type MarkerLayerRecord = {
  readonly kind: 'marker';
  readonly layer: HTMLElement;
  readonly status: 'registered';
};
type StreamLayerRecord = {
  readonly kind: StreamSceneLayerKind;
  readonly layer: HTMLElement;
  readonly status: 'registered';
};
type MeshLayerRecord = {
  readonly kind: MeshSceneLayerKind;
  readonly layer: HTMLElement;
  readonly status: 'registered';
};
type HeightfieldLayerRecord = {
  readonly kind: 'heightfield';
  readonly layer: HTMLElement;
  readonly status: 'registered';
};
type LabelLayerRecord = {
  readonly kind: 'label';
  readonly layer: HTMLElement;
  readonly status: 'registered';
};

export type SceneLayerRecord =
  | PendingLayerRecord
  | MarkerLayerRecord
  | StreamLayerRecord
  | LabelLayerRecord
  | MeshLayerRecord
  | HeightfieldLayerRecord;

/** Resolves one supported layer to a closed pending or registered record. */
// eslint-disable-next-line complexity -- Each supported custom-element tag has one explicit resolution branch.
export function resolveSceneLayer(layer: HTMLElement): SceneLayerRecord | undefined {
  const spec = getSceneLayerSpec(layer.localName);
  if (!spec) return undefined;
  if (spec.family === 'marker')
    return isMarkerLayerRegistered(layer) ? { kind: 'marker', layer, status: 'registered' } : pending(layer, 'marker');
  if (spec.family === 'stream') {
    if (!isStreamingLayerRegistered(layer)) return pending(layer, spec.kind);
    return { kind: getStreamingLayerKind(layer), layer, status: 'registered' };
  }
  if (spec.family === 'label')
    return isLabelLayerRegistered(layer) ? { kind: 'label', layer, status: 'registered' } : pending(layer, 'label');
  if (spec.family === 'heightfield')
    return isHeightfieldLayerRegistered(layer)
      ? { kind: 'heightfield', layer, status: 'registered' }
      : pending(layer, 'heightfield');
  return isRegisteredMeshKind(layer, spec.kind)
    ? { kind: spec.kind, layer, status: 'registered' }
    : pending(layer, spec.kind);
}

/** Takes render data only at the render snapshot boundary. */
export function createSceneLayerRenderItem(record: SceneLayerRecord): SceneRenderItem | undefined {
  if (record.status === 'pending') return undefined;
  const { layer } = record;
  const frameMatrix = getOwningFrameMatrix(layer);
  const interactive = isInteractiveLayer(layer);
  if (record.kind === 'marker') {
    const item = { data: takeMarkerLayerRenderData(layer), frameMatrix, interactive, layer, type: 'marker' } as const;
    return withFeatureIds(item, takeMarkerLayerFeatureIdSnapshot(layer, getPickItemCount(item)));
  }
  if (record.kind === 'label') {
    const item = {
      data: takeLabelLayerRenderData(layer),
      frameMatrix,
      interactive,
      layer,
      scaleUnit: labelScaleUnit(layer),
      type: 'label'
    } as const;
    return withFeatureIds(item, takeSceneFeatureIdSnapshot(getLabelLayerSource(layer), getPickItemCount(item), layer));
  }
  if (record.kind === 'heightfield') {
    const item = meshItem({ data: takeHeightfieldLayerRenderData(layer), frameMatrix, interactive, layer });
    return withFeatureIds(item, takeSceneFeatureIdSnapshot(layer, getPickItemCount(item)));
  }
  if (isStreamRecord(record)) return createStreamLayerRenderItem(record, frameMatrix, interactive);
  return createMeshLayerRenderItem(record, frameMatrix, interactive);
}

function createStreamLayerRenderItem(
  record: StreamLayerRecord,
  frameMatrix: Float64Array,
  interactive: boolean
): SceneRenderItem {
  const { layer } = record;
  const data = takeStreamingLayerRenderData(layer);
  let item: SceneRenderItem;
  if (record.kind === 'point') {
    item = {
      data,
      frameMatrix,
      interactive,
      layer,
      size: layerNumber(layer, 'size', 3),
      sizeUnit: pointSizeUnit(layer),
      type: 'point'
    };
  } else if (record.kind === 'line') {
    item = {
      data,
      frameMatrix,
      interactive,
      layer,
      topology: data.topology,
      type: 'line',
      widthUnit: data.widthUnit
    };
  } else {
    item = { data, frameMatrix, interactive, layer, type: 'triangle' };
  }
  return withFeatureIds(
    item,
    takeSceneFeatureIdSnapshot(getStreamingLayerSource(layer), getPickItemCount(item), layer)
  );
}

function createMeshLayerRenderItem(
  record: MeshLayerRecord,
  frameMatrix: Float64Array,
  interactive: boolean
): MeshRenderItem {
  const { layer } = record;
  const item = meshItem({
    data: takeMeshRecordRenderData(record),
    frameMatrix,
    instances: optionalMarkers(layer),
    interactive,
    layer
  });
  const identityInstance = item.data.identityInstance;
  updateElementFeatureIdInactive(layer, !identityInstance && getElementFeatureId(layer) !== undefined);
  const featureIds = identityInstance
    ? takeSceneFeatureIdSnapshot(layer, 1)
    : takeMarkerLayerFeatureIdSnapshot(layer, getPickItemCount(item));
  return withFeatureIds(item, featureIds);
}

export function isTechnicallyPickableLayer(record: SceneLayerRecord): boolean {
  return record.status === 'registered';
}

function pending(layer: HTMLElement, kind: SceneLayerKind): PendingLayerRecord {
  return { kind, layer, status: 'pending' };
}

function isRegisteredMeshKind(layer: HTMLElement, kind: MeshLayerRecord['kind']): boolean {
  if (kind === 'mesh') return isMeshLayerRegistered(layer);
  if (kind === 'model') return isModelLayerRegistered(layer);
  return isPolygonLayerRegistered(layer);
}

function isStreamRecord(
  record: Exclude<SceneLayerRecord, PendingLayerRecord | MarkerLayerRecord | HeightfieldLayerRecord>
): record is StreamLayerRecord {
  return record.kind === 'point' || record.kind === 'line' || record.kind === 'triangle';
}

function takeMeshRecordRenderData(record: MeshLayerRecord) {
  if (record.kind === 'mesh') return takeMeshLayerRenderData(record.layer);
  if (record.kind === 'model') return takeModelLayerRenderData(record.layer);
  return takePolygonLayerRenderData(record.layer);
}

function optionalMarkers(layer: HTMLElement) {
  return isMarkerLayerRegistered(layer) ? takeMarkerLayerRenderData(layer) : undefined;
}

function meshItem(
  options: Omit<MeshRenderItem, 'instances' | 'type'> & Pick<Partial<MeshRenderItem>, 'instances'>
): MeshRenderItem {
  return { ...options, instances: options.instances, type: 'mesh' };
}

function withFeatureIds<Item extends SceneRenderItem>(
  item: Item,
  featureIds: SceneFeatureIdSnapshot | undefined
): Item {
  return featureIds ? { ...item, featureIds } : item;
}

function getOwningFrameMatrix(layer: HTMLElement): Float64Array {
  const frame = layer.closest<HTMLElement>('nve-scene-frame');
  return frame ? getFrameWorldMatrixPrecise(frame) : identityPreciseMat4();
}

function layerNumber(layer: HTMLElement, name: string, fallback: number): number {
  const value = Reflect.get(layer, name);
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function pointSizeUnit(layer: HTMLElement): PointSizeUnit {
  return layerUnit({ accepted: ['pixel', 'world'], fallback: 'pixel', layer, name: 'sizeUnit' });
}

function labelScaleUnit(layer: HTMLElement): LabelScaleUnit {
  return layerUnit({ accepted: ['pixel', 'world'], fallback: 'pixel', layer, name: 'scaleUnit' });
}

function layerUnit<T extends string>(options: {
  readonly accepted: readonly T[];
  readonly fallback: T;
  readonly layer: HTMLElement;
  readonly name: string;
}): T {
  const value = Reflect.get(options.layer, options.name);
  return typeof value === 'string' && options.accepted.includes(value as T) ? (value as T) : options.fallback;
}
