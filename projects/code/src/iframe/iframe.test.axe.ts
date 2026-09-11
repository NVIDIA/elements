// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Iframe } from '@nvidia-elements/code/iframe';
import '@nvidia-elements/code/iframe/define.js';

describe(Iframe.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Iframe;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-iframe aria-label="iframe test"></nve-iframe>`);
    element = fixture.querySelector<Iframe>(Iframe.metadata.tag)!;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Iframe.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
