// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const BLOCK_SIZE = 256;

export interface RecordSummarySnapshot {
  readonly storageAllocations: number;
  readonly prefixQueries: number;
  readonly remainderScans: number;
}

/** Range-queryable bit summaries for mutable fixed-stride records. */
export class RecordSummary {
  readonly #bitCount: number;
  readonly #channelCount: number;
  #blockCount = 0;
  #blockSums = new Uint16Array();
  #fenwick = new Uint32Array();
  #flags = new Uint8Array();
  #prefixQueries = 0;
  #remainderScans = 0;
  #storageAllocations = 0;

  constructor(bitCount: number) {
    if (!Number.isInteger(bitCount) || bitCount < 1 || bitCount > 8) {
      throw new RangeError('Record summaries support between one and eight flags.');
    }
    this.#bitCount = bitCount;
    this.#channelCount = bitCount * 2;
  }

  reset(recordCount: number): void {
    if (!Number.isInteger(recordCount) || recordCount < 0) {
      throw new RangeError('Record summary length must be a nonnegative integer.');
    }
    const blockCount = Math.ceil(recordCount / BLOCK_SIZE);
    if (this.#flags.length !== recordCount) {
      this.#flags = new Uint8Array(recordCount);
      this.#storageAllocations += 1;
    } else this.#flags.fill(0);
    if (this.#blockCount !== blockCount) {
      this.#blockSums = new Uint16Array(blockCount * this.#channelCount);
      this.#fenwick = new Uint32Array((blockCount + 1) * this.#channelCount);
      this.#storageAllocations += 2;
    } else {
      this.#blockSums.fill(0);
      this.#fenwick.fill(0);
    }
    this.#blockCount = blockCount;
  }

  setInitialFlags(index: number, flags: number): void {
    this.#flags[index] = flags;
    this.#adjustBlockSums(index, flags, 1);
  }

  finishInitialFlags(): void {
    const stride = this.#blockCount + 1;
    for (let channel = 0; channel < this.#channelCount; channel += 1) {
      const treeOffset = channel * stride;
      const blockOffset = channel * this.#blockCount;
      for (let block = 1; block <= this.#blockCount; block += 1) {
        const value = this.#blockSums[blockOffset + block - 1] ?? 0;
        this.#fenwick[treeOffset + block] = (this.#fenwick[treeOffset + block] ?? 0) + value;
        const parent = block + (block & -block);
        if (parent <= this.#blockCount) {
          this.#fenwick[treeOffset + parent] =
            (this.#fenwick[treeOffset + parent] ?? 0) + (this.#fenwick[treeOffset + block] ?? 0);
        }
      }
    }
  }

  updateFlags(index: number, flags: number): void {
    const previous = this.#flags[index] ?? 0;
    if (previous === flags) return;
    this.#flags[index] = flags;
    for (let bitIndex = 0; bitIndex < this.#bitCount; bitIndex += 1) {
      const mask = 1 << bitIndex;
      const before = (previous & mask) === 0 ? 0 : 1;
      const after = (flags & mask) === 0 ? 0 : 1;
      const delta = after - before;
      if (delta === 0) continue;
      this.#adjustChannel(bitIndex * 2, index, delta);
      if (index % 2 === 0) this.#adjustChannel(bitIndex * 2 + 1, index, delta);
    }
  }

  has(mask: number, count: number, evenOnly = false): boolean {
    const resolvedCount = Math.min(Math.max(0, count), this.#flags.length);
    if (resolvedCount === 0) return false;
    const bitIndex = maskToIndex(mask, this.#bitCount);
    const channel = bitIndex * 2 + (evenOnly ? 1 : 0);
    const fullBlocks = Math.floor(resolvedCount / BLOCK_SIZE);
    this.#prefixQueries += 1;
    if (this.#prefixSum(channel, fullBlocks) > 0) return true;
    const step = evenOnly ? 2 : 1;
    for (let index = fullBlocks * BLOCK_SIZE; index < resolvedCount; index += step) {
      this.#remainderScans += 1;
      if (((this.#flags[index] ?? 0) & mask) !== 0) return true;
    }
    return false;
  }

  getSnapshot(): RecordSummarySnapshot {
    return {
      prefixQueries: this.#prefixQueries,
      remainderScans: this.#remainderScans,
      storageAllocations: this.#storageAllocations
    };
  }

  #adjustBlockSums(index: number, flags: number, delta: number): void {
    for (let bitIndex = 0; bitIndex < this.#bitCount; bitIndex += 1) {
      if ((flags & (1 << bitIndex)) === 0) continue;
      const block = Math.floor(index / BLOCK_SIZE);
      const allIndex = bitIndex * 2 * this.#blockCount + block;
      this.#blockSums[allIndex] = (this.#blockSums[allIndex] ?? 0) + delta;
      if (index % 2 === 0) {
        const evenIndex = (bitIndex * 2 + 1) * this.#blockCount + block;
        this.#blockSums[evenIndex] = (this.#blockSums[evenIndex] ?? 0) + delta;
      }
    }
  }

  #adjustChannel(channel: number, index: number, delta: number): void {
    const block = Math.floor(index / BLOCK_SIZE);
    const blockIndex = channel * this.#blockCount + block;
    this.#blockSums[blockIndex] = (this.#blockSums[blockIndex] ?? 0) + delta;
    const stride = this.#blockCount + 1;
    const treeOffset = channel * stride;
    for (let cursor = block + 1; cursor <= this.#blockCount; cursor += cursor & -cursor) {
      this.#fenwick[treeOffset + cursor] = (this.#fenwick[treeOffset + cursor] ?? 0) + delta;
    }
  }

  #prefixSum(channel: number, blockCount: number): number {
    const treeOffset = channel * (this.#blockCount + 1);
    let sum = 0;
    for (let cursor = blockCount; cursor > 0; cursor -= cursor & -cursor) {
      sum += this.#fenwick[treeOffset + cursor] ?? 0;
    }
    return sum;
  }
}

function maskToIndex(mask: number, bitCount: number): number {
  if (!Number.isInteger(mask) || mask < 1 || (mask & (mask - 1)) !== 0) {
    throw new RangeError('A record summary query requires one flag bit.');
  }
  const index = 31 - Math.clz32(mask);
  if (index >= bitCount) throw new RangeError('The record summary flag is out of range.');
  return index;
}
