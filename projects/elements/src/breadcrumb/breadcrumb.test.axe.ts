import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Breadcrumb } from '@elements/elements/breadcrumb';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

describe('nve-breadcrumb', () => {
  let fixture: HTMLElement;
  let element: Breadcrumb;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-breadcrumb>
        <nve-icon-button icon-name="home" aria-label="link to first page"></nve-icon-button>
        <nve-button>Item</nve-button>
        <span>Static item</span>
      </nve-breadcrumb>
    `);
    element = fixture.querySelector('nve-breadcrumb');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-breadcrumb']);
    expect(results.violations.length).toBe(0);
  });
});
