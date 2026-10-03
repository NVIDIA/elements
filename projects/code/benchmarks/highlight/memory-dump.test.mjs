// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeMemoryDump } from './memory-dump.mjs';

test('decodes split allocator and process dumps without summing overlapping heaps', () => {
  const events = [
    { ph: 'v', pid: 1, args: { dumps: { process_totals: { private_footprint_bytes: '1000' } } } },
    {
      ph: 'v',
      pid: 1,
      args: {
        dumps: {
          allocators: {
            'blink_gc/main/allocated_objects': { attrs: { size: { units: 'bytes', value: '100' } } },
            'malloc/allocated_objects': { attrs: { size: { units: 'bytes', value: '300' } } }
          }
        }
      }
    },
    { ph: 'v', pid: 2, args: { dumps: { process_totals: { private_footprint_bytes: '2000' } } } },
    { ph: 'v', pid: 99, args: { dumps: { process_totals: { private_footprint_bytes: 'ffff' } } } }
  ];
  const result = summarizeMemoryDump(events, [
    { id: 1, type: 'renderer' },
    { id: 2, type: 'browser' }
  ]);
  assert.equal(result.rendererPrivateFootprintBytes, 4096);
  assert.equal(result.measuredProcessPrivateFootprintBytes, 12288);
  assert.equal(result.renderers[0].blinkBytes, 256);
  assert.equal(result.renderers[0].mallocBytes, 768);
});

test('rejects missing native footprints and leaves unavailable allocators absent', () => {
  assert.throws(() => summarizeMemoryDump([], [{ id: 1, type: 'renderer' }]), /unavailable/);
  const result = summarizeMemoryDump(
    [{ ph: 'v', pid: 1, args: { dumps: { process_totals: { private_footprint_bytes: '0' } } } }],
    [{ id: 1, type: 'renderer' }]
  );
  assert.equal(result.rendererPrivateFootprintBytes, 0);
  assert.equal(result.renderers[0].blinkBytes, undefined);
});
