// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FRAME_NAME_DUPLICATE } from '../../errors.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import {
  getFrameName,
  getFrameVersion,
  isFrameChainValid,
  isFrameStateRegistered,
  setSceneNamedFrames
} from '../frame/state.js';
import type { SceneRenderItem } from '../rendering/render-items.js';
import { isInteractiveLayer } from '../interaction.js';
import { SCENE_LAYER_SELECTOR } from '../layer-tags.js';
import {
  createSceneLayerRenderItem,
  isTechnicallyPickableLayer,
  resolveSceneLayer,
  trackSceneLayerChanges,
  type SceneLayerRecord
} from './layer-record.js';

export class SceneContent {
  #duplicateFrames = new Set<HTMLElement>();
  readonly #duplicateFrameEpisodes = new WeakMap<HTMLElement, DiagnosticEpisodes>();
  #frames: HTMLElement[] = [];
  #frameVersions = new WeakMap<HTMLElement, number>();
  readonly #host: HTMLElement;
  #layers: HTMLElement[] = [];
  #layerRecords: SceneLayerRecord[] = [];

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
    return this.#layerRecords.some(
      record =>
        isInteractiveLayer(record.layer) &&
        record.layer.closest('[hidden]') === null &&
        isFrameChainValid(record.layer) &&
        isTechnicallyPickableLayer(record)
    );
  }

  refresh(): void {
    this.#frames = [...this.#host.querySelectorAll<HTMLElement>('nve-scene-frame')].filter(
      frame => frame.closest('nve-scene') === this.#host
    );
    this.#layers = [...this.#host.querySelectorAll<HTMLElement>(SCENE_LAYER_SELECTOR)].filter(
      layer => layer.closest('nve-scene') === this.#host
    );
    this.#layerRecords = this.#layers.flatMap(layer => {
      const record = resolveSceneLayer(layer);
      return record ? [record] : [];
    });
  }

  trackChanges(): boolean {
    const framesChanged = this.#trackFrameChanges();
    return this.#trackLayerChanges() || framesChanged;
  }

  resolveFrames(): void {
    this.#updateNamedFrames();
  }

  compileRenderItems(): SceneRenderItem[] {
    return this.#layerRecords.flatMap<SceneRenderItem>(record => {
      if (record.layer.closest('[hidden]') !== null || !isFrameChainValid(record.layer)) return [];
      const item = createSceneLayerRenderItem(record);
      return item ? [item] : [];
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

  #trackLayerChanges(): boolean {
    let changed = false;
    for (let index = 0; index < this.#layerRecords.length; index += 1) {
      const record = this.#layerRecords[index]!;
      const next = resolveSceneLayer(record.layer);
      if (!next) continue;
      if (next.kind !== record.kind || next.status !== record.status) {
        this.#layerRecords[index] = next;
        changed = true;
      }
      changed = trackSceneLayerChanges(this.#layerRecords[index]!) || changed;
    }
    return changed;
  }

  #updateNamedFrames(): void {
    const { duplicates, unique } = classifyFrameNames(this.#frames.filter(isFrameStateRegistered));
    for (const frame of this.#duplicateFrames) {
      if (!duplicates.has(frame)) this.#updateDuplicateFrameEpisode(frame, false);
    }
    for (const frame of duplicates) this.#updateDuplicateFrameEpisode(frame, true);
    this.#duplicateFrames = duplicates;
    setSceneNamedFrames(this.#host, new Map([...unique].filter(([, frame]) => isFrameChainValid(frame))));
  }

  #updateDuplicateFrameEpisode(frame: HTMLElement, active: boolean): void {
    let episodes = this.#duplicateFrameEpisodes.get(frame);
    if (!episodes) {
      episodes = new DiagnosticEpisodes();
      this.#duplicateFrameEpisodes.set(frame, episodes);
    }
    episodes.update({
      active,
      code: FRAME_NAME_DUPLICATE,
      element: frame,
      message: `More than one scene frame uses the name "${getFrameName(frame)}".`,
      severity: 'warning'
    });
  }
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
