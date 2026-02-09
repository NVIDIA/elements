import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { statePressed } from '@nvidia-elements/core/internal';

@statePressed<StatePressedControllerTestElement>()
@customElement('state-pressed-controller-test-element')
class StatePressedControllerTestElement extends LitElement {
  @property({ type: Boolean }) pressed: boolean;
  @property({ type: Boolean }) readonly: boolean;
  declare _internals: ElementInternals;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
describe('state-pressed.controller', () => {
  let element: StatePressedControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-pressed-controller-test-element></state-pressed-controller-test-element>`
    );
    element = fixture.querySelector<StatePressedControllerTestElement>('state-pressed-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize aria-pressed as null', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe(null);
    expect(element.matches(':state(pressed)')).toBe(false);
  });

  it('should initialize aria-pressed as null if pressed not applied', async () => {
    element.pressed = true;
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe('true');
    expect(element.matches(':state(pressed)')).toBe(true);
  });

  it('should initialize aria-pressed as false if pressed=false applied', async () => {
    element.pressed = false;
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe('false');
    expect(element.matches(':state(pressed)')).toBe(false);
  });

  it('should remove aria-pressed if readonly', async () => {
    element.pressed = true;
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe('true');
    expect(element.matches(':state(pressed)')).toBe(true);

    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe(null);
    expect(element.matches(':state(pressed)')).toBe(false);
  });
});
