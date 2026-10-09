// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  beginPreparation,
  continuePreparation,
  createPreparationContext,
  resumePreparation,
  runPreparation,
  runPreparationSync
} from './preparation.js';
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

describe('bounded preparation traversal', () => {
  it('continues an enclosing task without another initial yield and closes cancelled work', async () => {
    const close = vi.fn();
    const continueWork = vi.fn();
    const trace: string[] = [];
    let current = true;
    let release = () => {};
    function* steps(): Generator<void, number, void> {
      try {
        trace.push('first chunk');
        yield;
        continueWork();
        return 1;
      } finally {
        close();
      }
    }
    const pending = resumePreparation(steps(), {
      isCurrent: () => current,
      yield: () => {
        trace.push('yield');
        return new Promise<void>(resolve => (release = resolve));
      }
    });

    expect(trace).toEqual(['first chunk', 'yield']);
    current = false;
    release();
    await expect(pending).resolves.toBeUndefined();
    expect(continueWork).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('returns completed continuation results without scheduling and checks their generation', async () => {
    function* steps(): Generator<void, number, void> {
      return 42;
    }
    const context = { isCurrent: () => true, yield: vi.fn(async () => {}) };

    await expect(resumePreparation(steps(), context)).resolves.toBe(42);
    await expect(resumePreparation(steps(), { ...context, isCurrent: () => false })).resolves.toBeUndefined();
    expect(context.yield).not.toHaveBeenCalled();
  });

  it('returns the same result through synchronous and scheduled execution', async () => {
    function* steps(): Generator<void, readonly number[], void> {
      const values = [1];
      yield;
      values.push(2);
      yield;
      return values;
    }
    const context = { isCurrent: () => true, yield: vi.fn(async () => {}) };

    expect(runPreparationSync(steps())).toEqual([1, 2]);
    await expect(runPreparation(steps(), context)).resolves.toEqual([1, 2]);
    expect(context.yield).toHaveBeenCalledTimes(3);
  });

  it('defers the first step and skips obsolete work before allocation', async () => {
    const allocate = vi.fn();
    let release = () => {};
    let current = true;
    function* steps(): Generator<void, number, void> {
      allocate();
      return 1;
    }
    const pending = runPreparation(steps(), {
      isCurrent: () => current,
      yield: () => new Promise<void>(resolve => (release = resolve))
    });

    expect(allocate).not.toHaveBeenCalled();
    current = false;
    release();
    await expect(pending).resolves.toBeUndefined();
    expect(allocate).not.toHaveBeenCalled();
  });

  it('closes cancelled work without executing the following chunk', async () => {
    const close = vi.fn();
    const continueWork = vi.fn();
    let yields = 0;
    function* steps(): Generator<void, number, void> {
      try {
        yield;
        continueWork();
        return 1;
      } finally {
        close();
      }
    }

    await expect(
      runPreparation(steps(), {
        isCurrent: () => yields < 2,
        yield: async () => {
          yields += 1;
        }
      })
    ).resolves.toBeUndefined();
    expect(continueWork).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it.each([runPreparation, resumePreparation])('discards an obsolete final result through %s', async run => {
    let current = true;
    function* steps(): Generator<void, number, void> {
      current = false;
      return 1;
    }

    await expect(run(steps(), { isCurrent: () => current, yield: async () => {} })).resolves.toBeUndefined();
  });

  it('propagates scheduling errors and closes suspended work', async () => {
    const error = new Error('Scheduling failed.');
    const close = vi.fn();
    function* steps(): Generator<void, number, void> {
      try {
        yield;
        return 1;
      } finally {
        close();
      }
    }
    const context = {
      isCurrent: () => true,
      yield: vi.fn<() => Promise<void>>().mockResolvedValueOnce(undefined).mockRejectedValueOnce(error)
    };

    await expect(runPreparation(steps(), context)).rejects.toBe(error);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('propagates traversal failures from both execution modes', async () => {
    const error = new Error('Preparation failed.');
    function* steps(): Generator<void, number, void> {
      yield;
      throw error;
    }

    expect(() => runPreparationSync(steps())).toThrow(error);
    await expect(runPreparation(steps(), { isCurrent: () => true, yield: async () => {} })).rejects.toBe(error);
  });
});
