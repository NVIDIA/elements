// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function isObject(item: unknown): item is Record<string, unknown> {
  return !!item && typeof item === 'object' && !Array.isArray(item);
}

export function isObjectLiteral(item: unknown): item is Record<string, unknown> {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }
  const proto = Object.getPrototypeOf(item);
  return proto === null || proto === Object.prototype;
}

export function deepMerge(
  target: Record<string, unknown>,
  ...sources: Record<string, unknown>[]
): Record<string, unknown> {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObjectLiteral(target) && isObjectLiteral(source)) {
    for (const key in source) {
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

export function parseVersion(version: string) {
  const [major, minor, patch] = version.split('.').map(v => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? -1 : n;
  });
  return { major: major ?? -1, minor: minor ?? -1, patch: patch ?? -1 };
}

export function formatStandardNumber(number: number) {
  return new Intl.NumberFormat().format(number);
}

export function getDifference(minuend: number, subtrahend: number) {
  return Math.sign(subtrahend - minuend) * Math.abs(minuend - subtrahend);
}
