// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateFrameRegistry } from '../frame/registry.js';
import { refreshSceneJoints } from '../joint/state.js';
import {
  FrameEvaluation,
  FRAME_SELECTOR,
  getFrameReference,
  hasSceneFrameReferences,
  resolveSceneFrameReferences,
  isFrameStateRegistered
} from '../frame/state.js';
import type { SceneRenderItem } from '../../rendering/render-items.js';
import { isInteractiveLayer } from '../../interaction/target.js';
import { SCENE_LAYER_SELECTOR } from '../../layers/registry.js';
import { getGridlinesStyleSampler } from '../../layers/gridlines.js';
import {
  createSceneLayerRenderItem,
  isTechnicallyPickableLayer,
  resolveSceneLayer,
  type SceneLayerRecord
} from './layer-record.js';

export class SceneContent {
  #compositionDirty = true;
  #frames: HTMLElement[] = [];
  #joints: HTMLElement[] = [];
  #scoped = false;
  readonly #host: HTMLElement;
  #layerIndexes = new Map<HTMLElement, number>();
  #layerRecords: SceneLayerRecord[] = [];
  readonly #styleSamplers = new Map<HTMLElement, () => void>();

  constructor(host: HTMLElement) {
    this.#host = host;
  }

  ownsNode(node: Node): boolean {
    const element = node instanceof Element ? node : node.parentElement;
    return element?.closest('nve-scene') === this.#host;
  }

  hasInteractiveTargets(): boolean {
    const frames = new FrameEvaluation(this.#host);
    return this.#layerRecords.some(
      record =>
        isInteractiveLayer(record.layer) &&
        frames.isVisible(record.layer) &&
        frames.isValid(record.layer) &&
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
    this.#layerIndexes = new Map(this.#layerRecords.map((record, index) => [record.layer, index]));
    this.#styleSamplers.clear();
    for (const record of this.#layerRecords) this.#refreshStyleSampler(record.layer);
    this.#compositionDirty = true;
  }

  refreshLayer(element: HTMLElement): void {
    const layer = element.matches(SCENE_LAYER_SELECTOR) ? element : element.closest<HTMLElement>(SCENE_LAYER_SELECTOR);
    if (!layer || layer.closest('nve-scene') !== this.#host) return;
    const index = this.#layerIndexes.get(layer);
    if (index === undefined) return;
    const record = resolveSceneLayer(layer);
    if (record) this.#layerRecords[index] = record;
    this.#refreshStyleSampler(layer);
  }

  /** Samples only style-driven layers so inherited theme and stylesheet edits can request a render. */
  sampleStyles(): void {
    for (const sample of this.#styleSamplers.values()) sample();
  }

  get hasStyleSamplers(): boolean {
    return this.#styleSamplers.size > 0;
  }

  #refreshStyleSampler(layer: HTMLElement): void {
    const sample = getGridlinesStyleSampler(layer);
    if (sample) this.#styleSamplers.set(layer, sample);
    else this.#styleSamplers.delete(layer);
  }

  /** Defers name, joint, and reference resolution to the next render. */
  invalidateComposition(): void {
    this.#compositionDirty = true;
  }

  /** Keeps CPU references usable even before a GPU renderer becomes available. */
  resolveReferences(): void {
    this.#compositionDirty = true;
    if (
      this.#joints.length > 0 ||
      this.#scoped ||
      hasSceneFrameReferences(this.#host) ||
      this.#frames.some(frame => getFrameReference(frame)?.trim()) ||
      this.#layerRecords.some(record => getFrameReference(record.layer)?.trim())
    )
      this.resolveFrames();
  }

  /** Poses never change names, references, or connections, so animation frames skip resolution. */
  resolveFrames(): void {
    if (!this.#compositionDirty) return;
    // Clear first so invalidations raised while resolving schedule one more pass.
    this.#compositionDirty = false;
    try {
      this.#updateNamedFrames();
    } catch (error) {
      this.#compositionDirty = true;
      throw error;
    }
  }

  compileRenderItems(): SceneRenderItem[] {
    const frames = new FrameEvaluation(this.#host);
    return this.#layerRecords.flatMap<SceneRenderItem>(record => {
      if (record.status === 'pending' || !frames.isVisible(record.layer)) return [];
      const frameMatrix = frames.getWorldMatrix(record.layer);
      if (!frameMatrix) return [];
      const item = createSceneLayerRenderItem(record, frameMatrix);
      return item ? [item] : [];
    });
  }

  #updateNamedFrames(): void {
    updateFrameRegistry(this.#host, this.#frames.filter(isFrameStateRegistered), [
      ...this.#frames,
      ...this.#layerRecords.map(record => record.layer),
      ...(this.#scoped
        ? [...this.#host.querySelectorAll<HTMLElement>('nve-scene-camera')].filter(
            camera => camera.closest('nve-scene') === this.#host
          )
        : [])
    ]);
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
