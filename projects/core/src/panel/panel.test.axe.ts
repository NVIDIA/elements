// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Panel } from '@nvidia-elements/core/panel';
import '@nvidia-elements/core/panel/define.js';

describe(Panel.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Panel;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-panel behavior-expand expanded style="width:280px; height:100vh">
        <nve-panel-header>
          <div slot="title">Title</div>
          <div slot="subtitle"></div>
        </nve-panel-header>
        <nve-panel-content>
          <p nve-text="body">content</p>
        </nve-panel-content>
      </nve-panel>
    `);
    element = fixture.querySelector(Panel.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Panel.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
