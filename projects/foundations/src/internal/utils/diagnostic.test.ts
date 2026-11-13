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

  it('suppresses warnings and events away from localhost', async () => {
    const iframe = document.createElement('iframe');
    const loaded = new Promise<void>(resolve => {
      iframe.onload = () => resolve();
    });
    document.body.appendChild(iframe);
    await loaded;
    const frame = iframe.contentWindow;
    if (!frame) {
      iframe.remove();
      throw new Error('missing diagnostic frame');
    }

    // Location cannot be replaced on the test page. about:blank is a non-localhost realm.
    // Share the coverage store before that module initializes so its counters are collected.
    const coverageStore = '__VITEST_COVERAGE__';
    if (coverageStore in globalThis) {
      Reflect.set(frame, coverageStore, Reflect.get(globalThis, coverageStore));
    }

    try {
      const url = new URL('./diagnostic.js', import.meta.url).href;
      const imported: { diagnostic: typeof diagnostic } = await frame.eval(`import(${JSON.stringify(url)})`);
      const warn = vi.spyOn(frame.console, 'warn').mockImplementation(() => {});
      const dispatch = vi.spyOn(frame.document, 'dispatchEvent');
      imported.diagnostic('invalid configuration');

      expect(frame.location.hostname).not.toBe('localhost');
      expect(warn).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    } finally {
      iframe.remove();
    }
  });
});
