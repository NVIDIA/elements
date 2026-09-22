// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Owns a fixed-length array of bits in LSB-first byte order. */
export class BitArray {
  readonly length: number;
  readonly #bytes: Uint8Array;

  /** Copies imported bytes, retaining padding bits in the final byte. */
  constructor(length: number, bytes?: Uint8Array) {
    if (!Number.isSafeInteger(length) || length < 0) {
      throw new RangeError('Bit array length must be a nonnegative safe integer.');
    }
    const byteLength = Math.ceil(length / 8);
    if (bytes !== undefined && bytes.byteLength < byteLength) {
      throw new RangeError('Bit array storage must contain one bit for every entry.');
    }
    this.length = length;
    this.#bytes = bytes === undefined ? new Uint8Array(byteLength) : new Uint8Array(bytes.subarray(0, byteLength));
  }

  /** Returns false for an index outside the logical bit length. */
  get(index: number): boolean {
    if (!Number.isInteger(index) || index < 0 || index >= this.length) return false;
    return ((this.#bytes[Math.floor(index / 8)] ?? 0) & (1 << (index & 7))) !== 0;
  }

  set(index: number, value: boolean): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.length) {
      throw new RangeError('Bit array index must identify an entry within length.');
    }
    const byteIndex = Math.floor(index / 8);
    const byte = this.#bytes[byteIndex] ?? 0;
    const mask = 1 << (index & 7);
    this.#bytes[byteIndex] = value ? byte | mask : byte & ~mask;
  }

  clear(): void {
    this.#bytes.fill(0);
  }

  clone(): BitArray {
    return new BitArray(this.length, this.#bytes);
  }

  /** Returns an independent copy of the packed bytes. */
  toBytes(): Uint8Array {
    return this.#bytes.slice();
  }
}
