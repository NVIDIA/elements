// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { getGeometryDecoder, inferGeometryFormat, registerGeometryDecoder } from './decoders.js';

describe('geometry decoder registry', () => {
  it('normalizes extensions and resolves loaders without eagerly loading modules', () => {
    const loader = vi.fn(async () => ({ decode: async () => [] }));
    registerGeometryDecoder('.TestRegistry', loader);
    expect(getGeometryDecoder('TESTREGISTRY')).toBe(loader);
    expect(getGeometryDecoder('.testregistry')).toBe(loader);
    expect(loader).not.toHaveBeenCalled();
    expect(() => registerGeometryDecoder('testregistry', loader)).toThrow(TypeError);
    expect(() => registerGeometryDecoder('.STL', loader)).toThrow(TypeError);
  });

  it.each(['', '.', '..stl', 'st-l', ' stl', 'stl ', 'path/stl'])('rejects invalid extension %j', extension => {
    expect(() => registerGeometryDecoder(extension, async () => ({ decode: async () => [] }))).toThrow(TypeError);
    expect(() => getGeometryDecoder(extension)).toThrow(TypeError);
  });

  it('rejects missing decoders and non-function loaders', () => {
    expect(() => getGeometryDecoder('unregisteredformat')).toThrow(TypeError);
    // @ts-expect-error Validate malformed callers at the runtime boundary.
    expect(() => registerGeometryDecoder('invalidloader', undefined)).toThrow(TypeError);
  });

  it.each(['/arm.STL?download=obj#part', new URL('https://example.com/arm.stl?name=other.obj#mesh')])(
    'infers formats from the final path extension of %s',
    url => expect(inferGeometryFormat(url)).toBe('stl')
  );

  it.each(['/download', '/arm.stl/child', '/arm.unknown', '/download?name=arm.stl#part.stl'])(
    'does not infer formats from directories, queries, or fragments: %s',
    url => expect(() => inferGeometryFormat(url)).toThrow(TypeError)
  );
});
