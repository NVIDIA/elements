// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe, beforeAll } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('lighthouse report', () => {
  let report: { payload: { css: { kb: number, requests: { [key: string]: { kb: number } } } } };
  beforeAll(async () => {
    report = await lighthouseRunner.getReport('index.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/index.css');
        import('@nvidia-elements/themes/compact.css');
        import('@nvidia-elements/themes/dark.css');
        import('@nvidia-elements/themes/high-contrast.css');
        import('@nvidia-elements/themes/reduced-motion.css');
        import('@nvidia-elements/themes/debug.css');
      </script>
    `);
  });

  test('index.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['index.css']!.kb).toBeLessThan(6.1);
  });

  test('compact.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['compact.css']!.kb).toBeLessThan(0.5);
  });

  test('dark.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['dark.css']!.kb).toBeLessThan(4.6);
  });

  test('high-contrast.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['high-contrast.css']!.kb).toBeLessThan(1);
  });

  test('reduced-motion.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['reduced-motion.css']!.kb).toBeLessThan(0.7);
  });

  test('debug.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['debug.css']!.kb).toBeLessThan(0.75);
  });
});

describe('lighthouse report', () => {
  let report: { payload: { css: { kb: number, requests: { [key: string]: { kb: number } } } } };
  beforeAll(async () => {
    report = await lighthouseRunner.getReport('index.css', /* html */`
      <script type="module">
        import('@nvidia-elements/themes/bundles/index.css');
      </script>
    `);
  });

  test('bundles/index.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['index.css']!.kb).toBeLessThan(9.8);
  });
});
