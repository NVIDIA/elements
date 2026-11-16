// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Resolve the shared numeric model used by meter rendering, grouping, and accessibility. */
export function getMeterRange(source: { min: number; max: number; value: number }) {
  const min = Number.isFinite(source.min) ? source.min : 0;
  const max = Math.max(min, Number.isFinite(source.max) ? source.max : 100);
  const value = Math.min(max, Math.max(min, Number.isFinite(source.value) ? source.value : min));
  return { min, max, value, fraction: max > min ? (value - min) / (max - min) : 0 };
}
