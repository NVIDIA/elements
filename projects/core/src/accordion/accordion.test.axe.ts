// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { AccordionGroup } from '@nvidia-elements/core/accordion';
import '@nvidia-elements/core/accordion/define.js';

describe(AccordionGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: AccordionGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-accordion-group>
      <nve-accordion behavior-expand>
        <nve-accordion-header>header</nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
      <nve-accordion>
        <nve-accordion-header>
          <h2 nve-text="heading" slot="prefix">heading</h2>
        </nve-accordion-header>
        <nve-accordion-content>
          <p nve-text="body">content</p>
        </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
    `);
    element = fixture.querySelector(AccordionGroup.metadata.tag);

    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([AccordionGroup.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
