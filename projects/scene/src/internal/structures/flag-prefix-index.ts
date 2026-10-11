// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const BLOCK_SIZE = 256;

/** Mutable bit flags with blocked Fenwick indexes for prefix queries. */
export class FlagPrefixIndex {
  readonly #bitCount: number;
  readonly #channelCount: number;
  readonly #flagMask: number;
  #blockCount = 0;
  #fenwick = new Uint32Array();
  #flags = new Uint8Array();
  #deltas = new Int32Array();
  #dirtyBlocks = new Uint32Array();
  #dirtyMasks = new Uint8Array();
  #dirtyCount = 0;
  #dirtyMask = 0;

  constructor(bitCount: number) {
    if (!Number.isInteger(bitCount) || bitCount < 1 || bitCount > 8) {
      throw new RangeError('Flag prefix indexes support between one and eight flags.');
    }
    this.#bitCount = bitCount;
    this.#channelCount = bitCount * 2;
    this.#flagMask = (1 << bitCount) - 1;
  }

  /** Creates an independent copy with identical flags and prefix indexes. */
  clone(): FlagPrefixIndex {
    this.#flushUpdates();
    const clone = new FlagPrefixIndex(this.#bitCount);
    clone.#blockCount = this.#blockCount;
    clone.#fenwick = this.#fenwick.slice();
    clone.#flags = this.#flags.slice();
    return clone;
  }

  reset(recordCount: number): void {
    if (!Number.isInteger(recordCount) || recordCount < 0) {
      throw new RangeError('Flag prefix index length must be a nonnegative integer.');
    }
    const blockCount = Math.ceil(recordCount / BLOCK_SIZE);
    this.#discardUpdates();
    if (this.#flags.length !== recordCount) {
      this.#flags = new Uint8Array(recordCount);
    } else this.#flags.fill(0);
    if (this.#blockCount !== blockCount) {
      this.#fenwick = new Uint32Array((blockCount + 1) * this.#channelCount);
      this.#deltas = new Int32Array();
      this.#dirtyBlocks = new Uint32Array();
      this.#dirtyMasks = new Uint8Array();
    } else this.#fenwick.fill(0);
    this.#blockCount = blockCount;
  }

  setInitialFlags(index: number, flags: number): void {
    this.#flags[index] = flags;
  }

  finishInitialFlags(uniformFlags?: number): void {
    this.#discardUpdates();
    this.#fenwick.fill(0);
    if (uniformFlags === undefined) this.#buildInitialFenwickLeaves();
    else this.#buildUniformFenwickLeaves(uniformFlags);
    this.#buildInitialFenwickTree();
  }

  #buildUniformFenwickLeaves(flags: number): void {
    const resolvedFlags = flags & this.#flagMask;
    this.#flags.fill(resolvedFlags);
    const stride = this.#blockCount + 1;
    let remaining = resolvedFlags;
    while (remaining !== 0) {
      const mask = remaining & -remaining;
      const bitIndex = 31 - Math.clz32(mask);
      const allOffset = bitIndex * 2 * stride;
      const evenOffset = (bitIndex * 2 + 1) * stride;
      for (let block = 0; block < this.#blockCount; block += 1) {
        const start = block * BLOCK_SIZE;
        const count = Math.min(BLOCK_SIZE, this.#flags.length - start);
        this.#fenwick[allOffset + block + 1] = count;
        this.#fenwick[evenOffset + block + 1] = Math.floor((count + (start % 2 === 0 ? 1 : 0)) / 2);
      }
      remaining &= remaining - 1;
    }
  }

  #buildInitialFenwickLeaves(): void {
    const stride = this.#blockCount + 1;
    for (let index = 0; index < this.#flags.length; index += 1) {
      const block = Math.floor(index / BLOCK_SIZE) + 1;
      let remaining = (this.#flags[index] ?? 0) & this.#flagMask;
      while (remaining !== 0) {
        const mask = remaining & -remaining;
        const bitIndex = 31 - Math.clz32(mask);
        const allIndex = bitIndex * 2 * stride + block;
        this.#fenwick[allIndex] = (this.#fenwick[allIndex] ?? 0) + 1;
        if (index % 2 === 0) {
          const evenIndex = (bitIndex * 2 + 1) * stride + block;
          this.#fenwick[evenIndex] = (this.#fenwick[evenIndex] ?? 0) + 1;
        }
        remaining &= remaining - 1;
      }
    }
  }

  #buildInitialFenwickTree(): void {
    for (let channel = 0; channel < this.#channelCount; channel += 1) {
      this.#buildFenwickChannel(channel);
    }
  }

  #buildFenwickChannel(channel: number): void {
    const treeOffset = channel * (this.#blockCount + 1);
    for (let block = 1; block <= this.#blockCount; block += 1) {
      const parent = block + (block & -block);
      if (parent <= this.#blockCount) {
        this.#fenwick[treeOffset + parent] =
          (this.#fenwick[treeOffset + parent] ?? 0) + (this.#fenwick[treeOffset + block] ?? 0);
      }
    }
  }

  updateFlags(index: number, flags: number): boolean {
    const previous = this.#flags[index] ?? 0;
    if (previous === flags) return false;
    if (this.#dirtyCount !== 0) this.#flushUpdates();
    this.#flags[index] = flags;
    const block = Math.floor(index / BLOCK_SIZE);
    for (let bitIndex = 0; bitIndex < this.#bitCount; bitIndex += 1) {
      const mask = 1 << bitIndex;
      const before = (previous & mask) === 0 ? 0 : 1;
      const after = (flags & mask) === 0 ? 0 : 1;
      const delta = after - before;
      if (delta === 0) continue;
      this.#adjustChannel(bitIndex * 2, block, delta);
      if (index % 2 === 0) this.#adjustChannel(bitIndex * 2 + 1, block, delta);
    }
    return true;
  }

  /** Updates flags immediately and batches tree deltas until a query, clone, or eager update. */
  updateFlagsBatched(index: number, flags: number): boolean {
    const previous = this.#flags[index] ?? 0;
    if (previous === flags) return false;
    this.#flags[index] = flags;
    const changedMask = (previous ^ flags) & this.#flagMask;
    if (changedMask !== 0) this.#queueDeltas(index, changedMask, flags);
    return true;
  }

  #queueDeltas(index: number, changedMask: number, flags: number): void {
    if (this.#deltas.length === 0) this.#allocateBatchStorage();
    const block = Math.floor(index / BLOCK_SIZE);
    if (this.#dirtyMasks[block] === 0) this.#dirtyBlocks[this.#dirtyCount++] = block;
    this.#dirtyMasks[block] = (this.#dirtyMasks[block] ?? 0) | changedMask;
    this.#dirtyMask |= changedMask;
    this.#accumulateDeltas(index, changedMask, flags);
  }

  #allocateBatchStorage(): void {
    this.#deltas = new Int32Array(this.#fenwick.length);
    this.#dirtyBlocks = new Uint32Array(this.#blockCount);
    this.#dirtyMasks = new Uint8Array(this.#blockCount);
  }

  #accumulateDeltas(index: number, changedMask: number, flags: number): void {
    const stride = this.#blockCount + 1;
    const block = Math.floor(index / BLOCK_SIZE);
    let remaining = changedMask;
    while (remaining !== 0) {
      const mask = remaining & -remaining;
      const bitIndex = 31 - Math.clz32(mask);
      const allIndex = bitIndex * 2 * stride + block + 1;
      const delta = (flags & mask) === 0 ? -1 : 1;
      this.#deltas[allIndex] = (this.#deltas[allIndex] ?? 0) + delta;
      if (index % 2 === 0) {
        const evenIndex = allIndex + stride;
        this.#deltas[evenIndex] = (this.#deltas[evenIndex] ?? 0) + delta;
      }
      remaining &= remaining - 1;
    }
  }

  #flushUpdates(): void {
    if (this.#dirtyCount === 0) return;
    // Compare the sparse traversal bound with two linear passes over each affected channel.
    const sparseCost = this.#dirtyCount * (32 - Math.clz32(this.#blockCount));
    if (sparseCost > this.#blockCount * 2) this.#rebuildDirtyChannels();
    else this.#applyDirtyBlocks();
    this.#clearDirtyBlocks();
  }

  #applyDirtyBlocks(): void {
    const stride = this.#blockCount + 1;
    for (let item = 0; item < this.#dirtyCount; item += 1) {
      const block = this.#dirtyBlocks[item] ?? 0;
      let remaining = this.#dirtyMasks[block] ?? 0;
      while (remaining !== 0) {
        const mask = remaining & -remaining;
        const bitIndex = 31 - Math.clz32(mask);
        const allIndex = bitIndex * 2 * stride + block + 1;
        const allDelta = this.#deltas[allIndex] ?? 0;
        const evenDelta = this.#deltas[allIndex + stride] ?? 0;
        this.#deltas[allIndex] = 0;
        this.#deltas[allIndex + stride] = 0;
        if (allDelta !== 0) this.#adjustChannel(bitIndex * 2, block, allDelta);
        if (evenDelta !== 0) this.#adjustChannel(bitIndex * 2 + 1, block, evenDelta);
        remaining &= remaining - 1;
      }
    }
  }

  #rebuildDirtyChannels(): void {
    let remaining = this.#dirtyMask;
    while (remaining !== 0) {
      const mask = remaining & -remaining;
      const bitIndex = 31 - Math.clz32(mask);
      this.#rebuildChannel(bitIndex * 2);
      this.#rebuildChannel(bitIndex * 2 + 1);
      remaining &= remaining - 1;
    }
  }

  #rebuildChannel(channel: number): void {
    const treeOffset = channel * (this.#blockCount + 1);
    // Reverse the linear Fenwick build to recover leaves without scanning record flags.
    for (let block = this.#blockCount; block > 0; block -= 1) {
      const parent = block + (block & -block);
      if (parent <= this.#blockCount) {
        this.#fenwick[treeOffset + parent] =
          (this.#fenwick[treeOffset + parent] ?? 0) - (this.#fenwick[treeOffset + block] ?? 0);
      }
    }
    for (let item = 0; item < this.#dirtyCount; item += 1) {
      const index = treeOffset + (this.#dirtyBlocks[item] ?? 0) + 1;
      this.#fenwick[index] = (this.#fenwick[index] ?? 0) + (this.#deltas[index] ?? 0);
      this.#deltas[index] = 0;
    }
    this.#buildFenwickChannel(channel);
  }

  #discardUpdates(): void {
    if (this.#dirtyCount !== 0) this.#deltas.fill(0);
    this.#clearDirtyBlocks();
  }

  #clearDirtyBlocks(): void {
    for (let item = 0; item < this.#dirtyCount; item += 1) {
      const block = this.#dirtyBlocks[item] ?? 0;
      this.#dirtyMasks[block] = 0;
    }
    this.#dirtyCount = 0;
    this.#dirtyMask = 0;
  }

  has(mask: number, count: number, evenOnly = false): boolean {
    const resolvedCount = Math.min(Math.max(0, count), this.#flags.length);
    if (resolvedCount === 0) return false;
    const bitIndex = maskToIndex(mask, this.#bitCount);
    if (this.#dirtyCount !== 0) this.#flushUpdates();
    const channel = bitIndex * 2 + (evenOnly ? 1 : 0);
    const fullBlocks = Math.floor(resolvedCount / BLOCK_SIZE);
    if (this.#prefixSum(channel, fullBlocks) > 0) return true;
    const step = evenOnly ? 2 : 1;
    for (let index = fullBlocks * BLOCK_SIZE; index < resolvedCount; index += step) {
      if (((this.#flags[index] ?? 0) & mask) !== 0) return true;
    }
    return false;
  }

  #adjustChannel(channel: number, block: number, delta: number): void {
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
    throw new RangeError('A flag prefix query requires one flag bit.');
  }
  const index = 31 - Math.clz32(mask);
  if (index >= bitCount) throw new RangeError('The queried flag is out of range.');
  return index;
}
