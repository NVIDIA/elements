import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { stateDisabled } from '@nvidia-elements/core/internal';

@stateDisabled<StateDisabledControllerTestElement>()
@customElement('state-disabled-controller-test-element')
class StateDisabledControllerTestElement extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readonly = false;
  declare _internals: ElementInternals;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
describe('state-disabled.controller', () => {
  let element: StateDisabledControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-disabled-controller-test-element></state-disabled-controller-test-element>`
    );
    element = fixture.querySelector<StateDisabledControllerTestElement>('state-disabled-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize aria-disabled', async () => {
    element.disabled = true;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe('true');
    expect(element.matches(':state(disabled)')).toBe(true);
  });

  it('should update aria-disabled when disabled API is updated', async () => {
    element.disabled = true;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe('true');
    expect(element.matches(':state(disabled)')).toBe(true);

    element.disabled = false;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe('false');
    expect(element.matches(':state(disabled)')).toBe(false);
  });

  it('should remove aria-disabled if readonly', async () => {
    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe(null);
    expect(element.matches(':state(disabled)')).toBe(false);
  });

  it('should remove aria-disabled set to null (element can no longer be disabled)', async () => {
    element.disabled = null;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe(null);
    expect(element.matches(':state(disabled)')).toBe(false);
  });
});
