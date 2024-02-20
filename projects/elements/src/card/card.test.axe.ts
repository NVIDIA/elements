import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Card, CardHeader, CardFooter, CardContent } from '@elements/elements/card';
import '@elements/elements/card/define.js';

describe('mlv-card axe', () => {
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
    card = fixture.querySelector('mlv-card');
    cardHeader = fixture.querySelector('mlv-card-header');
    cardContent = fixture.querySelector('mlv-card-content');
    cardFooter = fixture.querySelector('mlv-card-footer');
    await elementIsStable(card);
    await elementIsStable(cardHeader);
    await elementIsStable(cardContent);
    await elementIsStable(cardFooter);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-card']);
    expect(results.violations.length).toBe(0);
  });
});
