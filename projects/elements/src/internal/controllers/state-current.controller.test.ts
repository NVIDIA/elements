import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { stateCurrent } from '@elements/elements/internal';

@stateCurrent<StateCurrentControllerTestElement>()
@customElement('state-current-controller-test-element')
class StateCurrentControllerTestElement extends LitElement {
  @property({ type: String }) current: 'page' | 'step';
  @property({ type: Boolean }) readonly: boolean;
  declare _internals: ElementInternals;

  render() {
    return html`<slot></slot>`;
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 * https://github.com/calebdwilliams/element-internals-polyfill#state-api
 */
describe('state-current.controller', () => {
  let element: StateCurrentControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-current-controller-test-element></state-current-controller-test-element>`
    );
    element = fixture.querySelector<StateCurrentControllerTestElement>('state-current-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize aria-current as null', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaCurrent).toBe(null);
    expect(element.matches(':--current')).toBe(false);
  });

  it('should initialize aria-current as null if current not applied', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaCurrent).toBe(null);
    expect(element.matches(':--current')).toBe(false);
  });

  it('should initialize aria-current if current applied', async () => {
    element.current = 'page';
    await elementIsStable(element);
    expect(element._internals.ariaCurrent).toBe('page');
    expect(element.matches(':--current')).toBe(true);
  });

  it('should initialize aria-current as step if current=step is applied', async () => {
    element.current = 'step';
    await elementIsStable(element);
    expect(element._internals.ariaCurrent).toBe('step');
    expect(element.matches(':--current')).toBe(true);
  });

  it('should remove aria-current if readonly', async () => {
    element.current = 'page';
    await elementIsStable(element);
    expect(element._internals.ariaCurrent).toBe('page');
    expect(element.matches(':--current')).toBe(true);

    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaCurrent).toBe(null);
    expect(element.matches(':--current')).toBe(false);
  });

  it('should appply aria-current="page" if a current anchor', async () => {
    const a = document.createElement('a');
    a.href = '#';
    element.appendChild(a);
    element.current = 'page';
    element._internals.states.add('--anchor'); // typically added via type-anchor controller in base button
    element.requestUpdate();
    await elementIsStable(element);

    expect(a.getAttribute('aria-current')).toBe('page');
  });
});
