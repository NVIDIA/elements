import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { AppHeader } from '@elements/elements/app-header';
import '@elements/elements/app-header/define.js';
import '@elements/elements/logo/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

describe('mlv-app-header axe', () => {
  let fixture: HTMLElement;
  let element: AppHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-app-header>
        <mlv-logo size="lg" aria-label="NV Logo">NV</mlv-logo>
        <h2 slot="title">header</h2>
        <mlv-button slot="nav-items">item</mlv-button>
        <mlv-icon-button icon-name="person" slot="nav-actions" aria-label="profile"></mlv-icon-button>
      </mlv-app-header>
    `);
    element = fixture.querySelector('mlv-app-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-app-header']);
    expect(results.violations.length).toBe(0);
  });
});
