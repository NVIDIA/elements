import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { PreferencesInput } from '@nvidia-elements/core/preferences-input';
import '@nvidia-elements/core/preferences-input/define.js';
import { type Control } from '@nvidia-elements/core/forms';
import { type MenuItem } from '@nvidia-elements/core/menu';
import { type Switch } from '@nvidia-elements/core/switch';

function mockCSSProperties(root: string): HTMLStyleElement {
  const style = document.createElement('style');
  document.head.appendChild(style);
  style.textContent = root;
  return style;
}

describe(`${PreferencesInput.metadata.tag}: style check`, () => {
  let fixture: HTMLElement;
  let element: PreferencesInput;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-preferences-input name="config" .value=${{ theme: 'auto' }}></nve-preferences-input>
      </form>
    `);
    element = fixture.querySelector(PreferencesInput.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(PreferencesInput.metadata.tag)).toBeDefined();
  });

  /**
   * Test form properties
   */
  it('should provide the associated form', async () => {
    const form = fixture.querySelector('form');
    expect(element.form).toBe(form);
  });

  it('should provide the type', async () => {
    expect(element.type).toBe('nve-preferences-input');
  });

  it('should provide the validity', async () => {
    expect(element.validity.valid).toBe(true);
  });

  it('should provide the validity message', async () => {
    expect(element.validationMessage).toBe('');
  });

  it('should provide the validity message', async () => {
    expect(element.willValidate).toBe(true);
  });

  /**
   * Test default value
   */
  it('should set value as object', async () => {
    const form = fixture.querySelector('form');
    expect(Object.fromEntries(new FormData(form))).toEqual({
      'config-theme': 'auto',
      'config-reduced-motion': 'false',
      'config-scale': 'default'
    });
  });

  it('should set value as form data', async () => {
    const form = fixture.querySelector('form');
    const value = new FormData();

    value.set('theme', 'dark');
    element.value = value;

    expect(Object.fromEntries(new FormData(form))).toEqual({
      'config-theme': 'dark',
      'config-reduced-motion': 'false',
      'config-scale': 'default'
    });
  });

  /**
   * Test change event
   */
  it('should emit change event on user input', async () => {
    const styles = mockCSSProperties(`:root {
      --nve-config-light: true;
      --nve-config-dark: true;
      --nve-config-compact: true;
      --nve-config-reduced-motion: true;
    }`);

    element.requestUpdate();
    await elementIsStable(element);

    const form = fixture.querySelector('form');
    const colorMenu = element.shadowRoot.querySelectorAll<Control>('nve-control')[0];
    const scaleMenu = element.shadowRoot.querySelectorAll<Control>('nve-control')[1];
    const motionMenu = element.shadowRoot.querySelector<Control>('nve-switch');

    expect(Object.fromEntries(new FormData(form))).toEqual({
      'config-theme': 'auto',
      'config-reduced-motion': 'false',
      'config-scale': 'default'
    });

    const changeEvent = untilEvent(element, 'change');
    const colorMenuDarkOption = colorMenu.querySelectorAll<MenuItem>('nve-menu-item')[2];
    emulateClick(colorMenuDarkOption);
    const scaleMenuCompactOption = scaleMenu.querySelectorAll<MenuItem>('nve-menu-item')[1];
    emulateClick(scaleMenuCompactOption);
    const motionMenuOption = motionMenu.querySelector<HTMLInputElement>('input');
    emulateClick(motionMenuOption);
    await changeEvent;

    expect(Object.fromEntries(new FormData(form))).toEqual({
      'config-theme': 'dark',
      'config-reduced-motion': 'true',
      'config-scale': 'compact'
    });

    element.checkValidity();
    expect(element._internals.validity.valid).toBe(true);
    styles.remove();
  });

  /**
   * Test input event
   */
  it('should emit input event on user input', async () => {
    const styles = mockCSSProperties(`:root {
      --nve-config-light: true;
      --nve-config-dark: true;
      --nve-config-compact: true;
      --nve-config-reduced-motion: true;
    }`);

    element.requestUpdate();
    await elementIsStable(element);

    const form = fixture.querySelector('form');
    const colorMenu = element.shadowRoot.querySelectorAll<Control>('nve-control')[0];
    const scaleMenu = element.shadowRoot.querySelectorAll<Control>('nve-control')[1];
    const motionMenu = element.shadowRoot.querySelector<Control>('nve-switch');

    expect(Object.fromEntries(new FormData(form))).toEqual({
      'config-theme': 'auto',
      'config-reduced-motion': 'false',
      'config-scale': 'default'
    });

    const inputEvent = untilEvent(element, 'input');
    const colorMenuDarkOption = colorMenu.querySelectorAll<MenuItem>('nve-menu-item')[2];
    emulateClick(colorMenuDarkOption);
    const scaleMenuCompactOption = scaleMenu.querySelectorAll<MenuItem>('nve-menu-item')[1];
    emulateClick(scaleMenuCompactOption);
    const motionMenuOption = motionMenu.querySelector<HTMLInputElement>('input');
    emulateClick(motionMenuOption);
    await inputEvent;

    expect(Object.fromEntries(new FormData(form))).toEqual({
      'config-theme': 'dark',
      'config-reduced-motion': 'true',
      'config-scale': 'compact'
    });

    element.checkValidity();
    expect(element._internals.validity.valid).toBe(true);
    styles.remove();
  });

  /**
   * Test visibility of color controls
   */
  it('should show color controls when "true"', async () => {
    const styles = mockCSSProperties(`:root {
      --nve-config-light: true;
      --nve-config-dark: true;
    }`);

    element.requestUpdate();
    await elementIsStable(element);

    const node = element.shadowRoot.querySelectorAll<Control>('nve-control')[0];
    expect(node.checkVisibility()).toBe(true);
    styles.remove();
    styles.remove();
  });

  it('should show color controls when "false"', async () => {
    const styles = mockCSSProperties(`:root {
      --nve-config-light: false;
      --nve-config-dark: false;
    }`);
    element.requestUpdate();
    await elementIsStable(element);

    const node = element.shadowRoot.querySelectorAll<Control>('nve-control')[0];
    expect(node.checkVisibility()).toBe(true);
    styles.remove();
  });

  it('should show color controls when "null"', async () => {
    const styles = mockCSSProperties(`:root {}`);
    element.requestUpdate();
    await elementIsStable(element);

    const node = element.shadowRoot.querySelectorAll<Control>('nve-control')[0];
    expect(node.checkVisibility()).toBe(true);
    styles.remove();
  });

  /**
   * Test visibility of scale controls
   */
  it('should show scale controls when "true"', async () => {
    const styles = mockCSSProperties(`:root { --nve-config-compact: true; }`);
    element.requestUpdate();
    await elementIsStable(element);

    const node = element.shadowRoot.querySelectorAll<Control>('nve-control')[1];
    expect(node.checkVisibility()).toBe(true);
    styles.remove();
  });

  it('should hide scale controls when "false"', async () => {
    const styles = mockCSSProperties(`:root { --nve-config-compact: false; }`);
    element.requestUpdate();
    await elementIsStable(element);

    const node = element.shadowRoot.querySelectorAll<Control>('nve-control')[1];
    expect(node).toBe(undefined);
    styles.remove();
  });

  it('should hide scale controls when "null"', async () => {
    const styles = mockCSSProperties(`:root {}`);
    element.requestUpdate();
    await elementIsStable(element);

    const node = element.shadowRoot.querySelectorAll<Control>('nve-control')[1];
    expect(node).toBe(undefined);
    styles.remove();
  });

  /**
   * Test visibility of motion controls
   */
  it('should show motion controls when "true"', async () => {
    const styles = mockCSSProperties(`:root { --nve-config-reduced-motion: true; }`);
    element.requestUpdate();
    await elementIsStable(element);

    const node = element.shadowRoot.querySelector<Switch>('nve-switch');
    expect(node.checkVisibility()).toBe(true);
    styles.remove();
  });

  it('should hide motion controls when "false"', async () => {
    const styles = mockCSSProperties(`:root { --nve-config-reduced-motion: false; }`);
    element.requestUpdate();
    await elementIsStable(element);

    const node = element.shadowRoot.querySelector<Switch>('nve-switch');
    expect(node).toBe(null);
    styles.remove();
  });

  it('should hide motion controls when "null"', async () => {
    const styles = mockCSSProperties(`:root {}`);
    element.requestUpdate();
    await elementIsStable(element);

    const node = element.shadowRoot.querySelector<Switch>('nve-switch');
    expect(node).toBe(null);
    styles.remove();
  });
});
