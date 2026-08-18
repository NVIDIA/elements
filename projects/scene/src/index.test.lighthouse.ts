// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { webgpuLighthouseRunner } from '@internals/vite';

describe('lighthouse report', () => {
  test('@nvidia-elements/scene JS Bundles should remain within compressed bundle limits', async () => {
    const report = await webgpuLighthouseRunner.getReport(
      'bundles',
      /* html */ `
      <script type="module">
        import('@nvidia-elements/scene');
      </script>
    `
    );

    // The initial Scene package, including model and heightfield compilation, establishes this public-bundle baseline; texture capture remains deferred.
    expect(report.payload.javascript.kb).toBeLessThan(51);
  });
});
