// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { getWebGPUTestMode, WebGPUTestRunner } from '@internals/vite/webgpu';
import type { WebGPUTestSession } from '@internals/vite/webgpu';

interface PixelCoverage {
  readonly minimum: number;
  readonly maximum: number;
  readonly mean: number;
  readonly black: number;
  readonly pixels: number;
}

async function surfacePixels(session: WebGPUTestSession): Promise<PixelCoverage> {
  const png = await session.page.screenshot();
  return session.page.evaluate(async encoded => {
    const image = await createImageBitmap(new Blob([new Uint8Array(encoded)], { type: 'image/png' }));
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('The coverage probe requires a 2D canvas.');
    context.drawImage(image, 0, 0);
    image.close();
    const bytes = context.getImageData(288, 208, 64, 64).data;
    let minimum = 255;
    let maximum = 0;
    let sum = 0;
    let black = 0;
    for (let index = 0; index < bytes.length; index += 4) {
      const red = bytes[index] ?? 0;
      minimum = Math.min(minimum, red);
      maximum = Math.max(maximum, red);
      sum += red;
      if (red < 10) black += 1;
    }
    return { minimum, maximum, mean: sum / (bytes.length / 4), black, pixels: bytes.length / 4 };
  }, Array.from(png));
}

describe.runIf(getWebGPUTestMode() === 'check')('opaque raster coverage through production shaders', () => {
  const runner = new WebGPUTestRunner({
    projectRoot: resolve(import.meta.dirname, '../../..'),
    harnessPath: 'performance/alpha-coverage.html',
    mode: 'check'
  });

  beforeAll(async () => runner.open());
  afterAll(async () => runner.close());

  test.each(['mesh', 'body', 'cube', 'triangles'])(
    'covers every interior pixel of an opaque %s and preserves partial transparency',
    async kind => {
      const session = await runner.load({ profile: kind, viewport: { width: 640, height: 480 } });
      try {
        const opaque = await surfacePixels(session);
        expect(opaque.black, JSON.stringify(opaque)).toBe(0);
        expect(opaque.minimum).toBeGreaterThan(100);
        expect(opaque.maximum - opaque.minimum).toBeLessThanOrEqual(2);
        await session.call('triggerUpdate', 0.5);
        const partial = await surfacePixels(session);
        expect(partial.black, JSON.stringify(partial)).toBe(0);
        expect(partial.mean).toBeGreaterThan(opaque.mean * 0.4);
        expect(partial.mean).toBeLessThan(opaque.mean * 0.9);
        if (kind === 'mesh') {
          for (const alpha of [0.9999, 0.9999995]) {
            await session.call('triggerUpdate', alpha);
            const nearOpaque = await surfacePixels(session);
            expect(nearOpaque.black, JSON.stringify({ alpha, nearOpaque })).toBe(0);
            expect(nearOpaque.minimum).toBeGreaterThan(100);
          }
        }
        await session.call('triggerUpdate', 0);
        const invisible = await surfacePixels(session);
        expect(invisible.maximum).toBe(0);
        expect(session.errors).toEqual([]);
      } finally {
        await session.call('teardown');
        await session.close();
      }
    }
  );
});
