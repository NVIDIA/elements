import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
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
      <nve-accordion behavior-expand>
        <nve-accordion-header>
          <div slot="title">title</div>
          <div slot="subtitle">subtitle</div>
        </nve-accordion-header>
        <nve-accordion-content>content</nve-accordion-content>
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
