// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MenuGroup } from '@nvidia-elements/core/menu';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';

describe(MenuGroup.metadata.tag, () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-menu-group>
        Collapsed
        <nve-menu><nve-menu-item>Item</nve-menu-item></nve-menu>
      </nve-menu-group>
      <nve-menu-group expanded>
        <nve-icon name="folder" slot="prefix" aria-hidden="true"></nve-icon>
        Expanded
        <nve-dot slot="suffix" aria-label="2 projects">2</nve-dot>
        <nve-menu>
          <nve-menu-item current="page">Current item</nve-menu-item>
          <nve-menu-item>Other item</nve-menu-item>
        </nve-menu>
      </nve-menu-group>
      <nve-menu-group expanded disabled>
        Disabled
        <nve-menu><nve-menu-item>Visible item</nve-menu-item></nve-menu>
      </nve-menu-group>
    `);

    await Promise.all(
      Array.from(fixture.querySelectorAll<MenuGroup>(MenuGroup.metadata.tag)).map(element => elementIsStable(element))
    );
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([MenuGroup.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
