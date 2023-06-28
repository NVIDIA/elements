import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { stateSelected } from '@elements/elements/internal';

@stateSelected<StateSelectedControllerTestElement>()
@customElement('state-selected-controller-test-element')
class StateSelectedControllerTestElement extends LitElement {
  @property({ type: Boolean }) selected: boolean;
  @property({ type: Boolean }) readonly: boolean;
  declare _internals: ElementInternals;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 * https://github.com/calebdwilliams/element-internals-polyfill#state-api
 */
describe('state-selected.controller', () => {
  let element: StateSelectedControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<state-selected-controller-test-element></state-selected-controller-test-element>`);
    element = fixture.querySelector<StateSelectedControllerTestElement>('state-selected-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize aria-selected as null', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe(null);
    expect(element.matches(':--selected')).toBe(false);
  });

  it('should initialize aria-selected as null if selected not applied', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe(null);
    expect(element.matches(':--selected')).toBe(false);
  });

  it('should initialize aria-selected as true if selected applied', async () => {
    element.selected = true;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe('true');
    expect(element.matches(':--selected')).toBe(true);
  });

  it('should initialize aria-selected as false if selected=false is applied', async () => {
    element.selected = false;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe('false');
    expect(element.matches(':--selected')).toBe(false);
  });

  it('should remove aria-selected if readonly', async () => {
    element.selected = true;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe('true');
    expect(element.matches(':--selected')).toBe(true);

    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaSelected).toBe(null);
    expect(element.matches(':--selected')).toBe(false);
  });
});
