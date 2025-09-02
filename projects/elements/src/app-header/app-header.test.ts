import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { AppHeader } from '@nvidia-elements/core/app-header';
import type { Button } from '@nvidia-elements/core/button';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Logo } from '@nvidia-elements/core/logo';
import '@nvidia-elements/core/app-header/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

/* eslint-disable elements/deprecated-tags */

describe(AppHeader.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: AppHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-app-header></nve-app-header>
    `);
    element = fixture.querySelector(AppHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(AppHeader.metadata.tag)).toBeDefined();
  });

  it('should include default logo', () => {
    const defaultLogo = element.shadowRoot?.querySelector(Logo.metadata.tag);
    expect(defaultLogo).not.toBeNull();
    expect(defaultLogo.getAttribute('size')).toBe('sm');
    expect(defaultLogo.getAttribute('aria-label')).toBe('NVIDIA');
  });

  it('should include default title', () => {
    const defaultTitle = element.shadowRoot?.querySelector('h2');
    expect(defaultTitle).not.toBeNull();
    expect(defaultTitle.textContent).toBe('NVIDIA');
  });

  it('should have a navigation role', () => {
    expect(element._internals.role).toBe('navigation');
  });
});

describe(`${AppHeader.metadata.tag}: branding`, () => {
  let fixture: HTMLElement;
  let element: AppHeader;
  const testShortcode = 'Hi';
  const testTitle = 'Hello App';

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-app-header>
        <nve-logo size="lg">${testShortcode}</nve-logo>
        <h2 slot="title">${testTitle}</h2>
      </nve-app-header>
    `);
    element = fixture.querySelector(AppHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should carryover logo customizations', async () => {
    const appLogo = element.querySelector<Logo>(Logo.metadata.tag);
    await elementIsStable(appLogo);
    expect(appLogo.getAttribute('size')).toBe('lg');
    expect(appLogo.textContent.includes(testShortcode)).toBe(true);

    appLogo.removeAttribute('size');
    element.shadowRoot.querySelector('slot').dispatchEvent(new Event('slotchange'));
    await appLogo.updateComplete;
    expect(appLogo.size).toBe('sm');
  });

  it('should set logo to sm if no customization is provided', async () => {
    const appLogo = element.querySelector<Logo>(Logo.metadata.tag);
    appLogo.removeAttribute('size');
    element.shadowRoot.querySelector('slot').dispatchEvent(new Event('slotchange'));
    await appLogo.updateComplete;
    expect(appLogo.size).toBe('sm');
  });

  it('should carryover custom title', () => {
    const appTitle = element.querySelector('h2');
    expect(appTitle.textContent.includes(testTitle)).toBe(true);
  });
});

describe(`${AppHeader.metadata.tag}: nav items and actions`, () => {
  let fixture: HTMLElement;
  let element: AppHeader;
  const innerIconBtnText = 'NV';

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-app-header>
        <nve-button id="default-flat-btn" slot="nav-items">A</nve-button>
        <nve-button id="override-flat-btn" interaction="emphasis" slot="nav-items">B</nve-button>
        <nve-icon-button id="default-icon-btn" icon-name="gear" slot="nav-items"></nve-icon-button>
        <nve-icon-button id="default-action-btn" icon-name="person" slot="nav-actions"></nve-icon-button>
        <nve-icon-button id="override-action-btn" interaction="emphasis" slot="nav-actions">${innerIconBtnText}</nve-icon-button>
      </nve-app-header>
    `);
    element = fixture.querySelector(AppHeader.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should provide a default interaction type to actions', () => {
    const defaultFlatItem = element.querySelector<Button>('#default-flat-btn');
    expect(defaultFlatItem.container).toBe('flat');
  });

  it('should set emphasis buttons to size sm', async () => {
    element.requestUpdate();
    await element.updateComplete;
    const navActionOverride = element.querySelector<Button>('#override-action-btn');
    expect(navActionOverride.interaction).toBe('emphasis');
    expect(navActionOverride.size).toBe('sm');
  });

  it('should preserve the default container for buttons with a custom interaction type', async () => {
    const navItemOverride = element.querySelector<Button>('#override-flat-btn');
    const navActionOverride = element.querySelector<IconButton>('#override-action-btn');
    expect(navItemOverride.interaction).toBe('emphasis');
    expect(navActionOverride.interaction).toBe('emphasis');
    expect(navItemOverride.container).toBe(undefined);
    expect(navActionOverride.container).toBe(undefined);
  });

  it('should not override set interaction types', () => {
    const navItemOverride = element.querySelector<Button>('#override-flat-btn');
    const navActionOverride = element.querySelector<IconButton>('#override-action-btn');
    expect(navItemOverride.interaction).toBe('emphasis');
    expect(navActionOverride.interaction).toBe('emphasis');
    expect(navActionOverride.textContent).toBe(innerIconBtnText);
  });

  it('should set emphasis buttons to size sm if not set', () => {
    expect(element.querySelector<IconButton>(`${IconButton.metadata.tag}:not([interaction="emphasis"])`).size).toBe(
      undefined
    );
    expect(element.querySelector<IconButton>(`${IconButton.metadata.tag}[interaction="emphasis"]`).size).toBe('sm');
  });
});
