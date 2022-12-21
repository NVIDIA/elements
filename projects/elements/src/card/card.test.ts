import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Card, CardHeader, CardFooter } from '@elements/elements/card';
import { getFlatDOMTree } from '@elements/elements/internal';
import '@elements/elements/card/define.js';

describe('mlv-card', () => {
  let fixture: HTMLElement;
  let card: Card;
  let cardHeader: CardHeader;
  let cardFooter: CardFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-card>
        <mlv-card-footer></mlv-card-footer>
        <p>content</p>
        <mlv-card-header>
          <h3 slot="subtitle">subtitle</h3>
          <button slot="header-action">header action</button>
          <h2 slot="title">title</h2>
        </mlv-card-header>
      </mlv-card>
    `);
    card = fixture.querySelector('mlv-card');
    cardHeader = fixture.querySelector('mlv-card-header');
    cardFooter = fixture.querySelector('mlv-card-footer');
    await elementIsStable(card);
    await elementIsStable(cardHeader);
    await elementIsStable(cardFooter);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get('mlv-card')).toBeDefined();
    expect(customElements.get('mlv-card-header')).toBeDefined();
    expect(customElements.get('mlv-card-footer')).toBeDefined();
  });

  it('should have the mlv-card-header self define the header slot', async () => {
    await elementIsStable(cardHeader);
    expect(cardHeader.slot).toBe('header');
  });

  it('should have the mlv-card-footer self define the footer slot', async () => {
    await elementIsStable(cardFooter);
    expect(cardFooter.slot).toBe('footer');
  });


  it('should have card preserve the heading/content/footer DOM order via slots', async () => {
    await elementIsStable(card);
    await elementIsStable(cardHeader);
    await elementIsStable(cardFooter);
    
    const [header, footer] = getFlatDOMTree(card).filter(e => e.tagName.includes('MLV'));
    expect(header).toBe(cardHeader);
    expect(footer).toBe(cardFooter);
  });

  it('should have card header preserve the title/subtitle/action DOM order via slots', async () => {
    await elementIsStable(cardHeader);

    const [titleElement, subtitleElement, actionElement] = getFlatDOMTree(cardHeader).filter(e => e.hasAttribute('slot'));
    expect(titleElement).toBe(cardHeader.querySelector('[slot="title"]'));
    expect(subtitleElement).toBe(cardHeader.querySelector('[slot="subtitle"]'));
    expect(actionElement).toBe(cardHeader.querySelector('[slot="header-action"]'));
  });
});
