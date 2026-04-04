// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe, beforeAll } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('lighthouse report', () => {
  let report: { payload: { css: { kb: number, requests: { [key: string]: { kb: number } } } } };
  beforeAll(async () => {
    report = await lighthouseRunner.getReport('index.css', /* html */`
      <script type="module">
        import('@nvidia-elements/styles/layout.css');
        import('@nvidia-elements/styles/typography.css');
        import('@nvidia-elements/styles/view-transitions.css');
        import('@nvidia-elements/styles/labs/layout-container.css');
        import('@nvidia-elements/styles/labs/layout-viewport.css');
      </script>
    `);
  });

  test('layout.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['layout.css']!.kb).toBeLessThan(1.8);
  });

  test('typography.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['typography.css']!.kb).toBeLessThan(1.65);
  });

  test('view-transitions.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['view-transitions.css']!.kb).toBeLessThan(1);
  });

  test('labs/layout-container.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['layout-container.css']!.kb).toBeLessThan(1.94);
  });

  test('labs/layout-viewport.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['layout-viewport.css']!.kb).toBeLessThan(1.72);
  });
});

describe('lighthouse bundle report', () => {
  let report: { payload: { css: { kb: number, requests: { [key: string]: { kb: number } } } } };
  beforeAll(async () => {
    report = await lighthouseRunner.getReport('index.css', /* html */`
      <script type="module">
        import('@nvidia-elements/styles/bundles/index.css');
      </script>
    `);
  });

  test('bundles/index.css should remain within compressed bundle limits', async () => {
    expect(report.payload.css.requests['index.css']!.kb).toBeLessThan(3.1);
  });
});
