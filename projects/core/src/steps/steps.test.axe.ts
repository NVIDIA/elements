// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { StepsItem, Steps } from '@nvidia-elements/core/steps';
import '@nvidia-elements/core/steps/define.js';

describe(Steps.metadata.tag, () => {
  let fixture: HTMLElement;
  let steps: Steps;
  let item: StepsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-steps>
        <nve-steps-item>Step 1</nve-steps-item>
        <nve-steps-item selected>Step 2</nve-steps-item>
        <nve-steps-item disabled>Step 3</nve-steps-item>
      </nve-steps>
    `);
    steps = fixture.querySelector(Steps.metadata.tag);
    item = fixture.querySelector(StepsItem.metadata.tag);

    await elementIsStable(steps);
    await elementIsStable(item);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Steps.metadata.tag], {
      rules: { 'color-contrast': { enabled: false } }
    });
    expect(results.violations.length).toBe(0);
  });
});
