import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { AccordionGroup } from '@elements/elements/accordion';
import '@elements/elements/accordion/define.js';


describe('mlv-accordion axe', () => {
  let fixture: HTMLElement;
  let element: AccordionGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <mlv-accordion-group>
      <mlv-accordion behavior-expand>
        <mlv-accordion-header>header</mlv-accordion-header>
        <mlv-accordion-content>content</mlv-accordion-content>
      </mlv-accordion>
      <mlv-accordion behavior-expand>
        <mlv-accordion-header>
          <div slot="title">title</div>
          <div slot="subtitle">subtitle</div>
        </mlv-accordion-header>
        <mlv-accordion-content>content</mlv-accordion-content>
      </mlv-accordion>
    </mlv-accordion-group>
    `);
    element = fixture.querySelector('mlv-accordion-group');

    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-accordion-group']);
    expect(results.violations.length).toBe(0);
  });
});
