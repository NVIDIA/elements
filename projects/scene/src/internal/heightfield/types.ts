// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** A uniformly spaced, row-major terrain elevation grid. */
export interface HeightfieldGrid {
  /** Frame-local xy position of sample (0, 0). Defaults to [0, 0]. */
  readonly origin?: readonly [number, number];
  /** Uniform distance between samples in meters. */
  readonly spacing: number;
  /** Number of samples in each row. */
  readonly columns: number;
  /** Number of rows of samples. */
  readonly rows: number;
  /** Row-major z samples. */
  readonly heights: Float32Array;
  /** Optional row-major rgba8 samples. */
  readonly colors?: Uint8Array;
}
