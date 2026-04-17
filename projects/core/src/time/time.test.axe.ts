// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Time } from '@nvidia-elements/core/time';
import '@nvidia-elements/core/time/define.js';

describe(Time.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Time;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-time>
        <label>label</label>
        <input type="time" />
      </nve-time>
    `);
    element = fixture.querySelector(Time.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Time.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
