import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Icon } from '@elements/elements/icon';
import '@elements/elements/icon/define.js';

describe('mlv-icon axe', () => {
  let fixture: HTMLElement;
  let element: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`<mlv-icon aria-label="test icon"></mlv-icon>`);
    element = fixture.querySelector('mlv-icon');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-icon']);
    expect(results.violations.length).toBe(0);
  });
});
