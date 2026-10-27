// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function isObjectLiteral(item: unknown): item is Record<string, unknown> {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }
  const proto = Object.getPrototypeOf(item);
  return proto === null || proto === Object.prototype;
}

export function deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Record<string, unknown>[]): T {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObjectLiteral(target) && isObjectLiteral(source)) {
    for (const key in source) {
      if (key === '__proto__') continue;
      mergeProperty(target, source, key);
    }
  }

  return deepMerge(target, ...sources);
}

function mergeProperty(target: Record<string, unknown>, source: Record<string, unknown>, key: string) {
  const sourceValue = source[key];
  if (!isObjectLiteral(sourceValue)) {
    target[key] = sourceValue;
    return;
  }
  if (isObjectLiteral(target[key])) {
    deepMerge(target[key], sourceValue);
  } else {
    target[key] = sourceValue;
  }
}
