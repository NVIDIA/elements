// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ScrollBox } from '@nvidia-elements/foundations/scroll-box';
import '@nvidia-elements/foundations/scroll-box/define.js';

describe(ScrollBox.metadata.tag, () => {
  it.each(['off', 'follow', 'always'] as const)(
    'should render auto-scroll="%s" without browser measurements',
    async mode => {
      const result = await ssrRunner.render(html`
      <nve-scroll-box orientation="vertical" auto-scroll=${mode}>
        <p nve-text="body">Conversation content</p>
      </nve-scroll-box>
    `);
      expect(result).toContain(`auto-scroll="${mode}"`);
      expect(result).toContain('Conversation content');
      expect(result).toContain('shadowroot="open"');
    }
  );

  it.each([false, true])('should render without browser measurements with scroll shadows %s', async shadows => {
    const result = await ssrRunner.render(html`
      <nve-scroll-box orientation="vertical" ?scroll-shadow=${shadows} aria-label="Activity">
        <p nve-text="body">Activity content</p>
      </nve-scroll-box>
    `);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-scroll-box');
    expect(result).toContain('Activity content');
    expect(result).not.toMatch(/<nve-scroll-box\b[^>]*\btabindex=/);
    expect(result.includes('class="shadow-layer"')).toBe(shadows);
  });
});
