// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Creates a Lit attribute converter that restores the supplied fallback for non-positive or non-finite values. */
export function createPositiveFiniteNumberConverter(fallback: number) {
  return {
    fromAttribute(value: string | null): number {
      const parsed = value === null ? fallback : Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }
  };
}
