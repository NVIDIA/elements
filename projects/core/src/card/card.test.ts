// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Card, CardHeader, CardFooter, CardContent } from '@nvidia-elements/core/card';
import { getFlattenedDOMTree } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/card/define.js';

describe(Card.metadata.tag, () => {
  let fixture: HTMLElement;
  let card: Card;
  let cardHeader: CardHeader;
  let cardContent: CardContent;
  let cardFooter: CardFooter;

  /* eslint-disable @nvidia-elements/lint/no-deprecated-slots */
  /* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value */
  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-card>
        <nve-card-footer></nve-card-footer>
        <p nve-text="body">content</p>
        <nve-card-header>
          <h3 nve-text="heading" slot="subtitle">subtitle</h3>
          <button slot="header-action">header action</button>
          <h2 nve-text="heading" slot="title">title</h2>
        </nve-card-header>
        <nve-card-content></nve-card-content>
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

  it('should define elements', () => {
    expect(customElements.get(Card.metadata.tag)).toBeDefined();
    expect(customElements.get(CardHeader.metadata.tag)).toBeDefined();
    expect(customElements.get(CardContent.metadata.tag)).toBeDefined();
    expect(customElements.get(CardFooter.metadata.tag)).toBeDefined();
  });

  it('should have the card-header self define the header slot', async () => {
    await elementIsStable(cardHeader);
    expect(cardHeader.slot).toBe('header');
  });

  it('should have the card-footer self define the footer slot', async () => {
    await elementIsStable(cardFooter);
    expect(cardFooter.slot).toBe('footer');
  });

  it('should have card preserve the heading/content/footer DOM order via slots', async () => {
    await elementIsStable(card);
    await elementIsStable(cardHeader);
    await elementIsStable(cardFooter);

    const [header, content, footer] = getFlattenedDOMTree(card).filter(e => e.tagName.includes('NVE'));
    expect(header).toBe(cardHeader);
    expect(content).toBe(cardContent);
    expect(footer).toBe(cardFooter);
  });

  it('should reflect container attribute to DOM', async () => {
    expect(card.hasAttribute('container')).toBe(false);
    card.container = 'flat';
    await elementIsStable(card);
    expect(card.getAttribute('container')).toBe('flat');
  });

  it('should have card header preserve the title/subtitle/default/action DOM order via slots', async () => {
    await elementIsStable(cardHeader);

    const [titleElement, subtitleElement, actionElement] = getFlattenedDOMTree(cardHeader).filter(e =>
      e.hasAttribute('slot')
    );
    expect(titleElement).toBe(cardHeader.querySelector('[slot="title"]'));
    expect(subtitleElement).toBe(cardHeader.querySelector('[slot="subtitle"]'));
    expect(actionElement).toBe(cardHeader.querySelector('[slot="header-action"]'));
  });
});
