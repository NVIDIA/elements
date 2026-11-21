// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { assertSynchronousCapture, SnapshotCapture, SynchronousCaptureLimitError } from './capture.js';
import { PREPARATION_CHUNK_SIZE } from './preparation.js';

describe('snapshot capture', () => {
  it('allows one synchronous chunk and rejects larger inputs', () => {
    expect(() => assertSynchronousCapture(PREPARATION_CHUNK_SIZE, 'grid')).not.toThrow();
    expect(() => assertSynchronousCapture(PREPARATION_CHUNK_SIZE + 1, 'grid')).toThrow(SynchronousCaptureLimitError);
  });

  it('rejects superseded work without reporting it as a capture failure', async () => {
    const onFailure = vi.fn();
    const capture = new SnapshotCapture(onFailure);
    const first = capture.run(async () => {});
    const second = capture.run(async () => {});

    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await expect(second).resolves.toBeUndefined();
    expect(capture.complete).toBe(second);
    expect(onFailure).not.toHaveBeenCalled();
  });
});
