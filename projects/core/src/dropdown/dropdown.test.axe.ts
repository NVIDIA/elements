// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/dropdown/define.js';

describe(Dropdown.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Dropdown;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button popovertarget="dropdown">button</button>
      <nve-dropdown id="dropdown" closable>hello</nve-dropdown>
    `);
    element = fixture.querySelector(Dropdown.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Dropdown.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
