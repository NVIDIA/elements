import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/button/define.js';

describe(Button.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Button;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button interaction="emphasis">emphasis</nve-button> <!-- failing -->
      <nve-button>default</nve-button>
      <nve-button interaction="destructive">destructive</nve-button>
      <nve-button disabled>disabled</nve-button>
      <nve-button pressed>pressed</nve-button>
    `);
    element = fixture.querySelector(Button.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Button.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
