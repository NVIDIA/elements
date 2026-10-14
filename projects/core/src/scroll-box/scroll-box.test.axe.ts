// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ScrollBox } from '@nvidia-elements/core/scroll-box';
import '@nvidia-elements/core/scroll-box/define.js';

describe(ScrollBox.metadata.tag, () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  it('should pass axe with native content without a landmark role', async () => {
    fixture = await createFixture(html`
      <nve-scroll-box aria-label="Activity" style="width: 200px; height: 150px;">
        <div style="height: 500px;"><button type="button">Details</button></div>
      </nve-scroll-box>
    `);
    await elementIsStable(fixture.querySelector(ScrollBox.metadata.tag));
    await new Promise(requestAnimationFrame);
    const results = await runAxe([ScrollBox.metadata.tag]);
    expect(results.violations).toHaveLength(0);
  });

  it.each(['horizontal', 'vertical', 'both'] as const)(
    'should pass axe for %s scrolling with and without shadows',
    async orientation => {
      fixture = await createFixture(html`
      ${[false, true].map(
        shadows => html`
        <nve-scroll-box orientation=${orientation} ?scroll-shadow=${shadows} role="region"
          aria-label=${shadows ? 'Activity with shadows' : 'Activity without shadows'} style="width: 200px; height: 150px;">
          <div style="width: 600px; height: 500px;"><button type="button">Details</button></div>
        </nve-scroll-box>
      `
      )}
    `);
      await Promise.all(Array.from(fixture.querySelectorAll<ScrollBox>(ScrollBox.metadata.tag), elementIsStable));
      await new Promise(requestAnimationFrame);
      const results = await runAxe([ScrollBox.metadata.tag]);
      expect(results.violations).toHaveLength(0);
    }
  );
});
