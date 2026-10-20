// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MAX_GEOMETRY_BYTES } from './limits.js';

/** Captures only the selected byte range before asynchronous decoding. */
export function captureGeometryBytes(
  bytes: ArrayBuffer | ArrayBufferView,
  signal?: AbortSignal
): Uint8Array<ArrayBuffer> {
  signal?.throwIfAborted();
  if (!(bytes instanceof ArrayBuffer) && !ArrayBuffer.isView(bytes))
    throw new TypeError('body bytes must be an ArrayBuffer or a byte view.');
  if (bytes.byteLength > MAX_GEOMETRY_BYTES) throw new RangeError('body file exceeds the byte limit.');
  return bytes instanceof ArrayBuffer
    ? new Uint8Array(bytes).slice()
    : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength).slice();
}

/** Fetches one bounded file without selecting or importing a decoder. */
export async function fetchGeometryBytes(url: string | URL, signal?: AbortSignal): Promise<Uint8Array<ArrayBuffer>> {
  signal?.throwIfAborted();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`body request failed: ${response.status}.`);
  return readGeometryResponse(response, signal);
}

async function readGeometryResponse(response: Response, signal?: AbortSignal): Promise<Uint8Array<ArrayBuffer>> {
  if (Number(response.headers.get('content-length')) > MAX_GEOMETRY_BYTES) {
    await response.body?.cancel();
    throw new RangeError('body file exceeds the byte limit.');
  }
  if (!response.body) throw new Error('body response has no body.');
  const reader = response.body.getReader();
  try {
    const { chunks, size } = await readChunks(reader, signal);
    return concatenateChunks(chunks, size);
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
}

async function readChunks(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal?: AbortSignal
): Promise<{ chunks: Uint8Array[]; size: number }> {
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    signal?.throwIfAborted();
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_GEOMETRY_BYTES) throw new RangeError('body file exceeds the byte limit.');
    chunks.push(value);
  }
  return { chunks, size };
}

function concatenateChunks(chunks: readonly Uint8Array[], size: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
