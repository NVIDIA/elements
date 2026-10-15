// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ProgressDot } from '@nvidia-elements/core/progress-dot';
import '@nvidia-elements/core/progress-dot/define.js';

describe(ProgressDot.metadata.tag, () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progress-dot size="sm"></nve-progress-dot>
      <nve-progress-dot size="md" aria-label="Loading results"></nve-progress-dot>
      <span id="progress-dot-label">Generating response</span>
      <nve-progress-dot size="lg" aria-labelledby="progress-dot-label"></nve-progress-dot>
      <nve-progress-dot aria-label="Loading results" style="--animation-duration: 0s"></nve-progress-dot>
      <nve-progress-dot aria-hidden="true"></nve-progress-dot>
    `);
    await Promise.all([...fixture.querySelectorAll('nve-progress-dot')].map(element => elementIsStable(element)));
  });

  afterEach(() => removeFixture(fixture));

  it('should pass axe for all sizes and label sources', async () => {
    const results = await runAxe([ProgressDot.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
