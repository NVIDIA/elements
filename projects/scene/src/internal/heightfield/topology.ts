// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Creates the shared row-major, counter-clockwise index topology for a heightfield grid. */
export function createHeightfieldIndices(rows: number, columns: number): Uint32Array {
  const indices = new Uint32Array((rows - 1) * (columns - 1) * 6);
  let offset = 0;
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const topLeft = row * columns + column;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + columns;
      const bottomRight = bottomLeft + 1;
      indices.set([topLeft, topRight, bottomLeft, topRight, bottomRight, bottomLeft], offset);
      offset += 6;
    }
  }
  return indices;
}
