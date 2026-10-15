// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test, type BenchRunOptions } from 'vitest';
import { writePackedColor } from './color.js';
import { writePoint } from '../records/layouts/codecs.js';
import { POINT } from '../records/layouts/built-ins.js';
import type { RGBA } from './types.js';
import type { Vec3 } from '../math/types.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

describe('RGBA8 record encoding', () => {
  for (const count of [128, 4096]) {
    const batch = count === 128 ? 1024 : 32;
    const colors = Array.from<unknown, RGBA>({ length: count }, (_, index) => [(index % 256) / 255, 0.5, 1, 0.75]);
    const view = new DataView(new ArrayBuffer(count * 4));
    test(`writes ${count} strict RGBA8 colors, batch ${batch}`, async ({ bench }) => {
      await bench('complete color writes', () => {
        let checksum = 0;
        for (let iteration = 0; iteration < batch; iteration += 1) {
          for (let index = 0; index < count; index += 1) writePackedColor(view, index * 4, colors[index]!);
          checksum += view.getUint8((count - 1) * 4 + 3);
        }
        return checksum;
      }).run(options);
    });
    const fields = colors.map<{ position: Vec3; color: RGBA }>((color, index) => ({
      position: [index, 0, 0],
      color: [color[0], -1, 2, color[3]]
    }));
    const bytes = new Uint8Array(count * POINT.stride);
    test(`writes ${count} points with clamped RGBA8 colors, batch ${batch}`, async ({ bench }) => {
      await bench('complete point writes', () => {
        let checksum = 0;
        for (let iteration = 0; iteration < batch; iteration += 1) {
          for (let index = 0; index < count; index += 1) writePoint(bytes, index, fields[index]!);
          checksum += bytes[bytes.length - 1]!;
        }
        return checksum;
      }).run(options);
    });
  }
});
