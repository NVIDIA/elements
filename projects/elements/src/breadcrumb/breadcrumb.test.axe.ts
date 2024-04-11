import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Breadcrumb } from '@nvidia-elements/core/breadcrumb';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

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
