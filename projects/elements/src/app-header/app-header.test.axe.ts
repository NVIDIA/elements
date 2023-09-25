import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { AppHeader } from '@elements/elements/app-header';
import '@elements/elements/app-header/define.js';
import '@elements/elements/logo/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

describe('nve-app-header axe', () => {
  let fixture: HTMLElement;
  let element: AppHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-app-header>
        <nve-logo size="lg" aria-label="NV Logo">NV</nve-logo>
        <h2 slot="title">header</h2>
        <nve-button slot="nav-items">item</nve-button>
        <nve-icon-button icon-name="person" slot="nav-actions" aria-label="profile"></nve-icon-button>
      </nve-app-header>
    `);
    element = fixture.querySelector('nve-app-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-app-header']);
    expect(results.violations.length).toBe(0);
  });
});
