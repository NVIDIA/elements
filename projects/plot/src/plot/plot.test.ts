// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Plot } from '@nvidia-elements/plot/plot';
import '@nvidia-elements/plot/plot/define.js';

describe(Plot.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Plot;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-plot></nve-plot>
    `);
    element = fixture.querySelector(Plot.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Plot.metadata.tag)).toBeDefined();
  });
});
