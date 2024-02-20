import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Password } from '@elements/elements/password';
import '@elements/elements/password/define.js';

describe('mlv-password', () => {
  let fixture: HTMLElement;
  let element: Password;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-password>
        <label>label</label>
        <input type="password" />
      </mlv-password>
    `);
    element = fixture.querySelector('mlv-password');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-password')).toBeDefined();
  });

  it('should toggle the input type when the visibility icon is pressed', async () => {
    expect(fixture.querySelector('input').type).toBe('password');
    expect(element.shadowRoot.querySelector('mlv-icon-button').iconName).toBe('visible');

    element.shadowRoot.querySelector('mlv-icon-button').click();
    await elementIsStable(element);

    expect(fixture.querySelector('input').type).toBe('text');
    expect(element.shadowRoot.querySelector('mlv-icon-button').iconName).toBe('hidden');
  });

  it('should apply an aria-label to the password visibility button', async () => {
    await elementIsStable(element);
    const button = element.shadowRoot.querySelector('mlv-icon-button');
    expect(button.ariaLabel).toBe('show');
    button.click();
    await elementIsStable(element);
    expect(button.ariaLabel).toBe('hide');
    button.click();
    await elementIsStable(element);
    expect(button.ariaLabel).toBe('show');
  });
});
