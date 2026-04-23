// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { AvatarGroup } from '@nvidia-elements/core/avatar';
import '@nvidia-elements/core/avatar/define.js';

describe(AvatarGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: AvatarGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
        <nve-avatar-group>
            <nve-avatar color="red-cardinal">AV</nve-avatar>
            <nve-avatar color="blue-cobalt">AV</nve-avatar>
            <nve-avatar color="green-grass">AV</nve-avatar>
            <nve-avatar>+3</nve-avatar>
        </nve-avatar-group>
    `);
    element = fixture.querySelector(AvatarGroup.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([AvatarGroup.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
