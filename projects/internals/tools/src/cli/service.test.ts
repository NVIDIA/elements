// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { CliService } from './service.js';

vi.mock('./utils.js', () => ({
  performUpgrade: vi.fn()
}));

describe('CliService', () => {
  it('should have correct metadata on upgrade', () => {
    expect((CliService.upgrade as ToolMethod<unknown>).metadata.name).toBe('upgrade');
    expect((CliService.upgrade as ToolMethod<unknown>).metadata.summary).toBe(
      'Upgrade the Elements CLI (nve) to the latest version.'
    );
  });

  it('should delegate to performUpgrade', async () => {
    const { performUpgrade } = await import('./utils.js');
    vi.mocked(performUpgrade).mockResolvedValue({ upgrade: { message: 'done', status: 'success' } });

    const result = await CliService.upgrade();

    expect(performUpgrade).toHaveBeenCalledWith(undefined);
    expect(result.upgrade?.status).toBe('success');
  });

  it('should pass onProgress callback to performUpgrade', async () => {
    const { performUpgrade } = await import('./utils.js');
    vi.mocked(performUpgrade).mockResolvedValue({ upgrade: { message: 'done', status: 'success' } });
    const onProgress = vi.fn();

    await CliService.upgrade({ onProgress });

    expect(performUpgrade).toHaveBeenCalledWith(onProgress);
  });
});
