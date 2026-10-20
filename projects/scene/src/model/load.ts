// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { captureModelBytes, fetchModelBytes } from '../internal/layers/model/fetch.js';
import type { SceneModelGeometry } from '../internal/layers/model/types.js';

/** Built-in file formats supported by the model loaders. */
export type SceneModelFormat = 'stl';

/** File decoding options shared by loading helpers. */
export interface DecodeModelOptions {
  readonly format: SceneModelFormat;
  readonly signal?: AbortSignal;
}

/** Model file loading options. An omitted format uses the URL extension. */
export interface LoadModelOptions {
  readonly format?: SceneModelFormat;
  readonly signal?: AbortSignal;
}

/** Decodes captured bytes without changing their coordinates or units. */
export async function decodeModel(
  bytes: ArrayBuffer | ArrayBufferView,
  options: DecodeModelOptions
): Promise<SceneModelGeometry> {
  options.signal?.throwIfAborted();
  checkFormat(options.format);
  const captured = captureModelBytes(bytes, options.signal);
  const { decodeStl } = await import('../internal/layers/model/stl/stl.js');
  options.signal?.throwIfAborted();
  return decodeStl(captured, options.signal);
}

/** Fetches and decodes a model file independently of any scene element. */
export async function loadModel(url: string | URL, options: LoadModelOptions = {}): Promise<SceneModelGeometry> {
  options.signal?.throwIfAborted();
  const format = options.format ?? inferFormat(url);
  checkFormat(format);
  const bytes = await fetchModelBytes(url, options.signal);
  return decodeModel(bytes, { format, signal: options.signal });
}

function inferFormat(url: string | URL): SceneModelFormat {
  const path = String(url).split(/[?#]/, 1)[0] ?? '';
  const extension = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  checkFormat(extension);
  return extension;
}

function checkFormat(format: string): asserts format is SceneModelFormat {
  if (format !== 'stl')
    throw new TypeError('Unsupported model format. Specify format="stl" for URLs without a known extension.');
}
