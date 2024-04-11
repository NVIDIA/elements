import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/icon-button/define.js';

describe('nve-icon-button axe', () => {
  let fixture: HTMLElement;
  let element: IconButton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-icon-button aria-label="icon button"></nve-icon-button>
    `);
    element = fixture.querySelectorAll('nve-icon-button')[0];
    elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-icon-button']);
    expect(results.violations.length).toBe(0);
  });
});
