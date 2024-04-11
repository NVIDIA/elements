import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon/define.js';

describe('nve-icon axe', () => {
  let fixture: HTMLElement;
  let element: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-icon aria-label="test icon"></nve-icon>`);
    element = fixture.querySelector('nve-icon');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-icon']);
    expect(results.violations.length).toBe(0);
  });
});
