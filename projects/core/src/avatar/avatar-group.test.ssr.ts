// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { AvatarGroup } from '@nvidia-elements/core/avatar';
import '@nvidia-elements/core/avatar/define.js';

describe(AvatarGroup.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-avatar-group>
        <nve-avatar color="red-cardinal">AV</nve-avatar>
        <nve-avatar color="blue-cobalt">AV</nve-avatar>
        <nve-avatar color="green-grass">AV</nve-avatar>
        <nve-avatar>+3</nve-avatar>
      </nve-avatar-group>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-avatar-group')).toBe(true);
    expect(result.includes('nve-avatar')).toBe(true);
  });
});
