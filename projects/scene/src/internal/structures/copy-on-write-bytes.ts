// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Owns mutable bytes and preserves captured snapshots through copy-on-write.
 *
 * A captured snapshot is immutable from this owner's perspective: the next
 * writer receives one detached copy while existing snapshot consumers keep
 * their bytes.
 */
export class CopyOnWriteBytes {
  #bytes: Uint8Array | null = null;
  #floats: Float32Array | null = null;
  #shared = false;
  #view: DataView | null = null;

  get bytes(): Uint8Array | null {
    return this.#bytes;
  }

  get dataView(): DataView | null {
    const bytes = this.#bytes;
    if (!bytes) return null;
    this.#view ??= new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return this.#view;
  }

  get float32(): Float32Array | null {
    const bytes = this.#bytes;
    if (!bytes) return null;
    this.#floats ??= new Float32Array(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength / Float32Array.BYTES_PER_ELEMENT
    );
    return this.#floats;
  }

  /** Replaces bytes, reusing an exclusive equal-capacity allocation. */
  replace(source: Uint8Array): boolean {
    const current = this.#bytes;
    const capacityPreserved = current?.byteLength === source.byteLength;
    if (current && capacityPreserved && !this.#shared) {
      current.set(source);
      return true;
    }
    this.#bytes = new Uint8Array(source);
    this.#clearViews();
    this.#shared = false;
    return capacityPreserved;
  }

  /** Adopts bytes that their provider must keep immutable. */
  adopt(bytes: Uint8Array): void {
    this.#bytes = bytes;
    this.#clearViews();
    this.#shared = true;
  }

  /** Captures bytes that later writes through this owner preserve. */
  captureSnapshot(): Uint8Array | null {
    if (this.#bytes) this.#shared = true;
    return this.#bytes;
  }

  /** Returns bytes that this owner can mutate, detaching a snapshot at most once. */
  writable(): Uint8Array | null {
    const bytes = this.#bytes;
    if (!bytes) return null;
    if (this.#shared) {
      this.#bytes = bytes.slice();
      this.#clearViews();
      this.#shared = false;
    }
    return this.#bytes;
  }

  clear(): void {
    this.#bytes = null;
    this.#clearViews();
    this.#shared = false;
  }

  #clearViews(): void {
    this.#floats = null;
    this.#view = null;
  }
}
