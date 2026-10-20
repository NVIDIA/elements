// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { captureGeometryBytes, fetchGeometryBytes } from './fetch.js';
import { getGeometryDecoder, inferGeometryFormat, type SceneGeometryFormat } from './decoders.js';
import type { SceneBodyGeometry } from './types.js';

/** File decoding options shared by loading helpers. */
export interface DecodeGeometryOptions {
  readonly format: SceneGeometryFormat;
  readonly signal?: AbortSignal;
  /** Sub-asset fragment passed unchanged to the decoder. */
  readonly fragment?: string;
}

/** Geometry file loading options. An omitted format uses the URL extension. */
export interface LoadGeometryOptions {
  readonly format?: SceneGeometryFormat;
  readonly signal?: AbortSignal;
}

/** Decodes captured bytes without changing their coordinates or units. */
export async function decodeGeometry(
  bytes: ArrayBuffer | ArrayBufferView,
  options: DecodeGeometryOptions
): Promise<SceneBodyGeometry> {
  options.signal?.throwIfAborted();
  const loader = getGeometryDecoder(options.format);
  const captured = captureGeometryBytes(bytes, options.signal);
  const { decode } = await loader();
  options.signal?.throwIfAborted();
  const geometry = await decode(captured, { fragment: options.fragment ?? '', signal: options.signal });
  options.signal?.throwIfAborted();
  return geometry;
}

/** Fetches and decodes a geometry file independently of any scene element. */
export async function loadGeometry(url: string | URL, options: LoadGeometryOptions = {}): Promise<SceneBodyGeometry> {
  options.signal?.throwIfAborted();
  const format = options.format ?? inferGeometryFormat(url);
  getGeometryDecoder(format);
  const text = String(url);
  const hash = text.indexOf('#');
  const fragment = hash < 0 ? '' : text.slice(hash);
  const bytes = await fetchGeometryBytes(url, options.signal);
  return decodeGeometry(bytes, { format, fragment, signal: options.signal });
}
