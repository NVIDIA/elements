// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { verifyLabelBrowserCopy } from './browser-probe.js';

describe('label browser copy probe', () => {
  it.each([
    ['accepts a mapped magenta pixel', new Uint8Array([255, 0, 255, 255]), true],
    ['rejects a blank copied pixel', new Uint8Array([0, 0, 0, 0]), false]
  ])('%s', async (_, pixel, expected) => {
    const { device } = createDevice({ pixel });

    await expect(
      verifyLabelBrowserCopy({ device, signature: 'current-dictionaries', slot: {} as HTMLSlotElement })
    ).resolves.toBe(expected);
  });

  it('returns false without experimental copy support', async () => {
    const { device } = createDevice({ pixel: new Uint8Array([255, 0, 255, 255]) });
    Reflect.deleteProperty(device.queue, 'copyElementImageToTexture');

    await expect(
      verifyLabelBrowserCopy({ device, signature: 'current-dictionaries', slot: {} as HTMLSlotElement })
    ).resolves.toBe(false);
  });

  it('returns false when a device cannot allocate the probe resources', async () => {
    const { device } = createDevice({ pixel: new Uint8Array([255, 0, 255, 255]) });
    Reflect.deleteProperty(device, 'createTexture');

    await expect(
      verifyLabelBrowserCopy({ device, signature: 'current-dictionaries', slot: {} as HTMLSlotElement })
    ).resolves.toBe(false);
  });

  it('returns false when the command encoder cannot read the probe texture', async () => {
    const { device } = createDevice({ pixel: new Uint8Array([255, 0, 255, 255]) });
    Reflect.set(device, 'createCommandEncoder', () => ({ finish: () => ({}) }));

    await expect(
      verifyLabelBrowserCopy({ device, signature: 'current-dictionaries', slot: {} as HTMLSlotElement })
    ).resolves.toBe(false);
  });

  it('returns false and cleans up after a mapped-read rejection', async () => {
    const { device, state } = createDevice({ mapRejects: true, pixel: new Uint8Array([255, 0, 255, 255]) });

    await expect(
      verifyLabelBrowserCopy({ device, signature: 'current-dictionaries', slot: {} as HTMLSlotElement })
    ).resolves.toBe(false);
    expect(state.destroyed).toBe(2);
    expect(state.unmapped).toBe(1);
  });
});

function createDevice(options: { mapRejects?: boolean; pixel: Uint8Array }) {
  const state = { destroyed: 0, unmapped: 0 };
  const buffer = {
    destroy: () => (state.destroyed += 1),
    getMappedRange: () => options.pixel.buffer,
    mapAsync: () => (options.mapRejects ? Promise.reject(new Error('map failed')) : Promise.resolve()),
    unmap: () => (state.unmapped += 1)
  };
  const texture = { createView: () => ({}), destroy: () => (state.destroyed += 1) };
  const device = {
    createBuffer: () => buffer,
    createCommandEncoder: () => ({
      copyTextureToBuffer: () => undefined,
      finish: () => ({})
    }),
    createTexture: () => texture,
    lost: Promise.resolve({}),
    queue: {
      copyElementImageToTexture: () => undefined,
      submit: () => undefined
    }
  };
  return { device, state };
}
