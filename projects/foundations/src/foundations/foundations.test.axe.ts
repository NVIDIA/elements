// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Foundations } from '@nvidia-elements/foundations/foundations';
import '@nvidia-elements/foundations/foundations/define.js';

describe(Foundations.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Foundations;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-foundations><p nve-text="body">Container content</p></nve-foundations>
    `);
    element = fixture.querySelector(Foundations.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Foundations.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
