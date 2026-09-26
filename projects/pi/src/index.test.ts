// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import elementsExtension, { VERSION } from './index.js';

vi.mock('./auto-validation.js', () => ({ registerElementsAutoValidation: vi.fn() }));
vi.mock('./tools.js', () => ({ registerElementsTools: vi.fn() }));

describe('@nvidia-elements/pi', () => {
  it('should export a release version placeholder', () => {
    expect(VERSION).toBe('0.0.0');
  });

  it('should initialize the Pi adapter', async () => {
    const { registerElementsAutoValidation } = await import('./auto-validation.js');
    const { registerElementsTools } = await import('./tools.js');
    const pi = {} as ExtensionAPI;
    elementsExtension(pi);
    expect(process.env.ELEMENTS_ENV).toBe('pi');
    expect(registerElementsTools).toHaveBeenCalledWith(pi);
    expect(registerElementsAutoValidation).toHaveBeenCalledWith(pi);
  });
});
