// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Breadcrumb } from '@nvidia-elements/core/breadcrumb';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(Breadcrumb.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Breadcrumb;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-breadcrumb>
        <nve-icon-button icon-name="home" aria-label="link to first page"></nve-icon-button>
        <nve-button>Item</nve-button>
        <span>Static item</span>
      </nve-breadcrumb>
    `);
    element = fixture.querySelector(Breadcrumb.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Breadcrumb.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
