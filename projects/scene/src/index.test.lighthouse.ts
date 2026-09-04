// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('lighthouse report', () => {
  test('@nvidia-elements/scene JS Bundles should remain within compressed bundle limits', async () => {
    const report = await lighthouseRunner.getReport(
      'bundles',
      /* html */ `
      <script type="module">
        import('@nvidia-elements/scene');
      </script>
    `
    );
    // Publication, typed source, and explicit pick APIs establish a 65.89 KB measured baseline.
    // Keep roughly 3% headroom for compression variation.
    expect(report.payload.javascript.kb).toBeLessThan(70);
  });
});
