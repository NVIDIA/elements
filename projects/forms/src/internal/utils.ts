// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function isObjectLiteral(item: unknown) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }
  const proto = Object.getPrototypeOf(item);
  return proto === null || proto === Object.prototype;
}
