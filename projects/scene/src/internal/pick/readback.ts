// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
  SceneGPUBuffer,
  SceneGPUCommandEncoder,
  SceneGPUDevice,
  SceneGPUTexture
} from '../../internal/gpu/platform.js';
import type { Mat4, Vec3, Vec4 } from '../../internal/types.js';

/** A renderer-owned target snapshot retained until its asynchronous map completes. */
interface PickFrame<T> {
  readonly decodeTarget: (id: number) => T | undefined;
  readonly inverseViewProjection: Mat4;
}

export interface PickPixel {
  readonly depth: number;
  /** ID zero means that no geometry covered the pixel. */
  readonly id: number;
}

interface PickPixelResult<T> {
  readonly target: T;
  readonly worldPosition: Vec3;
}

export interface PickReadbackDevice extends SceneGPUDevice {
  createBuffer(descriptor: { size: number; usage: number }): SceneGPUBuffer;
}

const BUFFER_COPY_DST = 0x08;
const BUFFER_MAP_READ = 0x01;
const MAP_READ = 0x01;
const PIXEL_ROW_BYTES = 256;
const READBACK_BYTES = PIXEL_ROW_BYTES * 2;
const READBACK_POOL_CAPACITY = 4;

/**
 * Copies the ID and depth attachments into one aligned map-read buffer.
 *
 * Outstanding requests own their buffers until mapping completes. Sequential
 * requests reuse a small pool, avoiding allocation churn without stalling the
 * render path or allowing concurrent maps to share a buffer.
 */
export class PickReadback<T> {
  #available: SceneGPUBuffer[] = [];
  #device: PickReadbackDevice;
  #disposed = false;
  #inFlight = new Set<SceneGPUBuffer>();

  constructor(device: PickReadbackDevice) {
    this.#device = device;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    for (const buffer of this.#available) buffer.destroy();
    this.#available = [];
  }

  copy(options: {
    readonly encoder: SceneGPUCommandEncoder;
    readonly frame: PickFrame<T>;
    readonly pixel: { readonly x: number; readonly y: number };
    readonly size: { readonly height: number; readonly width: number };
    readonly textures: { readonly depth: SceneGPUTexture; readonly id: SceneGPUTexture };
    /** Receives the completed raw ID/depth sample before target decoding. */
    readonly onPixel?: (pixel: PickPixel) => void;
  }): Promise<PickPixelResult<T> | null> {
    const { encoder, frame, pixel, size, textures } = options;
    const copy = encoder.copyTextureToBuffer;
    if (!copy) return Promise.resolve(null);
    const buffer = this.#acquireBuffer();
    try {
      copy.call(
        encoder,
        { texture: textures.id, origin: { x: pixel.x, y: pixel.y } },
        { buffer, bytesPerRow: PIXEL_ROW_BYTES },
        { width: 1, height: 1 }
      );
      copy.call(
        encoder,
        { texture: textures.depth, origin: { x: pixel.x, y: pixel.y } },
        { buffer, bytesPerRow: PIXEL_ROW_BYTES, offset: PIXEL_ROW_BYTES },
        { width: 1, height: 1 }
      );
    } catch (error) {
      this.#releaseBuffer(buffer, false);
      throw error;
    }
    // Mapping before the caller submits the encoder leaves the buffer mapped
    // during submit, which WebGPU rejects. A microtask lets the caller submit
    // the recorded copies before mapAsync begins without waiting for GPU work.
    return Promise.resolve().then(() => this.#map({ buffer, frame, onPixel: options.onPixel, pixel, size }));
  }

  async #map(options: {
    readonly buffer: SceneGPUBuffer;
    readonly frame: PickFrame<T>;
    readonly onPixel?: (pixel: PickPixel) => void;
    readonly pixel: { readonly x: number; readonly y: number };
    readonly size: { readonly height: number; readonly width: number };
  }): Promise<PickPixelResult<T> | null> {
    const { buffer, frame, onPixel, pixel, size } = options;
    let reusable = false;
    try {
      if (!buffer.mapAsync || !buffer.getMappedRange) return null;
      await buffer.mapAsync(MAP_READ);
      const bytes = new Uint8Array(buffer.getMappedRange());
      const sample = decodePickPixel(bytes);
      onPixel?.(sample);
      const target = sample.id === 0 ? undefined : frame.decodeTarget(sample.id);
      const result =
        target === undefined || !Number.isFinite(sample.depth)
          ? null
          : {
              target,
              worldPosition: reconstructWorldPosition({
                inverseViewProjection: frame.inverseViewProjection,
                pixel,
                depth: sample.depth,
                size
              })
            };
      reusable = true;
      return result;
    } finally {
      buffer.unmap?.();
      this.#releaseBuffer(buffer, reusable);
    }
  }

  #acquireBuffer(): SceneGPUBuffer {
    if (this.#disposed) throw new DOMException('The pick readback is disposed.', 'InvalidStateError');
    const buffer = this.#available.pop();
    if (buffer) {
      this.#inFlight.add(buffer);
      return buffer;
    }
    const created = this.#device.createBuffer({ size: READBACK_BYTES, usage: BUFFER_COPY_DST | BUFFER_MAP_READ });
    this.#inFlight.add(created);
    return created;
  }

  #releaseBuffer(buffer: SceneGPUBuffer, reusable: boolean): void {
    if (!this.#inFlight.delete(buffer)) return;
    if (!reusable || this.#disposed || this.#available.length >= READBACK_POOL_CAPACITY) {
      buffer.destroy();
      return;
    }
    this.#available.push(buffer);
  }
}

export function decodePickPixel(bytes: Uint8Array): PickPixel {
  if (bytes.byteLength < PIXEL_ROW_BYTES + 4) return { depth: Number.NaN, id: 0 };
  const id = (bytes[0] ?? 0) + ((bytes[1] ?? 0) << 8) + ((bytes[2] ?? 0) << 16) + (bytes[3] ?? 0) * 0x1000000;
  const depth = new DataView(bytes.buffer, bytes.byteOffset + PIXEL_ROW_BYTES, 4).getFloat32(0, true);
  return { depth, id };
}

export function reconstructWorldPosition(options: {
  readonly depth: number;
  readonly inverseViewProjection: Mat4;
  readonly pixel: { readonly x: number; readonly y: number };
  readonly size: { readonly height: number; readonly width: number };
}): Vec3 {
  const { depth, inverseViewProjection, pixel, size } = options;
  const x = ((pixel.x + 0.5) / size.width) * 2 - 1;
  const y = 1 - ((pixel.y + 0.5) / size.height) * 2;
  const transformed = multiplyVec4(inverseViewProjection, [x, y, depth, 1]);
  const inverseW = transformed[3] === 0 ? 1 : 1 / transformed[3];
  return [transformed[0] * inverseW, transformed[1] * inverseW, transformed[2] * inverseW];
}

function multiplyVec4(matrix: Mat4, vector: Readonly<Vec4>): [number, number, number, number] {
  return [
    readMatrix(matrix, 0) * vector[0] +
      readMatrix(matrix, 4) * vector[1] +
      readMatrix(matrix, 8) * vector[2] +
      readMatrix(matrix, 12) * vector[3],
    readMatrix(matrix, 1) * vector[0] +
      readMatrix(matrix, 5) * vector[1] +
      readMatrix(matrix, 9) * vector[2] +
      readMatrix(matrix, 13) * vector[3],
    readMatrix(matrix, 2) * vector[0] +
      readMatrix(matrix, 6) * vector[1] +
      readMatrix(matrix, 10) * vector[2] +
      readMatrix(matrix, 14) * vector[3],
    readMatrix(matrix, 3) * vector[0] +
      readMatrix(matrix, 7) * vector[1] +
      readMatrix(matrix, 11) * vector[2] +
      readMatrix(matrix, 15) * vector[3]
  ];
}

function readMatrix(matrix: Mat4, index: number): number {
  return matrix[index] ?? Number.NaN;
}
