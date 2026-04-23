// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Input } from '@nvidia-elements/core/input';
import '@nvidia-elements/core/input/define.js';

describe(Input.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Input;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-input>
        <label>label</label>
        <input type="text" />
      </nve-input>
    `);
    element = fixture.querySelector(Input.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Input.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
