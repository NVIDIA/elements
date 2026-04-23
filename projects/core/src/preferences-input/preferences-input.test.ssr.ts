// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { PreferencesInput } from '@nvidia-elements/core/preferences-input';
import '@nvidia-elements/core/preferences-input/define.js';

describe(PreferencesInput.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-preferences-input></nve-preferences-input>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-preferences-input')).toBe(true);
  });
});
