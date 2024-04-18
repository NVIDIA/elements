import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
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
      <mlv-card>
        <mlv-card-header>
          <h2 slot="title">title</h2>
          <h3 slot="subtitle">subtitle</h3>
          <button slot="header-action">header action</button>
        </mlv-card-header>
        <mlv-card-content>
          <p>content</p>
        </mlv-card-content>
        <mlv-card-footer>
          <p>footer</p>
        </mlv-card-footer>
      </mlv-card>
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
