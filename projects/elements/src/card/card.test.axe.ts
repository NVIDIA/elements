// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Card, CardHeader, CardFooter, CardContent } from '@nvidia-elements/core/card';
import '@nvidia-elements/core/card/define.js';

describe(Card.metadata.tag, () => {
  let fixture: HTMLElement;
  let card: Card;
  let cardHeader: CardHeader;
  let cardContent: CardContent;
  let cardFooter: CardFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-card>
        <nve-card-header>
          <h2 nve-text="heading">header</h2>
        </nve-card-header>
        <nve-card-content>
          <p nve-text="body">content</p>
        </nve-card-content>
        <nve-card-footer>
          <p nve-text="body">footer</p>
        </nve-card-footer>
      </nve-card>
    `);
    card = fixture.querySelector(Card.metadata.tag);
    cardHeader = fixture.querySelector(CardHeader.metadata.tag);
    cardContent = fixture.querySelector(CardContent.metadata.tag);
    cardFooter = fixture.querySelector(CardFooter.metadata.tag);
    await elementIsStable(card);
    await elementIsStable(cardHeader);
    await elementIsStable(cardContent);
    await elementIsStable(cardFooter);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Card.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
