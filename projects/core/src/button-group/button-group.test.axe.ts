// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ButtonGroup } from '@nvidia-elements/core/button-group';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(ButtonGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ButtonGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-button-group>
      <nve-icon-button pressed icon-name="split-vertical" aria-label="split vertical"></nve-icon-button>
      <nve-icon-button icon-name="split-horizontal" aria-label="split horizontal"></nve-icon-button>
      <nve-icon-button icon-name="split-none" aria-label="split none"></nve-icon-button>
    </nve-button-group>
    `);
    element = fixture.querySelector(ButtonGroup.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([ButtonGroup.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
