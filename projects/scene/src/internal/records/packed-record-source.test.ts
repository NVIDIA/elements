// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { MarkerBuffer } from '../layers/markers/buffer.js';
import {
  getPackedRecordBytes,
  getPackedRecordKind,
  getPackedRecordState,
  isExternalPackedRecordSource,
  isPackedRecordSource,
  PACKED_RECORD_STATE,
  registerExternalPackedRecordSource,
  resolvePublishOptions
} from './packed-record-source.js';

describe('packed record sources', () => {
  it('distinguishes registered external producers from copied or unbranded objects', () => {
    const bytes = new Uint8Array(48);
    const source = { bytes, capacity: 1, count: 1, kind: 'marker' as const, featureIds: null };
    registerExternalPackedRecordSource(source, { bytes, cacheable: false, version: 2 });
    expect(isPackedRecordSource(source)).toBe(true);
    expect(isExternalPackedRecordSource(source)).toBe(true);
    expect(getPackedRecordKind(source)).toBe('marker');
    expect(getPackedRecordBytes(source)).toBe(bytes);
    expect(isPackedRecordSource({ ...source })).toBe(false);
    expect(
      getPackedRecordState({ [PACKED_RECORD_STATE]: () => ({ bytes: [], cacheable: true, version: 0 }) })
    ).toBeUndefined();
    for (const input of [null, undefined, 1, 'marker', {}]) expect(isPackedRecordSource(input)).toBe(false);
    const buffer = new MarkerBuffer({ capacity: 1 });
    expect(isPackedRecordSource(buffer)).toBe(true);
    expect(isExternalPackedRecordSource(buffer)).toBe(false);
  });

  it('extends a publication to initialize newly activated records while keeping shrinks narrow', () => {
    expect(
      resolvePublishOptions({
        capacity: 8,
        currentActiveCount: 2,
        sourceActiveCount: 6,
        requested: { start: 4, count: 1 }
      })
    ).toEqual({ activeCount: 6, start: 2, count: 4 });
    expect(
      resolvePublishOptions({
        capacity: 8,
        currentActiveCount: 6,
        sourceActiveCount: 2,
        requested: { start: 1, count: 1 }
      })
    ).toEqual({ activeCount: 2, start: 1, count: 1 });
    expect(() => resolvePublishOptions({ capacity: 8, currentActiveCount: 2, sourceActiveCount: 9 })).toThrow(
      RangeError
    );
    expect(() =>
      resolvePublishOptions({
        capacity: 8,
        currentActiveCount: 2,
        sourceActiveCount: 2,
        requested: { start: 7, count: 2 }
      })
    ).toThrow(RangeError);
  });
});
