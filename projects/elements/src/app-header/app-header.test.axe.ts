import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { AppHeader } from '@nvidia-elements/core/app-header';
import '@nvidia-elements/core/app-header/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

describe(AppHeader.metadata.tag, () => {
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
    element = fixture.querySelector(AppHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([AppHeader.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
