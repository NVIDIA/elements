// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateFrameRegistry } from '../frame/registry.js';
import { refreshSceneJoints } from '../joint/state.js';
import {
  FrameEvaluation,
  FRAME_SELECTOR,
  isFrameChainValid,
  isFrameChainVisible,
  getFrameReference,
  hasSceneFrameReferences,
  resolveSceneFrameReferences,
  isFrameStateRegistered
} from '../frame/state.js';
import type { SceneRenderItem } from '../../rendering/render-items.js';
import { isInteractiveLayer } from '../../interaction/target.js';
import { SCENE_LAYER_SELECTOR } from '../../layers/registry.js';
import {
  createSceneLayerRenderItem,
  isTechnicallyPickableLayer,
  resolveSceneLayer,
  type SceneLayerRecord
} from './layer-record.js';

export class SceneContent {
  #frames: HTMLElement[] = [];
  #joints: HTMLElement[] = [];
  #scoped = false;
  readonly #host: HTMLElement;
  #layerRecords: SceneLayerRecord[] = [];

  constructor(host: HTMLElement) {
    this.#host = host;
  }

  ownsNode(node: Node): boolean {
    const element = node instanceof Element ? node : node.parentElement;
    return element?.closest('nve-scene') === this.#host;
  }

  hasInteractiveTargets(): boolean {
    const referenced = hasSceneFrameReferences(this.#host);
    return this.#layerRecords.some(
      record =>
        isInteractiveLayer(record.layer) &&
        (referenced ? isFrameChainVisible(record.layer) : record.layer.closest('[hidden]') === null) &&
        isFrameChainValid(record.layer) &&
        isTechnicallyPickableLayer(record)
    );
  }

  refresh(): void {
    this.#frames = [...this.#host.querySelectorAll<HTMLElement>(FRAME_SELECTOR)].filter(
      frame => frame.closest('nve-scene') === this.#host
    );
    this.#joints = this.#frames.filter(frame => frame.localName === 'nve-scene-joint');
    this.#scoped = this.#frames.some(frame => frame.localName === 'nve-scene-model');
    const layers = [...this.#host.querySelectorAll<HTMLElement>(SCENE_LAYER_SELECTOR)].filter(
      layer => layer.closest('nve-scene') === this.#host
    );
    this.#layerRecords = layers.flatMap(layer => {
      const record = resolveSceneLayer(layer);
      return record ? [record] : [];
    });
  }

  refreshLayer(element: HTMLElement): void {
    const layer = element.matches(SCENE_LAYER_SELECTOR) ? element : element.closest<HTMLElement>(SCENE_LAYER_SELECTOR);
    if (!layer || layer.closest('nve-scene') !== this.#host) return;
    const index = this.#layerRecords.findIndex(record => record.layer === layer);
    if (index < 0) return;
    const record = resolveSceneLayer(layer);
    if (record) this.#layerRecords[index] = record;
  }

  /** Keeps CPU references usable even before a GPU renderer becomes available. */
  resolveReferences(): void {
    if (
      this.#joints.length > 0 ||
      this.#scoped ||
      hasSceneFrameReferences(this.#host) ||
      this.#frames.some(frame => getFrameReference(frame)?.trim()) ||
      this.#layerRecords.some(record => getFrameReference(record.layer)?.trim())
    )
      this.resolveFrames();
  }

  resolveFrames(): void {
    this.#updateNamedFrames();
  }

  compileRenderItems(): SceneRenderItem[] {
    const frames = new FrameEvaluation(this.#host);
    const referenced = hasSceneFrameReferences(this.#host);
    return this.#layerRecords.flatMap<SceneRenderItem>(record => {
      if (
        record.status === 'pending' ||
        (referenced ? !isFrameChainVisible(record.layer) : record.layer.closest('[hidden]') !== null)
      )
        return [];
      const frameMatrix = frames.getWorldMatrix(record.layer);
      if (!frameMatrix) return [];
      const item = createSceneLayerRenderItem(record, frameMatrix);
      return item ? [item] : [];
    });
  }

  #updateNamedFrames(): void {
    updateFrameRegistry(
      this.#host,
      [
        ...this.#frames.filter(isFrameStateRegistered),
        ...this.#layerRecords.filter(record => record.kind === 'body').map(record => record.layer)
      ],
      [
        ...this.#frames,
        ...this.#layerRecords.map(record => record.layer),
        ...(this.#scoped
          ? [...this.#host.querySelectorAll<HTMLElement>('nve-scene-camera')].filter(
              camera => camera.closest('nve-scene') === this.#host
            )
          : [])
      ]
    );
    this.#resolveDependencies();
  }

  #resolveDependencies(): void {
    if (this.#joints.length) refreshSceneJoints(this.#host, this.#joints);
    resolveSceneFrameReferences(
      this.#host,
      this.#frames,
      this.#layerRecords.map(record => record.layer)
    );
  }
}
