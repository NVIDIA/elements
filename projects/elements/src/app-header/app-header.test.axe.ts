import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { AppHeader } from '@nvidia-elements/core/app-header';
import '@nvidia-elements/core/app-header/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

/* eslint-disable @nvidia-elements/lint/no-deprecated-tags */

describe(AppHeader.metadata.tag, () => {
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
