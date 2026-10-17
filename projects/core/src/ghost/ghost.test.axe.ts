// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import '@nvidia-elements/core/ghost/define.js';

describe('ghost accessibility', () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  it('keeps preview presentation outside the accessible interface', async () => {
    fixture = await createFixture(html`
      <nve-ghost>
        <span slot="label">Editor</span>
        <button type="button">Preview control</button>
      </nve-ghost>
    `);
    await elementIsStable(fixture.querySelector('nve-ghost')!);
    expect((await runAxe(['nve-ghost'])).violations).toEqual([]);
  });
});
