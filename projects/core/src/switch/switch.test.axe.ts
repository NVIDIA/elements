// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Switch } from '@nvidia-elements/core/switch';
import '@nvidia-elements/core/switch/define.js';

describe(Switch.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Switch;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-switch>
        <label>label</label>
        <input type="checkbox" />
      </nve-switch>
    `);
    element = fixture.querySelector(Switch.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Switch.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
