// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface ReadyCycle {
  readonly promise: Promise<void>;
  readonly settled: boolean;
  resolve(): void;
  reject(reason: unknown): void;
}

export function createReadyCycle(): ReadyCycle {
  let resolvePromise: () => void = () => undefined;
  let rejectPromise: (reason: unknown) => void = () => undefined;
  let settled = false;
  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  void promise.catch(() => undefined);

  return {
    get promise() {
      return promise;
    },
    get settled() {
      return settled;
    },
    resolve() {
      if (!settled) {
        settled = true;
        resolvePromise();
      }
    },
    reject(reason: unknown) {
      if (!settled) {
        settled = true;
        rejectPromise(reason);
      }
    }
  };
}
