// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { MarkerBoundsClassifier, MarkerBoundsIndex } from './bounds.js';
import { composePreciseMat4 } from '../../math/mat4.js';

const runOptions = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const QUERY_BATCH = 2_048;
const UPDATE_BATCH = 2_048;

describe('marker frustum classification', () => {
  const classifier = new MarkerBoundsClassifier();
  const projection = composePreciseMat4([0, 0, 0], [0, 0, 0, 1]);
  const frames = Array.from({ length: 256 }, (_, index) => composePreciseMat4([index % 7, 0, 0], [0, 0, index % 3, 1]));
  const bounds = { minimumX: -0.5, minimumY: -0.5, minimumZ: 0.25, maximumX: 0.5, maximumY: 0.5, maximumZ: 0.75 };
  for (const count of [1_024, 16_384]) {
    const batch = count === 1_024 ? 16 : 2;
    test(`classifies ${count} transformed marker bounds, batch ${batch}`, async ({ bench }) => {
      await bench('frustum classification', () => {
        let checksum = 0;
        for (let index = 0; index < count * batch; index += 1) {
          checksum += classifier.classify(bounds, projection, frames[index % frames.length]!) === 'outside' ? 1 : 0;
        }
        return checksum;
      }).run(runOptions);
    });
  }
});

describe('marker bounds aggregation', () => {
  for (const count of [1_024, 65_536, 1_048_576]) {
    const replacementBatch = count === 1_024 ? 256 : count === 65_536 ? 4 : 1;
    const cloneBatch = count === 1_024 ? 8_192 : count === 65_536 ? 2_048 : 256;
    const bytes = new Uint8Array(count * 48);
    const floats = new Float32Array(bytes.buffer);
    for (let index = 0; index < count; index += 1) {
      const offset = index * 12;
      floats[offset] = index % 1_009;
      floats[offset + 1] = index % 503;
      floats[offset + 2] = index % 127;
      floats[offset + 7] = 1;
      floats[offset + 8] = 2;
      floats[offset + 9] = 3;
      bytes[index * 48 + 43] = 255;
    }
    const source = { bytes, floats, view: null };
    const index = new MarkerBoundsIndex();
    index.reset(count);
    index.updateBlocks({ ...source, count, recordCount: count, start: 0 });
    index.getBounds(count, source);
    let step = 0;

    test(`queries ${QUERY_BATCH} prefixes of ${count} markers`, async ({ bench }) => {
      await bench('prefix queries', () => {
        let checksum = 0;
        for (let query = 0; query < QUERY_BATCH; query += 1) {
          // Aligned and unaligned prefixes across the upper half of the source.
          const prefix = count / 2 + ((query * 257) % (count / 2 + 1));
          checksum += index.getBounds(prefix, source)?.maximumX ?? 0;
        }
        return checksum;
      }).run(runOptions);
    });

    test(`updates ${UPDATE_BATCH} individual records and queries ${count} markers`, async ({ bench }) => {
      await bench('sparse updates', () => {
        let checksum = 0;
        for (let update = 0; update < UPDATE_BATCH; update += 1) {
          const record = (step++ * 257) % count;
          floats[record * 12] = step % 2 === 0 ? 2_000 : -2_000;
          index.updateBlocks({ ...source, count: 1, recordCount: count, start: record });
          checksum += index.getBounds(count, source)?.maximumX ?? 0;
        }
        return checksum;
      }).run(runOptions);
    });

    test(`replaces and queries ${count} markers ${replacementBatch} times`, async ({ bench }) => {
      await bench('full replacement', () => {
        let checksum = 0;
        for (let replacement = 0; replacement < replacementBatch; replacement += 1) {
          index.reset(count);
          index.updateBlocks({ ...source, count, recordCount: count, start: 0 });
          checksum += index.getBounds(count, source)?.maximumX ?? 0;
        }
        return checksum;
      }).run(runOptions);
    });

    test(`clones and queries ${cloneBatch} snapshots of ${count} markers`, async ({ bench }) => {
      await bench('snapshot cloning', () => {
        let checksum = 0;
        for (let snapshot = 0; snapshot < cloneBatch; snapshot += 1) {
          checksum += index.clone().getBounds(count, source)?.maximumX ?? 0;
        }
        return checksum;
      }).run(runOptions);
    });
  }
});
