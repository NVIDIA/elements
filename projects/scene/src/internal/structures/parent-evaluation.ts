// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

interface ParentEvaluationOptions<Node, Value> {
  /** Undefined ends a valid root path; null ends an invalid path. */
  readonly getParent: (node: Node) => Node | null | undefined;
  readonly rootValue: Value;
  readonly invalidValue: Value;
  readonly reduce: (node: Node, parentValue: Value) => Value;
}

/**
 * Memoizes inherited values over a finite, acyclic parent relation without recursion.
 * Callers keep parents and reducer inputs stable for this evaluation's lifetime.
 * Each visited node resolves its parent and reduces once, using O(n) time and space.
 * Results retain their identity; create a new evaluation after input changes.
 */
export class ParentEvaluation<Node extends object | string | number | bigint | boolean | symbol, Value> {
  readonly #getParent: ParentEvaluationOptions<Node, Value>['getParent'];
  readonly #rootValue: Value;
  readonly #invalidValue: Value;
  readonly #reduce: ParentEvaluationOptions<Node, Value>['reduce'];
  readonly #values = new Map<Node, Value>();

  constructor(options: ParentEvaluationOptions<Node, Value>) {
    this.#getParent = options.getParent;
    this.#rootValue = options.rootValue;
    this.#invalidValue = options.invalidValue;
    this.#reduce = options.reduce;
  }

  get(node: Node): Value {
    const path: Node[] = [];
    let current: Node | null | undefined = node;
    while (current !== null && current !== undefined && !this.#values.has(current)) {
      path.push(current);
      current = this.#getParent(current);
    }
    let value =
      current === null ? this.#invalidValue : current === undefined ? this.#rootValue : this.#values.get(current)!;
    for (let index = path.length - 1; index >= 0; index -= 1) {
      const ancestor = path[index]!;
      value = this.#reduce(ancestor, value);
      this.#values.set(ancestor, value);
    }
    return value;
  }
}
