// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ViewportGridlines } from '@nvidia-elements/viewport/gridlines';
import '@nvidia-elements/viewport/viewport/define.js';
import '@nvidia-elements/viewport/gridlines/define.js';

describe(ViewportGridlines.metadata.tag, () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  it.each(['lines', 'dots', 'crosses'] as const)('should pass axe check with %s', async pattern => {
    fixture = await createFixture(html`
      <nve-viewport behavior-pan behavior-zoom style="width: 400px; height: 300px">
        <nve-viewport-gridlines pattern=${pattern}></nve-viewport-gridlines>
        <button type="button">Viewport content</button>
      </nve-viewport>
    `);
    const viewport = fixture.querySelector('nve-viewport');
    const gridlines = fixture.querySelector('nve-viewport-gridlines');
    if (!viewport || !gridlines) throw new Error('Gridlines fixture is missing.');
    await elementIsStable(viewport);
    await elementIsStable(gridlines);

    const results = await runAxe(['nve-viewport']);
    expect(results.violations.length).toBe(0);
  });
});
