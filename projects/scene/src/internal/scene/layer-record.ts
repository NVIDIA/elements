// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getHeightfieldLayerVersion,
  isHeightfieldLayerRegistered,
  takeHeightfieldLayerRenderData
} from '../heightfield/layer-state.js';
import { isInteractiveLayer } from '../interaction.js';
import { identityPreciseMat4 } from '../math/mat4.js';
import { getMarkerLayerVersion, isMarkerLayerRegistered, takeMarkerLayerRenderData } from '../markers/layer-state.js';
import { getMeshLayerVersion, isMeshLayerRegistered, takeMeshLayerRenderData } from '../mesh/layer-state.js';
import { getModelLayerVersion, isModelLayerRegistered, takeModelLayerRenderData } from '../model/layer-state.js';
import {
  getPolygonLayerVersion,
  isPolygonLayerRegistered,
  takePolygonLayerRenderData
} from '../polygon/layer-state.js';
import type { MeshRenderItem, SceneRenderItem } from '../rendering/render-items.js';
import {
  getStreamingLayerKind,
  getStreamingLayerVersion,
  isStreamingLayerRegistered,
  takeStreamingLayerRenderData
} from '../streaming-layer-state.js';
import { getFrameWorldMatrixPrecise } from '../frame/state.js';
import { getSceneFeatureIdVersion, takeSceneFeatureIdSnapshot } from '../feature-ids.js';
import { getPickItemCount } from '../rendering/render-items.js';
import { getLabelLayerVersion, isLabelLayerRegistered, takeLabelLayerRenderData } from '../labels/layer-state.js';
import type { LabelScaleUnit } from '../labels/data.js';
import type { LineTopology, LineWidthUnit } from '../lines/data.js';
import type { PointSizeUnit } from '../points/data.js';
import {
  getSceneLayerSpec,
  type MeshSceneLayerKind,
  type SceneLayerKind,
  type StreamSceneLayerKind
} from '../layer-tags.js';

export type { SceneLayerKind } from '../layer-tags.js';

type PendingLayerRecord = { readonly kind: SceneLayerKind; readonly layer: HTMLElement; readonly status: 'pending' };
type MarkerLayerRecord = {
  readonly kind: 'marker';
  readonly layer: HTMLElement;
  readonly status: 'registered';
  featureVersion?: number;
  version?: number;
};
type StreamLayerRecord = {
  readonly kind: StreamSceneLayerKind;
  readonly layer: HTMLElement;
  readonly status: 'registered';
  config?: readonly [number, PointSizeUnit] | readonly [LineTopology, LineWidthUnit] | readonly [];
  featureVersion?: number;
  version?: number;
};
type MeshLayerRecord = {
  readonly kind: MeshSceneLayerKind;
  readonly layer: HTMLElement;
  readonly status: 'registered';
  featureVersion?: number;
  geometryVersion?: number;
  instanceVersion?: number;
};
type HeightfieldLayerRecord = {
  readonly kind: 'heightfield';
  readonly layer: HTMLElement;
  readonly status: 'registered';
  version?: number;
};
type LabelLayerRecord = {
  readonly kind: 'label';
  readonly layer: HTMLElement;
  readonly status: 'registered';
  config?: LabelScaleUnit;
  featureVersion?: number;
  version?: number;
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

/** Tracks independent geometry, instance, source, and render-configuration versions. */
// eslint-disable-next-line complexity, max-statements -- Each closed layer kind owns a distinct version source.
export function trackSceneLayerChanges(record: SceneLayerRecord): boolean {
  if (record.status === 'pending') return false;
  if (record.kind === 'marker') {
    const layerChanged = trackVersion(record, getMarkerLayerVersion(record.layer));
    return trackFeatureVersion(record) || layerChanged;
  }
  if (record.kind === 'heightfield') return trackVersion(record, getHeightfieldLayerVersion(record.layer));
  if (record.kind === 'label') {
    const changed = trackVersion(record, getLabelLayerVersion(record.layer));
    const config = labelScaleUnit(record.layer);
    const configChanged = record.config !== config;
    record.config = config;
    return trackFeatureVersion(record) || changed || configChanged;
  }
  if (isStreamRecord(record)) {
    const layerChanged = trackStream(record);
    return trackFeatureVersion(record) || layerChanged;
  }
  const geometryVersion = getMeshVersion(record);
  const instanceVersion = isMarkerLayerRegistered(record.layer) ? getMarkerLayerVersion(record.layer) : undefined;
  const featureChanged = trackFeatureVersion(record);
  const changed =
    record.geometryVersion !== geometryVersion || record.instanceVersion !== instanceVersion || featureChanged;
  record.geometryVersion = geometryVersion;
  record.instanceVersion = instanceVersion;
  return changed;
}

/** Takes render data only at the render snapshot boundary. */
export function createSceneLayerRenderItem(record: SceneLayerRecord): SceneRenderItem | undefined {
  if (record.status === 'pending') return undefined;
  const { layer } = record;
  const frameMatrix = getOwningFrameMatrix(layer);
  const interactive = isInteractiveLayer(layer);
  if (record.kind === 'marker')
    return withFeatureIds({ data: takeMarkerLayerRenderData(layer), frameMatrix, interactive, layer, type: 'marker' });
  if (record.kind === 'label')
    return withFeatureIds({
      data: takeLabelLayerRenderData(layer),
      frameMatrix,
      interactive,
      layer,
      scaleUnit: labelScaleUnit(layer),
      type: 'label'
    });
  if (record.kind === 'heightfield')
    return meshItem({ data: takeHeightfieldLayerRenderData(layer), frameMatrix, interactive, layer });
  if (isStreamRecord(record)) return createStreamLayerRenderItem(record, frameMatrix, interactive);
  return withFeatureIds(
    meshItem({
      data: takeMeshRecordRenderData(record),
      frameMatrix,
      instances: optionalMarkers(layer),
      interactive,
      layer
    })
  );
}

function createStreamLayerRenderItem(
  record: StreamLayerRecord,
  frameMatrix: Float64Array,
  interactive: boolean
): SceneRenderItem {
  const { layer } = record;
  const data = takeStreamingLayerRenderData(layer);
  if (record.kind === 'point')
    return withFeatureIds({
      data,
      frameMatrix,
      interactive,
      layer,
      size: layerNumber(layer, 'size', 3),
      sizeUnit: pointSizeUnit(layer),
      type: 'point'
    });
  if (record.kind === 'line')
    return withFeatureIds({
      data,
      frameMatrix,
      interactive,
      layer,
      topology: data.topology,
      type: 'line',
      widthUnit: data.widthUnit
    });
  return withFeatureIds({ data, frameMatrix, interactive, layer, type: 'triangle' });
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

function trackVersion(record: MarkerLayerRecord | HeightfieldLayerRecord | LabelLayerRecord, version: number): boolean {
  const changed = record.version !== version;
  record.version = version;
  return changed;
}

function trackStream(record: StreamLayerRecord): boolean {
  const version = getStreamingLayerVersion(record.layer);
  const config = streamConfig(record.layer, record.kind);
  const changed = record.version !== version || !sameConfig(record.config, config);
  record.version = version;
  record.config = config;
  return changed;
}

function trackFeatureVersion(
  record: MarkerLayerRecord | StreamLayerRecord | MeshLayerRecord | LabelLayerRecord
): boolean {
  const version = getSceneFeatureIdVersion(record.layer);
  const changed = record.featureVersion !== version;
  record.featureVersion = version;
  return changed;
}

function streamConfig(layer: HTMLElement, kind: StreamLayerRecord['kind']): StreamLayerRecord['config'] {
  if (kind === 'point') return [layerNumber(layer, 'size', 3), pointSizeUnit(layer)];
  if (kind === 'line') return [lineTopology(layer), lineWidthUnit(layer)];
  return [];
}

function sameConfig(left: StreamLayerRecord['config'], right: StreamLayerRecord['config']): boolean {
  if (!left || !right) return left === right;
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isStreamRecord(
  record: Exclude<SceneLayerRecord, PendingLayerRecord | MarkerLayerRecord | HeightfieldLayerRecord>
): record is StreamLayerRecord {
  return record.kind === 'point' || record.kind === 'line' || record.kind === 'triangle';
}

function getMeshVersion(record: MeshLayerRecord): number {
  if (record.kind === 'mesh') return getMeshLayerVersion(record.layer);
  if (record.kind === 'model') return getModelLayerVersion(record.layer);
  return getPolygonLayerVersion(record.layer);
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

function withFeatureIds<Item extends SceneRenderItem>(item: Item): Item {
  const featureIds = takeSceneFeatureIdSnapshot(item.layer, getPickItemCount(item));
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

function lineTopology(layer: HTMLElement): LineTopology {
  return layerUnit({ accepted: ['strip', 'loop', 'segments'], fallback: 'strip', layer, name: 'topology' });
}

function lineWidthUnit(layer: HTMLElement): LineWidthUnit {
  return layerUnit({ accepted: ['pixel', 'world'], fallback: 'world', layer, name: 'widthUnit' });
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
