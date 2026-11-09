// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { piLogger } from './logging.js';

afterEach(() => vi.restoreAllMocks());

describe('piLogger', () => {
  it.each(['info', 'warn'] as const)('forwards structured %s entries without serializing or changing them', level => {
    const log = vi.spyOn(console, level).mockImplementation(() => {});
    const entry = { event: 'validation', count: 2, details: { failed: false } };
    piLogger[level](entry);
    expect(log).toHaveBeenCalledExactlyOnceWith(entry);
    expect(log.mock.calls[0]?.[0]).toBe(entry);
  });
});
