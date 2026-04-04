// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Avatar, AvatarGroup } from '@nvidia-elements/core/avatar';
import '@nvidia-elements/core/avatar/define.js';

describe(AvatarGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let avatarGroup: AvatarGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-avatar-group>
        <nve-avatar color="red-cardinal">Av</nve-avatar>
        <nve-avatar color="blue-cobalt">AV</nve-avatar>
        <nve-avatar color="green-grass">AV</nve-avatar>
        <nve-avatar>+3</nve-avatar>
    </nve-avatar-group>
    `);
    avatarGroup = fixture.querySelector(AvatarGroup.metadata.tag);
    await elementIsStable(avatarGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get(Avatar.metadata.tag)).toBeDefined();
    expect(customElements.get(AvatarGroup.metadata.tag)).toBeDefined();
  });

  it('should provide a aria role of group to describe content', async () => {
    await elementIsStable(avatarGroup);
    expect(avatarGroup._internals.role).toBe('group');
  });
});
