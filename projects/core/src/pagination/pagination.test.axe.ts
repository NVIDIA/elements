// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Pagination } from '@nvidia-elements/core/pagination';
import '@nvidia-elements/core/pagination/define.js';

describe(Pagination.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Pagination;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-pagination name="page" .value=${1} .step=${10} .items=${100}></nve-pagination>
      </form>
    `);
    element = fixture.querySelector(Pagination.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Pagination.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
