// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { getWebGPUTestMode, WebGPUTestRunner, type WebGPUTestSession } from '@internals/vite/webgpu';

async function comparePixels(session: WebGPUTestSession, baseline: number[]) {
  const current = Array.from(await session.page.screenshot());
  return session.page.evaluate(
    async images => {
      const pixels = await Promise.all(
        images.map(async encoded => {
          const image = await createImageBitmap(new Blob([new Uint8Array(encoded)], { type: 'image/png' }));
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('The lighting probe requires a 2D canvas.');
          context.drawImage(image, 0, 0);
          image.close();
          return context.getImageData(0, 0, canvas.width, canvas.height).data;
        })
      );
      let changed = 0;
      let foreground = 0;
      for (let index = 0; index < pixels[0]!.length; index += 4) {
        if (pixels[0]![index]! > 10) foreground += 1;
        if ([0, 1, 2].some(channel => Math.abs(pixels[0]![index + channel]! - pixels[1]![index + channel]!) > 2))
          changed += 1;
      }
      return { changed, foreground };
    },
    [baseline, current]
  );
}

describe.runIf(getWebGPUTestMode() === 'check')('lighting across frame and instance poses', () => {
  const runner = new WebGPUTestRunner({
    projectRoot: resolve(import.meta.dirname, '../../..'),
    harnessPath: 'performance/frame-lighting.html',
    mode: 'check'
  });
  beforeAll(async () => runner.open());
  afterAll(async () => runner.close());

  test.each(['marker', 'mesh'])('renders the same %s pose with matching pixels and picking', async kind => {
    const session = await runner.load({ profile: kind, viewport: { width: 640, height: 480 } });
    try {
      const baseline = Array.from(await session.page.screenshot());
      for (const mode of ['instance', 'split']) {
        await session.call('triggerUpdate', mode);
        const comparison = await comparePixels(session, baseline);
        expect(comparison.foreground).toBeGreaterThan(5_000);
        expect(comparison.changed, JSON.stringify({ mode, comparison })).toBeLessThan(50);
        expect(await session.call('pick')).toEqual({ featureId: 42, kind: 'instance' });
      }
      expect(session.errors).toEqual([]);
    } finally {
      await session.call('teardown');
      await session.close();
    }
  });
});
