// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Pulse } from '@nvidia-elements/core/pulse';
import '@nvidia-elements/core/pulse/define.js';

describe(Pulse.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Pulse;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-pulse></nve-pulse>
    `);
    element = fixture.querySelector(Pulse.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Pulse.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
