// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Viewport } from '@nvidia-elements/viewport/viewport';
import '@nvidia-elements/viewport/viewport/define.js';

describe(Viewport.metadata.tag, () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  it('should pass axe check with interactive slotted content', async () => {
    fixture = await createFixture(html`
      <nve-viewport behavior-pan behavior-zoom style="width: 400px; height: 300px">
        <form>
          <label>Project name <input name="name" /></label>
          <button type="submit">Save</button>
        </form>
      </nve-viewport>
    `);
    const element = fixture.querySelector('nve-viewport');
    if (!element) throw new Error('Viewport fixture is missing.');
    await elementIsStable(element);

    const results = await runAxe([Viewport.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
