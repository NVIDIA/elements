import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Breadcrumb } from '@elements/elements/breadcrumb';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

describe('mlv-breadcrumb', () => {
  let fixture: HTMLElement;
  let element: Breadcrumb;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-breadcrumb>
        <mlv-icon-button icon-name="home" aria-label="link to first page"></mlv-icon-button>
        <mlv-button>Item</mlv-button>
        <span>Static item</span>
      </mlv-breadcrumb>
    `);
    element = fixture.querySelector('mlv-breadcrumb');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-breadcrumb']);
    expect(results.violations.length).toBe(0);
  });
});
