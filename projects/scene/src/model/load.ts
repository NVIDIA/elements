// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MAX_MODEL_BYTES } from '../internal/layers/model/limits.js';
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
  if (!(bytes instanceof ArrayBuffer) && !ArrayBuffer.isView(bytes))
    throw new TypeError('Model bytes must be an ArrayBuffer or a byte view.');
  if (bytes.byteLength > MAX_MODEL_BYTES) throw new RangeError('Model file exceeds the byte limit.');
  const captured =
    bytes instanceof ArrayBuffer
      ? new Uint8Array(bytes).slice()
      : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength).slice();
  const { decodeStl } = await import('../internal/layers/model/stl.js');
  options.signal?.throwIfAborted();
  return decodeStl(captured, options.signal);
}

/** Fetches and decodes a model file independently of any scene element. */
export async function loadModel(url: string | URL, options: LoadModelOptions = {}): Promise<SceneModelGeometry> {
  options.signal?.throwIfAborted();
  const format = options.format ?? inferFormat(url);
  checkFormat(format);
  const response = await fetch(url, { signal: options.signal });
  if (!response.ok) throw new Error(`Model request failed: ${response.status}.`);
  const bytes = await readModelResponse(response, options.signal);
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

// eslint-disable-next-line max-statements -- Streaming bounds and cancellation cleanup precede the single output allocation.
async function readModelResponse(response: Response, signal?: AbortSignal): Promise<Uint8Array> {
  if (Number(response.headers.get('content-length')) > MAX_MODEL_BYTES) {
    await response.body?.cancel();
    throw new RangeError('Model file exceeds the byte limit.');
  }
  if (!response.body) throw new Error('Model response has no body.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_MODEL_BYTES) throw new RangeError('Model file exceeds the byte limit.');
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
