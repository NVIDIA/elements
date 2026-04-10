// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Search } from '@nvidia-elements/core/search';
import '@nvidia-elements/core/search/define.js';

describe(Search.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Search;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-search>
        <label>label</label>
        <input type="search" />
      </nve-search>
    `);
    element = fixture.querySelector(Search.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Search.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
