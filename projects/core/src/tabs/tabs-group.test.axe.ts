// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { TabsGroup } from '@nvidia-elements/core/tabs';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/button/define.js';

describe(TabsGroup.metadata.tag, () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tabs-group id="tab-group">
        <nve-tabs>
          <nve-tabs-item selected command="--toggle" commandfor="tab-group" value="overview">Overview</nve-tabs-item>
          <nve-tabs-item command="--toggle" commandfor="tab-group" value="details">Details</nve-tabs-item>
        </nve-tabs>
        <div slot="overview">Overview panel</div>
        <div slot="details">Details panel</div>
      </nve-tabs-group>
      <nve-button command="--toggle" commandfor="tab-group" value="details">Details</nve-button>
    `);

    await elementIsStable(fixture.querySelector(TabsGroup.metadata.tag)!);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([TabsGroup.metadata.tag], {
      rules: { 'color-contrast': { enabled: false } }
    });
    expect(results.violations.length).toBe(0);
  });
});
