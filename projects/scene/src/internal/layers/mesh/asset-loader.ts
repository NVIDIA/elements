// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MESH_SRC } from '../../diagnostics/errors.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import { loadGeometry } from '../body/load.js';
import type { SceneBodyGeometry } from '../body/types.js';
import type { SceneMeshGeometry } from './types.js';

interface AssetHost extends HTMLElement {
  requestUpdate(name?: string, previous?: unknown): void;
}

/** Owns bounded file requests and capture independently of the selected geometry format. */
export class MeshAssetLoader {
  readonly #host: AssetHost;
  readonly #apply: (geometry: SceneMeshGeometry | null) => void;
  #src = '';
  #request?: AssetRequest;
  #loadComplete: Promise<void> = Promise.resolve();
  #loaded = false;

  /** apply installs decoded geometry, or null while a file is pending, failed, or cleared. */
  constructor(host: AssetHost, apply: (geometry: SceneMeshGeometry | null) => void) {
    this.#host = host;
    this.#apply = apply;
  }

  get src(): string {
    return this.#src;
  }

  set src(value: string) {
    const next = value ?? '';
    if (typeof next !== 'string') throw new TypeError('Mesh src must be a URL string.');
    const previous = this.#src;
    if (next === previous) return;
    this.#cancel();
    this.#src = next;
    this.#loaded = false;
    this.#updateError(false);
    this.#apply(null);
    if (next) this.#queue();
    else this.#loadComplete = Promise.resolve();
    this.#host.requestUpdate('src', previous);
  }

  get loadComplete(): Promise<void> {
    return this.#loadComplete;
  }

  geometryAssigned(): void {
    this.#cancel();
    const previous = this.#src;
    this.#src = '';
    this.#loaded = false;
    this.#loadComplete = Promise.resolve();
    this.#updateError(false);
    this.#host.requestUpdate('src', previous);
  }

  connect(): void {
    if (this.#src && !this.#loaded && !this.#request) this.#queue();
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
      const geometry = await loadGeometry(resolveMeshSrc(this.#src, this.#host.baseURI), { signal });
      if (this.#request !== request) return;
      this.#apply(toMeshGeometry(geometry));
      this.#request = undefined;
      this.#loaded = true;
      request.resolve();
    } catch (error) {
      if (this.#request !== request) return;
      this.#request = undefined;
      this.#updateError(
        true,
        `Unable to load mesh src "${this.#src}": ${error instanceof Error ? error.message : String(error)}`
      );
      request.reject(error);
    }
  }

  #cancel(): void {
    const request = this.#request;
    if (!request) return;
    this.#request = undefined;
    const error = new DOMException('Mesh load cancelled.', 'AbortError');
    request.controller.abort(error);
    request.reject(error);
  }

  #updateError(active: boolean, message = ''): void {
    diagnosticReporterService.update({ active, code: MESH_SRC, element: this.#host, message, severity: 'error' });
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

/** Accepts decoder output that is one triangle set; hierarchies need the body compiler that mesh pages omit. */
function toMeshGeometry(nodes: SceneBodyGeometry): SceneMeshGeometry | null {
  if (nodes.length === 0) return null;
  const [node] = nodes;
  if (nodes.length === 1 && node?.geometry && isUntransformed(node) && node.color === undefined) return node.geometry;
  throw new TypeError(
    'Mesh src must decode to one untransformed triangle mesh; assign loadGeometry() results to body geometry for hierarchies.'
  );
}

function isUntransformed(node: SceneBodyGeometry[number]): boolean {
  return node.position === undefined && node.orientation === undefined && node.scale === undefined;
}

/** Resolves the request URL while retaining the decoder's original sub-asset fragment. */
function resolveMeshSrc(src: string, baseURI: string): string {
  const url = new URL(src, baseURI);
  const hash = src.indexOf('#');
  url.hash = '';
  return url.href + (hash < 0 ? '' : src.slice(hash));
}
