// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Immutable reverse adjacency in compressed sparse row form; targets are occurrence indices. */
export class CompressedAdjacencyIndex {
  readonly #offsets: Uint32Array;
  readonly #targets: Uint32Array;

  private constructor(offsets: Uint32Array, targets: Uint32Array) {
    this.#offsets = offsets;
    this.#targets = targets;
  }

  static create(vertexCount: number, vertices: Uint32Array): CompressedAdjacencyIndex {
    const builder = this.build(vertexCount, vertices, Number.MAX_SAFE_INTEGER);
    let step = builder.next();
    while (!step.done) step = builder.next();
    return step.value;
  }

  /** Yields after bounded work so callers can schedule and cancel construction. */
  static *build(
    vertexCount: number,
    vertices: Uint32Array,
    chunkSize: number
  ): Generator<void, CompressedAdjacencyIndex> {
    if (!Number.isSafeInteger(vertexCount) || vertexCount < 0 || vertexCount >= 0xffff_ffff) {
      throw new RangeError('Adjacency vertex count must be a nonnegative 32-bit integer.');
    }
    if (!Number.isSafeInteger(chunkSize) || chunkSize < 1)
      throw new RangeError('Adjacency chunk size must be positive.');
    const offsets = new Uint32Array(vertexCount + 1);
    yield* this.#count(vertices, offsets, chunkSize);
    yield* this.#prefix(offsets, chunkSize);
    const targets = yield* this.#scatter(vertices, offsets, chunkSize);
    return new CompressedAdjacencyIndex(offsets, targets);
  }

  static *#count(vertices: Uint32Array, offsets: Uint32Array, chunkSize: number): Generator<void> {
    for (let index = 0; index < vertices.length; index += 1) {
      const vertex = vertices[index]!;
      if (vertex >= offsets.length - 1) throw new RangeError('Adjacency vertices must be within capacity.');
      offsets[vertex + 1] = offsets[vertex + 1]! + 1;
      if ((index + 1) % chunkSize === 0) yield;
    }
  }

  static *#prefix(offsets: Uint32Array, chunkSize: number): Generator<void> {
    for (let vertex = 0; vertex < offsets.length - 1; vertex += 1) {
      offsets[vertex + 1] = offsets[vertex + 1]! + offsets[vertex]!;
      if ((vertex + 1) % chunkSize === 0) yield;
    }
  }

  static *#scatter(vertices: Uint32Array, offsets: Uint32Array, chunkSize: number): Generator<void, Uint32Array> {
    const cursors = offsets.slice(0, -1);
    const targets = new Uint32Array(vertices.length);
    for (let index = 0; index < vertices.length; index += 1) {
      const vertex = vertices[index]!;
      const cursor = cursors[vertex]!;
      targets[cursor] = index;
      cursors[vertex] = cursor + 1;
      if ((index + 1) % chunkSize === 0) yield;
    }
    return targets;
  }

  /** Caller supplies a valid vertex index; offsets delimit its target occurrences. */
  start(vertex: number): number {
    return this.#offsets[vertex]!;
  }

  end(vertex: number): number {
    return this.#offsets[vertex + 1]!;
  }

  /** Caller supplies an offset between start and end. */
  target(offset: number): number {
    return this.#targets[offset]!;
  }
}
