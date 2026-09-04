// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FRAME_NAME_DUPLICATE, type SceneErrorDetail } from '../../errors.js';
import {
  getFrameName,
  getFrameVersion,
  getFrameWorldMatrix,
  isFrameChainValid,
  isFrameStateRegistered,
  setSceneNamedFrames
} from '../frame/state.js';
import {
  getHeightfieldLayerVersion,
  isHeightfieldLayerRegistered,
  takeHeightfieldLayerRenderData
} from '../heightfield/layer-state.js';
import { identityMat4 } from '../math/mat4.js';
import { getMarkerLayerVersion, isMarkerLayerRegistered, takeMarkerLayerRenderData } from '../markers/layer-state.js';
import { getMeshLayerVersion, isMeshLayerRegistered, takeMeshLayerRenderData } from '../mesh/layer-state.js';
import { getModelLayerVersion, isModelLayerRegistered, takeModelLayerRenderData } from '../model/layer-state.js';
import {
  getPolygonLayerVersion,
  isPolygonLayerRegistered,
  takePolygonLayerRenderData
} from '../polygon/layer-state.js';
import {
  getStreamingLayerKind,
  getStreamingLayerVersion,
  isStreamingLayerRegistered,
  takeStreamingLayerRenderData,
  type StreamingLayerRenderData
} from '../streaming-layer-state.js';
import type { MeshRenderItem, SceneRenderItem } from '../rendering/render-items.js';
import { isInteractiveLayer } from '../interaction.js';

const MARKER_LAYER_SELECTOR = [
  'nve-scene-cones',
  'nve-scene-cubes',
  'nve-scene-cylinders',
  'nve-scene-pyramids',
  'nve-scene-spheres'
].join(',');
const STREAMING_LAYER_SELECTOR = ['nve-scene-lines', 'nve-scene-points', 'nve-scene-triangles'].join(',');
const REFERENCE_LAYER_SELECTOR = ['nve-scene-axes', 'nve-scene-gridlines'].join(',');
const HEIGHTFIELD_LAYER_SELECTOR = 'nve-scene-heightfield';
const MESH_LAYER_SELECTOR = 'nve-scene-mesh';
const MODEL_LAYER_SELECTOR = 'nve-scene-model';
const POLYGON_LAYER_SELECTOR = 'nve-scene-polygon';
const RENDERABLE_LAYER_SELECTOR = `${MARKER_LAYER_SELECTOR},${STREAMING_LAYER_SELECTOR},${REFERENCE_LAYER_SELECTOR},${HEIGHTFIELD_LAYER_SELECTOR},${MESH_LAYER_SELECTOR},${MODEL_LAYER_SELECTOR},${POLYGON_LAYER_SELECTOR}`;

export class SceneContent {
  #duplicateFrames = new Set<HTMLElement>();
  #frames: HTMLElement[] = [];
  #frameVersions = new WeakMap<HTMLElement, number>();
  #heightfieldVersions = new WeakMap<HTMLElement, number>();
  readonly #host: HTMLElement;
  #layers: HTMLElement[] = [];
  #layerVersions = new WeakMap<HTMLElement, number>();
  #meshVersions = new WeakMap<HTMLElement, number>();
  #modelVersions = new WeakMap<HTMLElement, number>();
  #polygonVersions = new WeakMap<HTMLElement, number>();
  #streamRenderConfig = new WeakMap<HTMLElement, string>();

  constructor(host: HTMLElement) {
    this.#host = host;
  }

  get frames(): readonly HTMLElement[] {
    return this.#frames;
  }

  get layers(): readonly HTMLElement[] {
    return this.#layers;
  }

  ownsNode(node: Node): boolean {
    const element = node instanceof Element ? node : node.parentElement;
    return element?.closest('nve-scene') === this.#host;
  }

  hasInteractiveTargets(): boolean {
    return this.#layers.some(
      layer =>
        isInteractiveLayer(layer) &&
        layer.closest('[hidden]') === null &&
        isFrameChainValid(layer) &&
        isTechnicallyPickableLayer(layer)
    );
  }

  refresh(): void {
    this.#frames = [...this.#host.querySelectorAll<HTMLElement>('nve-scene-frame')].filter(
      frame => frame.closest('nve-scene') === this.#host
    );
    this.#layers = [...this.#host.querySelectorAll<HTMLElement>(RENDERABLE_LAYER_SELECTOR)].filter(
      layer => layer.closest('nve-scene') === this.#host
    );
  }

  trackChanges(): boolean {
    const framesChanged = this.#trackFrameChanges();
    return this.#trackLayerChanges() || framesChanged;
  }

  resolveFrames(): void {
    this.#updateNamedFrames();
  }

  compileRenderItems(): SceneRenderItem[] {
    return this.#layers.flatMap<SceneRenderItem>(layer => {
      if (layer.closest('[hidden]') !== null || !isFrameChainValid(layer)) return [];
      const mesh = this.#createMeshRenderItem(layer);
      if (mesh) return [mesh];
      if (isMarkerLayerRegistered(layer)) {
        return [
          {
            data: takeMarkerLayerRenderData(layer),
            frameMatrix: getOwningFrameMatrix(layer),
            interactive: isInteractiveLayer(layer),
            layer
          }
        ];
      }
      if (!isStreamingLayerRegistered(layer)) return [];
      return [createStreamRenderItem(layer)];
    });
  }

  #trackFrameChanges(): boolean {
    let changed = false;
    for (const frame of this.#frames) {
      if (!isFrameStateRegistered(frame)) continue;
      const version = getFrameVersion(frame);
      if (this.#frameVersions.get(frame) !== version) {
        this.#frameVersions.set(frame, version);
        changed = true;
      }
    }
    return changed;
  }

  // eslint-disable-next-line complexity -- One scan dispatches every supported internal layer kind.
  #trackLayerChanges(): boolean {
    let changed = false;
    for (const layer of this.#layers) {
      if (layer.matches(HEIGHTFIELD_LAYER_SELECTOR)) {
        changed = this.#trackHeightfieldLayerChange(layer) || changed;
      } else if (layer.matches(MESH_LAYER_SELECTOR)) {
        changed = this.#trackMeshLayerChange(layer) || changed;
      } else if (layer.matches(MODEL_LAYER_SELECTOR)) {
        changed = this.#trackModelLayerChange(layer) || changed;
      } else if (layer.matches(POLYGON_LAYER_SELECTOR)) {
        changed = this.#trackPolygonLayerChange(layer) || changed;
      } else if (isMarkerLayerRegistered(layer)) {
        changed = this.#trackMarkerLayerChange(layer) || changed;
      } else if (isStreamingLayerRegistered(layer)) {
        changed = this.#trackStreamingLayerChange(layer) || changed;
      }
    }
    return changed;
  }

  #trackHeightfieldLayerChange(layer: HTMLElement): boolean {
    if (!isHeightfieldLayerRegistered(layer)) return false;
    const version = getHeightfieldLayerVersion(layer);
    if (this.#heightfieldVersions.get(layer) === version) return false;
    this.#heightfieldVersions.set(layer, version);
    return true;
  }

  #trackMeshLayerChange(layer: HTMLElement): boolean {
    if (!isMeshLayerRegistered(layer)) return false;
    const version = getMeshLayerVersion(layer);
    const meshChanged = this.#meshVersions.get(layer) !== version;
    if (meshChanged) this.#meshVersions.set(layer, version);
    return (isMarkerLayerRegistered(layer) && this.#trackMarkerLayerChange(layer)) || meshChanged;
  }

  #trackModelLayerChange(layer: HTMLElement): boolean {
    if (!isModelLayerRegistered(layer)) return false;
    const version = getModelLayerVersion(layer);
    const modelChanged = this.#modelVersions.get(layer) !== version;
    if (modelChanged) this.#modelVersions.set(layer, version);
    return (isMarkerLayerRegistered(layer) && this.#trackMarkerLayerChange(layer)) || modelChanged;
  }

  #trackPolygonLayerChange(layer: HTMLElement): boolean {
    if (!isPolygonLayerRegistered(layer)) return false;
    const version = getPolygonLayerVersion(layer);
    const polygonChanged = this.#polygonVersions.get(layer) !== version;
    if (polygonChanged) this.#polygonVersions.set(layer, version);
    return (isMarkerLayerRegistered(layer) && this.#trackMarkerLayerChange(layer)) || polygonChanged;
  }

  #trackMarkerLayerChange(layer: HTMLElement): boolean {
    const version = getMarkerLayerVersion(layer);
    if (this.#layerVersions.get(layer) === version) return false;
    this.#layerVersions.set(layer, version);
    return true;
  }

  #trackStreamingLayerChange(layer: HTMLElement): boolean {
    const version = getStreamingLayerVersion(layer);
    const config = getStreamRenderConfig(layer, getStreamingLayerKind(layer));
    if (this.#layerVersions.get(layer) === version && this.#streamRenderConfig.get(layer) === config) return false;
    this.#layerVersions.set(layer, version);
    this.#streamRenderConfig.set(layer, config);
    return true;
  }

  // eslint-disable-next-line complexity -- Mesh-like layer dispatch keeps scene discovery centralized.
  #createMeshRenderItem(layer: HTMLElement): MeshRenderItem | undefined {
    if (layer.matches(HEIGHTFIELD_LAYER_SELECTOR)) {
      if (!isHeightfieldLayerRegistered(layer)) return undefined;
      return {
        data: takeHeightfieldLayerRenderData(layer),
        frameMatrix: getOwningFrameMatrix(layer),
        instances: undefined,
        interactive: isInteractiveLayer(layer),
        layer,
        type: 'mesh'
      };
    }
    if (layer.matches(MODEL_LAYER_SELECTOR)) {
      if (!isModelLayerRegistered(layer)) return undefined;
      return {
        data: takeModelLayerRenderData(layer),
        frameMatrix: getOwningFrameMatrix(layer),
        instances: isMarkerLayerRegistered(layer) ? takeMarkerLayerRenderData(layer) : undefined,
        interactive: isInteractiveLayer(layer),
        layer,
        type: 'mesh'
      };
    }
    if (layer.matches(POLYGON_LAYER_SELECTOR)) {
      if (!isPolygonLayerRegistered(layer)) return undefined;
      return {
        data: takePolygonLayerRenderData(layer),
        frameMatrix: getOwningFrameMatrix(layer),
        instances: isMarkerLayerRegistered(layer) ? takeMarkerLayerRenderData(layer) : undefined,
        interactive: isInteractiveLayer(layer),
        layer,
        type: 'mesh'
      };
    }
    if (!layer.matches(MESH_LAYER_SELECTOR)) return undefined;
    if (!isMeshLayerRegistered(layer)) return undefined;
    return {
      data: takeMeshLayerRenderData(layer),
      frameMatrix: getOwningFrameMatrix(layer),
      instances: isMarkerLayerRegistered(layer) ? takeMarkerLayerRenderData(layer) : undefined,
      interactive: isInteractiveLayer(layer),
      layer,
      type: 'mesh'
    };
  }

  #updateNamedFrames(): void {
    const { duplicates, unique } = classifyFrameNames(this.#frames.filter(isFrameStateRegistered));
    for (const frame of duplicates) {
      if (!this.#duplicateFrames.has(frame)) this.#dispatchFrameNameWarning(frame, getFrameName(frame));
    }
    this.#duplicateFrames = duplicates;
    setSceneNamedFrames(this.#host, new Map([...unique].filter(([, frame]) => isFrameChainValid(frame))));
  }

  #dispatchFrameNameWarning(frame: HTMLElement, name: string): void {
    const detail: SceneErrorDetail = {
      code: FRAME_NAME_DUPLICATE,
      message: `More than one scene frame uses the name "${name}".`,
      element: frame,
      severity: 'warning'
    };
    console.warn(`[${detail.code}] ${detail.message}`, frame);
    frame.dispatchEvent(
      new CustomEvent<SceneErrorDetail>('nve-scene-error', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail
      })
    );
  }
}

function createStreamRenderItem(layer: HTMLElement): SceneRenderItem {
  const data = takeStreamingLayerRenderData(layer);
  const frameMatrix = getOwningFrameMatrix(layer);
  const interactive = isInteractiveLayer(layer);
  if (data.kind === 'point') {
    return {
      data,
      frameMatrix,
      interactive,
      layer,
      size: getLayerNumber(layer, 'size', 3),
      sizeUnit: Reflect.get(layer, 'sizeUnit') === 'world' ? 'world' : 'pixel',
      type: 'point'
    };
  }
  if (data.kind === 'line') {
    return { data, frameMatrix, interactive, layer, topology: data.topology, type: 'line', widthUnit: data.widthUnit };
  }
  return { data, frameMatrix, interactive, layer, type: 'triangle' };
}

function isTechnicallyPickableLayer(layer: HTMLElement): boolean {
  if (layer.matches(HEIGHTFIELD_LAYER_SELECTOR)) return isHeightfieldLayerRegistered(layer);
  if (layer.matches(MESH_LAYER_SELECTOR)) return isMeshLayerRegistered(layer);
  if (layer.matches(MODEL_LAYER_SELECTOR)) return isModelLayerRegistered(layer);
  if (layer.matches(POLYGON_LAYER_SELECTOR)) return isPolygonLayerRegistered(layer);
  return isMarkerLayerRegistered(layer) || isStreamingLayerRegistered(layer);
}

function classifyFrameNames(frames: readonly HTMLElement[]): {
  duplicates: Set<HTMLElement>;
  unique: Map<string, HTMLElement>;
} {
  const framesByName = new Map<string, HTMLElement[]>();
  for (const frame of frames) {
    const name = getFrameName(frame);
    if (name) framesByName.set(name, [...(framesByName.get(name) ?? []), frame]);
  }
  const duplicates = new Set<HTMLElement>();
  const unique = new Map<string, HTMLElement>();
  for (const [name, namedFrames] of framesByName) {
    if (namedFrames.length === 1 && namedFrames[0]) unique.set(name, namedFrames[0]);
    else namedFrames.forEach(frame => duplicates.add(frame));
  }
  return { duplicates, unique };
}

function getOwningFrameMatrix(layer: HTMLElement): Float32Array {
  const frame = layer.closest<HTMLElement>('nve-scene-frame');
  return frame ? getFrameWorldMatrix(frame) : identityMat4();
}

function getLayerNumber(layer: HTMLElement, name: 'size', fallback: number): number {
  const value = Reflect.get(layer, name);
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function getStreamRenderConfig(layer: HTMLElement, kind: StreamingLayerRenderData['kind']): string {
  if (kind === 'point') return `${String(getLayerNumber(layer, 'size', 3))}:${String(Reflect.get(layer, 'sizeUnit'))}`;
  if (kind === 'line') return `${String(Reflect.get(layer, 'topology'))}:${String(Reflect.get(layer, 'widthUnit'))}`;
  return '';
}
