// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import '@nvidia-elements/core/meter/define.js';

describe('nve-meter-group', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-meter-group aria-label="Storage" style="width: 200px">
        <nve-meter aria-label="Apps" value="20" color="blue-cobalt"></nve-meter>
        <nve-meter aria-label="Media" value="30" color="teal-cyan"></nve-meter>
        <nve-meter aria-label="Available" value="0" color="gray-slate"></nve-meter>
      </nve-meter-group>`);
    await Promise.all(
      Array.from(fixture.querySelectorAll<HTMLElement>('nve-meter, nve-meter-group')).map(element =>
        elementIsStable(element)
      )
    );
  });

  afterEach(() => removeFixture(fixture));

  it('should pass axe for named measurements', async () => {
    const results = await runAxe(['nve-meter-group']);
    expect(results.violations.length).toBe(0);
  });
});
