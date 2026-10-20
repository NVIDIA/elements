// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BODY_SRC } from '../../diagnostics/errors.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import { loadGeometry } from './load.js';
import { beginBodyLayerAsset, failBodyLayerAsset, getBodyLayerGeometry, setBodyLayerGeometry } from './layer-state.js';

interface AssetHost extends HTMLElement {
  requestUpdate(name?: string, previous?: unknown): void;
}

/** Owns bounded file requests and capture independently of the selected geometry format. */
export class BodyAssetLoader {
  readonly #host: AssetHost;
  #src = '';
  #request?: AssetRequest;
  #loadComplete: Promise<void> = Promise.resolve();

  constructor(host: AssetHost) {
    this.#host = host;
  }

  get src(): string {
    return this.#src;
  }

  set src(value: string) {
    const next = value ?? '';
    if (typeof next !== 'string') throw new TypeError('Body src must be a URL string.');
    const previous = this.#src;
    if (next === previous) return;
    this.#cancel();
    this.#src = next;
    this.#updateError(false);
    if (next) {
      beginBodyLayerAsset(this.#host);
      this.#queue();
    } else {
      setBodyLayerGeometry(this.#host, null);
      this.#loadComplete = Promise.resolve();
    }
    this.#host.requestUpdate('src', previous);
  }

  get loadComplete(): Promise<void> {
    return this.#loadComplete;
  }

  geometryAssigned(): void {
    this.#cancel();
    const previous = this.#src;
    this.#src = '';
    this.#loadComplete = Promise.resolve();
    this.#updateError(false);
    this.#host.requestUpdate('src', previous);
  }

  connect(): void {
    if (this.#src && getBodyLayerGeometry(this.#host) === null && !this.#request) this.#queue();
    this.#start();
  }

  disconnect(): void {
    this.#cancel();
  }

  #queue(): void {
    const request = createAssetRequest();
    this.#request = request;
    this.#loadComplete = request.promise;
    // Declarative consumers may rely on diagnostics without awaiting the promise.
    void request.promise.catch(() => {});
    this.#start();
  }

  #start(): void {
    const request = this.#request;
    if (!this.#host.isConnected || !request || request.started) return;
    request.started = true;
    void this.#load(request);
  }

  async #load(request: AssetRequest): Promise<void> {
    try {
      const signal = request.controller.signal;
      const geometry = await loadGeometry(resolveBodySrc(this.#src, this.#host.baseURI), { signal });
      if (this.#request !== request) return;
      setBodyLayerGeometry(this.#host, geometry, 'asset');
      this.#request = undefined;
      this.#host.requestUpdate('geometry');
      request.resolve();
    } catch (error) {
      if (this.#request !== request) return;
      this.#request = undefined;
      failBodyLayerAsset(this.#host);
      this.#updateError(
        true,
        `Unable to load body src "${this.#src}": ${error instanceof Error ? error.message : String(error)}`
      );
      request.reject(error);
    }
  }

  #cancel(): void {
    const request = this.#request;
    if (!request) return;
    this.#request = undefined;
    const error = new DOMException('Body load cancelled.', 'AbortError');
    request.controller.abort(error);
    request.reject(error);
  }

  #updateError(active: boolean, message = ''): void {
    diagnosticReporterService.update({ active, code: BODY_SRC, element: this.#host, message, severity: 'error' });
  }
}

interface AssetRequest {
  readonly controller: AbortController;
  readonly promise: Promise<void>;
  readonly resolve: () => void;
  readonly reject: (reason: unknown) => void;
  started: boolean;
}

function createAssetRequest(): AssetRequest {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { controller: new AbortController(), promise, resolve, reject, started: false };
}

/** Resolves the request URL while retaining the decoder's original sub-asset fragment. */
function resolveBodySrc(src: string, baseURI: string): string {
  const url = new URL(src, baseURI);
  const hash = src.indexOf('#');
  url.hash = '';
  return url.href + (hash < 0 ? '' : src.slice(hash));
}
