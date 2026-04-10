// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Toast } from '@nvidia-elements/core/toast';
import '@nvidia-elements/core/toast/define.js';

describe(Toast.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Toast;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <button popovertarget="toast">button</button>
      <nve-toast id="toast">toast</nve-toast>
    `);
    element = fixture.querySelector(Toast.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Toast.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
