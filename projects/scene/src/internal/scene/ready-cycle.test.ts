// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createReadyCycle } from './ready-cycle.js';

describe(createReadyCycle.name, () => {
  it('should settle only once when resolved', async () => {
    const cycle = createReadyCycle();
    cycle.resolve();
    cycle.resolve();
    cycle.reject(new Error('ignored'));

    await expect(cycle.promise).resolves.toBeUndefined();
    expect(cycle.settled).toBe(true);
  });

  it('should settle only once when rejected', async () => {
    const cycle = createReadyCycle();
    const error = new Error('failed');
    cycle.reject(error);
    cycle.reject(new Error('ignored'));
    cycle.resolve();

    await expect(cycle.promise).rejects.toBe(error);
    expect(cycle.settled).toBe(true);
  });
});
