// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { getData, attributes, elements } = vi.hoisted(() => {
  const loadedAttributes = [{ name: 'nve-text' }];
  const loadedElements = [{ name: 'nve-button' }];
  return {
    attributes: loadedAttributes,
    elements: loadedElements,
    getData: vi.fn(async () => ({ data: { attributes: loadedAttributes, elements: loadedElements } }))
  };
});

vi.mock('@internals/metadata', () => ({ ApiService: { getData } }));

afterAll(() => {
  vi.doUnmock('@internals/metadata');
  vi.resetModules();
});

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('metadata', () => {
  it('exports loaded attributes and elements and reuses the module result', async () => {
    const metadata = await import('./metadata.js');
    expect(metadata.globalAttributes).toBe(attributes);
    expect(metadata.elements).toBe(elements);
    expect(await import('./metadata.js')).toBe(metadata);
    expect(getData).toHaveBeenCalledTimes(1);
  });

  it('propagates metadata loading failures', async () => {
    getData.mockRejectedValueOnce(new Error('metadata unavailable'));
    await expect(import('./metadata.js')).rejects.toThrow('metadata unavailable');
  });
});
