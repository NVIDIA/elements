// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Accordion } from '@nvidia-elements/core/accordion';
import '@nvidia-elements/core/accordion/define.js';

describe(Accordion.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
    <nve-accordion-group>
      <nve-accordion>
        <nve-accordion-header>heading</nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
      <nve-accordion>
        <nve-accordion-header>heading</nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>`);

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-accordion')).toBe(true);
    expect(result.includes('nve-accordion-group')).toBe(true);
    expect(result.includes('nve-accordion-header')).toBe(true);
    expect(result.includes('nve-accordion-content')).toBe(true);
  });
});
