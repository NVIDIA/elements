import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { AccordionGroup } from '@elements/elements/accordion';
import '@elements/elements/accordion/define.js';


describe('nve-accordion axe', () => {
  let fixture: HTMLElement;
  let element: AccordionGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-accordion-group>
      <nve-accordion behavior-expand>
        <nve-accordion-header>header</nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
      <nve-accordion behavior-expand>
        <nve-accordion-header>
          <div slot="title">title</div>
          <div slot="subtitle">subtitle</div>
        </nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
    `);
    element = fixture.querySelector('nve-accordion-group');

    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-accordion-group']);
    expect(results.violations.length).toBe(0);
  });
});
