// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/button/define.js';

describe(Button.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-button>button</nve-button>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-button')).toBe(true);
  });

  it('should pass ssr check with associated external form', async () => {
    const result = await ssrRunner.render(html`
        <form id="test-form"></form>
        <nve-button form="test-form" type="submit">submit</nve-button>
        <nve-button .form=${'test-form-attr'} type="submit">submit</nve-button>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-button')).toBe(true);
    expect(result.includes('form="test-form-attr"')).toBe(true);
  });
});
