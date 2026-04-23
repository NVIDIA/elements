// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Toolbar } from '@nvidia-elements/core/toolbar';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';

describe(Toolbar.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-toolbar>
      <nve-button-group behavior-select="single" container="flat">
        <nve-icon-button pressed icon-name="bars-3-bottom-left" aria-label="align left"></nve-icon-button>
        <nve-icon-button icon-name="bars-3-bottom-right" aria-label="align right"></nve-icon-button>
        <nve-icon-button icon-name="bars-4" aria-label="align"></nve-icon-button>
      </nve-button-group>

      <nve-divider orientation="vertical"></nve-divider>

      <nve-button-group behavior-select="multi" container="flat">
        <nve-icon-button icon-name="bold" size="sm" aria-label="bold"></nve-icon-button>
        <nve-icon-button icon-name="italic" size="sm" aria-label="italic"></nve-icon-button>
        <nve-icon-button icon-name="strikethrough" size="sm" aria-label="strikethrough"></nve-icon-button>
      </nve-button-group>

      <nve-button slot="suffix" container="flat">Save</nve-button>
    </nve-toolbar>
    `);
    element = fixture.querySelector(Toolbar.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Toolbar.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
