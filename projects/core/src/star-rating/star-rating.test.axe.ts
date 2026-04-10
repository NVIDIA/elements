// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { StarRating } from '@nvidia-elements/core/star-rating';
import '@nvidia-elements/core/star-rating/define.js';

describe(StarRating.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: StarRating;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-star-rating>
        <label>label</label>
        <input type="range" />
        <nve-control-message>message</nve-control-message>
      </nve-star-rating>
    `);
    element = fixture.querySelector(StarRating.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([StarRating.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
