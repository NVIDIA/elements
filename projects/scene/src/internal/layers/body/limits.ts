// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Byte limit for a body file or its compiled geometry. */
export const MAX_GEOMETRY_BYTES = 256 * 1024 * 1024;

/** Includes positions, normals, colors, UVs, and triangle indices. */
export const GEOMETRY_TRIANGLE_BYTES =
  3 * (3 + 3 + 4 + 2) * Float32Array.BYTES_PER_ELEMENT + 3 * Uint32Array.BYTES_PER_ELEMENT;
