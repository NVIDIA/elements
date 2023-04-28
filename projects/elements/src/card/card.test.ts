import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { Card, CardHeader, CardFooter } from '@elements/elements/card';
import { getFlatDOMTree } from '@elements/elements/internal';
import '@elements/elements/card/define.js';

describe('nve-card', () => {
  let fixture: HTMLElement;
  let card: Card;
  let cardHeader: CardHeader;
  let cardFooter: CardFooter;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-card>
        <nve-card-footer></nve-card-footer>
        <p>content</p>
        <nve-card-header>
          <h3 slot="subtitle">subtitle</h3>
          <button slot="header-action">header action</button>
          <h2 slot="title">title</h2>
        </nve-card-header>
      </nve-card>
    `);
    card = fixture.querySelector('nve-card');
    cardHeader = fixture.querySelector('nve-card-header');
    cardFooter = fixture.querySelector('nve-card-footer');
    await elementIsStable(card);
    await elementIsStable(cardHeader);
    await elementIsStable(cardFooter);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get('nve-card')).toBeDefined();
    expect(customElements.get('nve-card-header')).toBeDefined();
    expect(customElements.get('nve-card-footer')).toBeDefined();
  });

  it('should have the nve-card-header self define the header slot', async () => {
    await elementIsStable(cardHeader);
    expect(cardHeader.slot).toBe('header');
  });

  it('should have the nve-card-footer self define the footer slot', async () => {
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

  it('should have card header preserve the title/subtitle/default/action DOM order via slots', async () => {
    await elementIsStable(cardHeader);

    const [titleElement, subtitleElement, defaultSlot, actionElement] = getFlatDOMTree(cardHeader).filter(e => e.hasAttribute('slot'));
    expect(titleElement).toBe(cardHeader.querySelector('[slot="title"]'));
    expect(subtitleElement).toBe(cardHeader.querySelector('[slot="subtitle"]'));
    expect(defaultSlot).toBeTruthy();
    expect(actionElement).toBe(cardHeader.querySelector('[slot="header-action"]'));
  });
});
