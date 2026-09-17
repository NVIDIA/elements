// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Viewport } from '@nvidia-elements/core/viewport';
import '@nvidia-elements/core/viewport/define.js';

describe(Viewport.metadata.tag, () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  it('should pass axe check with interactive slotted content', async () => {
    fixture = await createFixture(html`
      <nve-viewport behavior-pan behavior-zoom style="width: 400px; height: 300px">
        <nve-viewport-gridlines></nve-viewport-gridlines>
        <form>
          <label>Project name <input name="name" /></label>
          <button type="submit">Save</button>
        </form>
      </nve-viewport>
    `);
    const element = fixture.querySelector(Viewport.metadata.tag);
    await elementIsStable(element);

    const results = await runAxe([Viewport.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
