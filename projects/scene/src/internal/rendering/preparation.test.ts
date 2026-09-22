// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from 'vitest';
import { beginPreparation, continuePreparation, createPreparationContext } from './preparation.js';
import { configureSceneTesting, resetSceneTesting } from '../testing/scene.js';

afterEach(resetSceneTesting);
describe('preparation scheduling', () => {
  it.each([beginPreparation, continuePreparation])('checks cancellation after %s yields', async operation => {
    let current = true;
    let release = () => {};
    const context = {
      isCurrent: () => current,
      yield: () =>
        new Promise<void>(resolve => {
          release = resolve;
        })
    };
    const result = operation(context);
    current = false;
    release();
    await expect(result).resolves.toBe(false);
  });

  it('uses the platform scheduler and resumes current work', async () => {
    const yieldForPreparation = vi.fn(async () => {});
    configureSceneTesting({ yieldForPreparation });
    const context = createPreparationContext(() => true);
    await expect(beginPreparation(context)).resolves.toBe(true);
    await expect(continuePreparation(context)).resolves.toBe(true);
    expect(yieldForPreparation).toHaveBeenCalledTimes(2);
  });
});
