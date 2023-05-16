import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { AppHeader } from '@elements/elements/app-header';
import { Button } from '@elements/elements/button';
import { IconButton } from '@elements/elements/icon-button';
import { Logo } from '@elements/elements/logo';
import '@elements/elements/app-header/define.js';
import '@elements/elements/logo/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';

describe('nve-app-header: defaults', () => {
  let fixture: HTMLElement;
  let element: AppHeader;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-app-header></nve-app-header>
    `);
    element = fixture.querySelector('nve-app-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-app-header')).toBeDefined();
  });

  it('should include default logo', () => {
    const defaultLogo = element.shadowRoot?.querySelector('nve-logo');
    expect(defaultLogo).not.toBeNull();
    expect(defaultLogo.getAttribute('size')).toBe('sm');
    expect(defaultLogo.getAttribute('aria-label')).toBe('NVIDIA');
  });

  it('should include default title', () => {
    const defaultTitle = element.shadowRoot?.querySelector('h2');
    expect(defaultTitle).not.toBeNull();
    expect(defaultTitle.textContent).toBe('NVIDIA');
  });
});

describe('nve-app-header: app branding', () => {
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
    element = fixture.querySelector('nve-app-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should carryover logo customizations', async () => {
    const appLogo = element.querySelector<Logo>('nve-logo');
    await elementIsStable(appLogo);
    expect(appLogo.getAttribute('size')).toBe('lg');
    expect(appLogo.textContent.includes(testShortcode)).toBe(true);
  });
  
  it('should carryover custom title', () => {
    const appTitle = element.querySelector('h2');
    expect(appTitle.textContent.includes(testTitle)).toBe(true);
  });
});

describe('nve-app-header: nav items and actions', () => {
  let fixture: HTMLElement;
  let element: AppHeader;
  const innerIconBtnText = 'NV'

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-app-header>
        <nve-button id="default-ghost-btn" slot="nav-items">A</nve-button>
        <nve-button id="override-ghost-btn" interaction="emphasize" slot="nav-items">B</nve-button>
        <nve-icon-button id="default-icon-btn" icon-name="settings" slot="nav-items"></nve-icon-button>
        <nve-icon-button id="default-action-btn" icon-name="user" slot="nav-actions"></nve-icon-button>
        <nve-icon-button id="override-action-btn" interaction="emphasize" slot="nav-actions">${innerIconBtnText}</nve-icon-button>
      </nve-app-header>
    `);
    element = fixture.querySelector('nve-app-header');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should not override set interaction types', () => {
    const navItemOverride = element.querySelector<Button>('#override-ghost-btn');
    const navActionOverride = element.querySelector<IconButton>('#override-action-btn');
    expect(navItemOverride.getAttribute('interaction')).toBe('emphasize');
    expect(navActionOverride.getAttribute('interaction')).toBe('emphasize');
    expect(navActionOverride.textContent).toBe(innerIconBtnText);
  });

  it('should set emphasized buttons to size sm if not set', () => {
    expect(element.querySelector<IconButton>('nve-icon-button:not([interaction="emphasize"])').size).toBe(undefined);
    expect(element.querySelector<IconButton>('nve-icon-button[interaction="emphasize"]').size).toBe('sm');
  });
});
