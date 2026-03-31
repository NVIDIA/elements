import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Password } from '@nvidia-elements/core/password';
import '@nvidia-elements/core/password/define.js';

describe(Password.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Password;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-password>
        <label>label</label>
        <input type="password" />
      </nve-password>
    `);
    element = fixture.querySelector(Password.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Password.metadata.tag)).toBeDefined();
  });

  it('should toggle the input type when the visibility icon is pressed', async () => {
    expect(fixture.querySelector('input').type).toBe('password');
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe('eye');

    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    await elementIsStable(element);

    expect(fixture.querySelector('input').type).toBe('text');
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).iconName).toBe('eye-hidden');
  });

  it('should apply an aria-label to the password visibility button', async () => {
    await elementIsStable(element);
    const button = element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag);
    expect(button.ariaLabel).toBe('show');
    button.click();
    await elementIsStable(element);
    expect(button.ariaLabel).toBe('hide');
    button.click();
    await elementIsStable(element);
    expect(button.ariaLabel).toBe('show');
  });

  it('should have a flat container option', async () => {
    expect(element.container).toBe(undefined);
    element.container = 'flat';
    await elementIsStable(element);
    expect(element.container).toBe('flat');
    expect(element.hasAttribute('container')).toBe(true);
  });

  it('should preserve input value when toggling visibility', async () => {
    const input = fixture.querySelector('input');
    input.value = 'my-secret-password';

    const iconButton = element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag);
    iconButton.click();
    await elementIsStable(element);
    expect(input.value).toBe('my-secret-password');
    expect(input.type).toBe('text');

    iconButton.click();
    await elementIsStable(element);
    expect(input.value).toBe('my-secret-password');
    expect(input.type).toBe('password');
  });

  it('should return to initial pressed state after even number of toggles', async () => {
    const iconButton = element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag);
    const initialPressed = iconButton.pressed;

    iconButton.click();
    await elementIsStable(element);
    iconButton.click();
    await elementIsStable(element);
    expect(iconButton.pressed).toBe(initialPressed);
  });
});
