// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { waitForLabelMutationPaint } from './overlay.js';

describe('label overlay paint wait', () => {
  it('removes its listener after paint and ignores a later timeout', async () => {
    vi.useFakeTimers();
    const target = new EventTarget();
    const remove = vi.spyOn(target, 'removeEventListener');
    const pending = waitForLabelMutationPaint(target, () => target.dispatchEvent(new Event('paint')), 20);
    await expect(pending).resolves.toBe(true);
    vi.advanceTimersByTime(20);
    expect(remove).toHaveBeenCalledWith('paint', expect.any(Function));
    vi.useRealTimers();
  });

  it('removes its listener after timeout and settles only once', async () => {
    vi.useFakeTimers();
    const target = new EventTarget();
    const remove = vi.spyOn(target, 'removeEventListener');
    const pending = waitForLabelMutationPaint(target, () => undefined, 20);
    vi.advanceTimersByTime(20);
    await expect(pending).resolves.toBe(false);
    target.dispatchEvent(new Event('paint'));
    expect(remove).toHaveBeenCalledWith('paint', expect.any(Function));
    vi.useRealTimers();
  });

  it('uses its default timeout and ignores reentrant paint while removing the listener', async () => {
    const target = new EventTarget();
    const nativeRemove = target.removeEventListener.bind(target);
    vi.spyOn(target, 'removeEventListener').mockImplementation((...arguments_) => {
      target.dispatchEvent(new Event('paint'));
      nativeRemove(...arguments_);
    });

    await expect(waitForLabelMutationPaint(target, () => target.dispatchEvent(new Event('paint')))).resolves.toBe(true);
  });
});
