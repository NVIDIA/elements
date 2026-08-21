// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type PointSizeUnit = 'pixel' | 'world';

export function normalizePointSizeUnit(value: unknown): PointSizeUnit {
  return value === 'world' ? 'world' : 'pixel';
}
