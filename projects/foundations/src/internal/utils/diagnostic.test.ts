// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { diagnostic } from './diagnostic.js';

describe('diagnostic', () => {
  beforeEach(() => {
    vi.stubGlobal('process', { env: { NODE_ENV: 'development' } });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(document, 'dispatchEvent');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('warns on localhost and dispatches the diagnostic details', () => {
    const context = { itemCount: -1 };
    diagnostic('invalid configuration', context, 42);

    expect(console.warn).toHaveBeenCalledExactlyOnceWith('@nve: invalid configuration', context, 42);
    expect(document.dispatchEvent).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        type: 'NVE_ELEMENTS_LOG',
        detail: { type: 'warn', value: 'invalid configuration', args: [context, 42] }
      })
    );
  });

  it('reports diagnostics without a process global', () => {
    vi.stubGlobal('process', undefined);
    diagnostic('missing geometry');

    expect(console.warn).toHaveBeenCalledExactlyOnceWith('@nve: missing geometry');
    expect(document.dispatchEvent).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        type: 'NVE_ELEMENTS_LOG',
        detail: { type: 'warn', value: 'missing geometry', args: [] }
      })
    );
  });

  it('suppresses warnings and events in production', () => {
    vi.stubGlobal('process', { env: { NODE_ENV: 'production' } });
    diagnostic('invalid configuration');

    expect(console.warn).not.toHaveBeenCalled();
    expect(document.dispatchEvent).not.toHaveBeenCalled();
  });
});
