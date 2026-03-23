import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { stateActive } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';

@stateActive<StateActiveControllerTestElement>()
@customElement('state-active-controller-test-element')
class StateActiveControllerTestElement extends LitElement {
  @property({ type: Boolean }) disabled = false;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
describe('state-active.controller', () => {
  let element: StateActiveControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<state-active-controller-test-element></state-active-controller-test-element>`);
    element = fixture.querySelector<StateActiveControllerTestElement>('state-active-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should add active state on mousedown', async () => {
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new MouseEvent('mousedown'));
    expect(element.matches(':state(active)')).toBe(true);

    element.dispatchEvent(new MouseEvent('mouseup'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should not add active state if element is disabled', async () => {
    element.disabled = true;
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new MouseEvent('mousedown'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should not trigger scroll behavior when Space is pressed', async () => {
    const original = document.body.getBoundingClientRect().top;

    element.dispatchEvent(new KeyboardEvent('keypress', { code: 'Space' }));
    await elementIsStable(element);

    expect(document.body.getBoundingClientRect().top).toBe(original);
  });

  it('should add active state on space keypress', async () => {
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keypress', { code: 'Space' }));
    expect(element.matches(':state(active)')).toBe(true);

    element.dispatchEvent(new KeyboardEvent('keyup'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should add active state on enter keypress', async () => {
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keypress', { code: 'Enter' }));
    expect(element.matches(':state(active)')).toBe(true);

    element.dispatchEvent(new KeyboardEvent('keyup'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should not add active state on any invalid keypress', async () => {
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keypress', { code: 'KeyK' }));
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new KeyboardEvent('keyup'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should remove active state on blur', async () => {
    element.dispatchEvent(new MouseEvent('mousedown'));
    expect(element.matches(':state(active)')).toBe(true);

    element.dispatchEvent(new Event('blur'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should not add active state on mousedown when disabled', async () => {
    element.disabled = true;
    await elementIsStable(element);

    element.dispatchEvent(new MouseEvent('mousedown'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should not add active state on keypress when disabled', async () => {
    element.disabled = true;
    await elementIsStable(element);

    element.dispatchEvent(new KeyboardEvent('keypress', { code: 'Enter' }));
    expect(element.matches(':state(active)')).toBe(false);
  });
});
