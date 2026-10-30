// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';
import { template, readyCheck } from './fixtures.test.visual.js';

describe('monaco input visual', () => {
  test('input should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('monaco.dark', template('dark'), { network: true, waitFor: readyCheck });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });
});
