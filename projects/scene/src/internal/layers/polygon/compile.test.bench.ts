// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { compilePolygon } from './compile.js';
import type { PolygonGeometry, PolygonRing } from './types.js';

const runOptions = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

function radialRing(count: number, innerRadius: number): PolygonRing {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const radius = index % 2 === 0 ? 100 : innerRadius;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
  });
}

describe('complete polygon compilation', () => {
  for (const count of [512, 4_096]) {
    const sideLength = count / 4;
    const outer: PolygonRing = Array.from({ length: count }, (_, index) => {
      const offset = index % sideLength;
      switch (Math.floor(index / sideLength)) {
        case 0:
          return [offset, 0];
        case 1:
          return [sideLength, offset];
        case 2:
          return [sideLength - offset, sideLength];
        default:
          return [0, sideLength - offset];
      }
    });
    test(`compiles 16 polygons with ${count} collinear boundary vertices`, async ({ bench }) => {
      await bench('complete compilation', () => {
        let checksum = 0;
        for (let iteration = 0; iteration < 16; iteration += 1) {
          const compiled = compilePolygon({ outer });
          checksum += compiled.indices.length + compiled.positions.length;
        }
        return checksum;
      }).run(runOptions);
    });
  }
  for (const count of [32, 64, 128, 256, 1_024, 3_072, 4_096]) {
    const batch = count <= 128 ? 256 : count === 256 ? 8 : 1;
    const fixtures: Array<{ name: string; geometry: PolygonGeometry }> = [
      { name: 'convex', geometry: { outer: radialRing(count, 100) } }
    ];
    fixtures.push({ name: 'concave', geometry: { outer: radialRing(count, 80) } });
    if (count < 4_096) {
      fixtures.push({
        name: 'holed',
        geometry: {
          outer: radialRing(count, 100),
          holes: [radialRing(count / 4, 100).map(([x, y]) => [x * 0.2, y * 0.2] as const)]
        }
      });
    }
    for (const { name, geometry } of fixtures) {
      test(`compiles ${batch} ${name} polygons with ${count} outer vertices`, async ({ bench }) => {
        await bench('complete compilation', () => {
          let checksum = 0;
          for (let iteration = 0; iteration < batch; iteration += 1) {
            const compiled = compilePolygon(geometry);
            checksum += compiled.indices.length + compiled.positions.length;
          }
          return checksum;
        }).run(runOptions);
      });
    }
  }
});
