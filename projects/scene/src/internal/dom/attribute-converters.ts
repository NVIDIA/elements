// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { positiveFiniteOr } from '@nvidia-elements/core/internal';

/** Creates a Lit attribute converter that restores the supplied fallback for non-positive or non-finite values. */
export function createPositiveFiniteNumberConverter(fallback: number) {
  return {
    fromAttribute(value: string | null): number {
      return value === null ? fallback : positiveFiniteOr(Number(value), fallback);
    }
  };
}
