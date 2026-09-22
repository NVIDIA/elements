// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { isServer } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { MarkerLayerElement } from '../internal/layers/markers/layer-element.js';
import { MarkerBuffer, type MarkerInit, type MarkerSource } from '../internal/layers/markers/buffer.js';
import {
  connectModelLayer,
  disconnectModelLayer,
  registerModelLayer,
  setModelLayerGeometry,
  getModelLayerGeometry,
  beginModelLayerAsset,
  failModelLayerAsset,
  setModelLayerTint
} from '../internal/layers/model/layer-state.js';
import { MARKER } from '../internal/records/layouts/built-ins.js';
import type { SceneModelGeometry } from '../internal/layers/model/types.js';
import { loadModel, type SceneModelFormat } from './load.js';
import { MODEL_ASSET } from '../internal/diagnostics/errors.js';
import { diagnosticReporterService } from '../internal/diagnostics/reporter.service.js';
import {
  getElementFeatureId,
  registerElementFeatureId,
  sceneFeatureIdConverter,
  setElementFeatureId
} from '../internal/interaction/element-feature-id.js';
import styles from '../internal/dom/host.css?inline';

export type ModelInstanceSource = MarkerSource;

/**
 * @element nve-scene-model
 * @description Shared model geometry loaded from a file or authored as nodes and placed by source records.
 * @slot - Contains direct scene part children that define model geometry.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/model
 * @stable false
 */
export class SceneModel extends MarkerLayerElement<ModelInstanceSource, MarkerInit> {
  static styles = useStyles([styles]);
  static readonly layout = MARKER;
  static readonly metadata = { tag: 'nve-scene-model', version: '0.0.0' };

  #asset = '';
  #format: SceneModelFormat | undefined;
  #tint = '#ffffff';
  #request?: ModelLoadRequest;
  #loadComplete: Promise<void> = Promise.resolve();

  /** File URL. A nonempty value selects file loading instead of authored geometry. */
  @property({
    type: String,
    reflect: true,
    converter: { fromAttribute: (value: string | null) => value ?? '', toAttribute: (value: string) => value || null }
  })
  get asset(): string {
    return this.#asset;
  }

  set asset(value: string) {
    const next = value ?? '';
    if (typeof next !== 'string') throw new TypeError('Model asset must be a URL string.');
    const previous = this.#asset;
    if (next === previous) return;
    this.#cancelLoad();
    this.#asset = next;
    this.#updateAssetError(false);
    if (next) {
      beginModelLayerAsset(this);
      this.#queueLoad();
    } else {
      setModelLayerGeometry(this, null);
      this.#loadComplete = Promise.resolve();
    }
    this.requestUpdate('asset', previous);
  }

  /** Optional file format; an omitted value uses the URL extension. */
  @property({ type: String })
  get format(): SceneModelFormat | undefined {
    return this.#format;
  }

  set format(value: SceneModelFormat | undefined) {
    const next = value || undefined;
    const previous = this.#format;
    if (next === previous) return;
    this.#format = next;
    if (this.#asset) {
      this.#cancelLoad();
      this.#updateAssetError(false);
      beginModelLayerAsset(this);
      this.#queueLoad();
    }
    this.requestUpdate('format', previous);
  }

  /** CSS color multiplier. White preserves node colors and texture samples. */
  @property({ type: String })
  get tint(): string {
    return this.#tint;
  }

  set tint(value: string) {
    const next = value ?? '#ffffff';
    if (!isServer) setModelLayerTint(this, next);
    const previous = this.#tint;
    this.#tint = next;
    this.requestUpdate('tint', previous);
  }

  /** Current file request; resolves after geometry capture, before GPU presentation. */
  get loadComplete(): Promise<void> {
    return this.#loadComplete;
  }

  /** Stable application identity returned when picking the uninstanced model. */
  @property({ attribute: 'feature-id', converter: sceneFeatureIdConverter })
  get featureId(): number | undefined {
    return getElementFeatureId(this);
  }

  set featureId(value: number | undefined) {
    setElementFeatureId(this, value);
  }

  /**
   * Current resolved model nodes from files, direct assignment, or part children.
   * Assignment captures arrays and transforms, cancels file loading, and clears asset.
   * In-place edits take effect only after reassignment. Null restores part children.
   * Use source records or frames for per-frame movement instead of rebuilding geometry.
   */
  @property({ attribute: false })
  get geometry(): SceneModelGeometry | null {
    return getModelLayerGeometry(this);
  }

  set geometry(value: SceneModelGeometry | null) {
    const previous = this.geometry;
    setModelLayerGeometry(this, value);
    this.#cancelLoad();
    const previousAsset = this.#asset;
    this.#asset = '';
    this.#loadComplete = Promise.resolve();
    this.#updateAssetError(false);
    this.requestUpdate('asset', previousAsset);
    this.requestUpdate('geometry', previous);
  }

  constructor() {
    super('cube', { create: records => new MarkerBuffer({ records }), kind: 'marker' });
    registerElementFeatureId(this);
    registerModelLayer(this);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectModelLayer(this);
    if (this.#asset && this.geometry === null && !this.#request) this.#queueLoad();
    this.#startLoad();
  }

  override disconnectedCallback(): void {
    this.#cancelLoad();
    disconnectModelLayer(this);
    super.disconnectedCallback();
  }

  #queueLoad(): void {
    const request = createLoadRequest();
    this.#request = request;
    this.#loadComplete = request.promise;
    // Declarative consumers may rely on diagnostics without awaiting the promise.
    void request.promise.catch(() => {});
    this.#startLoad();
  }

  #startLoad(): void {
    const request = this.#request;
    if (!this.isConnected || !request || request.started) return;
    request.started = true;
    void this.#loadAsset(request);
  }

  async #loadAsset(request: ModelLoadRequest): Promise<void> {
    try {
      const geometry = await loadModel(new URL(this.#asset, this.baseURI), {
        format: this.#format,
        signal: request.controller.signal
      });
      if (this.#request !== request) return;
      setModelLayerGeometry(this, geometry, 'asset');
      this.#request = undefined;
      this.requestUpdate('geometry');
      request.resolve();
    } catch (error) {
      if (this.#request !== request) return;
      this.#request = undefined;
      failModelLayerAsset(this);
      this.#updateAssetError(true, error instanceof Error ? error.message : String(error));
      request.reject(error);
    }
  }

  #cancelLoad(): void {
    const request = this.#request;
    if (!request) return;
    this.#request = undefined;
    const error = new DOMException('Model load cancelled.', 'AbortError');
    request.controller.abort(error);
    request.reject(error);
  }

  #updateAssetError(active: boolean, message = ''): void {
    diagnosticReporterService.update({ active, code: MODEL_ASSET, element: this, message, severity: 'error' });
  }
}

interface ModelLoadRequest {
  readonly controller: AbortController;
  readonly promise: Promise<void>;
  readonly resolve: () => void;
  readonly reject: (reason: unknown) => void;
  started: boolean;
}

function createLoadRequest(): ModelLoadRequest {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { controller: new AbortController(), promise, resolve, reject, started: false };
}
