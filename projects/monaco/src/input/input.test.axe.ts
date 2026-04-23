// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MonacoInput } from '@nvidia-elements/monaco/input';
import '@nvidia-elements/monaco/input/define.js';

describe(MonacoInput.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: MonacoInput;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-input></nve-monaco-input>
    `);
    element = fixture.querySelector(MonacoInput.metadata.tag);

    await untilEvent(element, 'ready');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([MonacoInput.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
