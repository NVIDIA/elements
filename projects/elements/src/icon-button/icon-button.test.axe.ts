import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/icon-button/define.js';

describe('mlv-icon-button axe', () => {
  let fixture: HTMLElement;
  let element: IconButton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-icon-button aria-label="icon button"></mlv-icon-button>
    `);
    element = fixture.querySelectorAll('mlv-icon-button')[0];
    elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-icon-button']);
    expect(results.violations.length).toBe(0);
  });
});
