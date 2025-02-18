import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@nvidia-elements/testing';
import type { StateScrollConfig } from '@nvidia-elements/core/internal';
import { stateScroll } from '@nvidia-elements/core/internal';

@stateScroll<StateScrollControllerTestElement>()
@customElement('state-scroll-controller-test-element')
class StateScrollControllerTestElement extends LitElement {
  declare _internals: ElementInternals;

  static styles = [css`:host { overflow: auto; width: 50px; height: 50px; display: block; }`];

  // defaults
  stateScrollConfig = {
    scrollOffset: 0,
    target: this
  } as StateScrollConfig;

  render() {
    return html`<div style="width: 100px; height: 100px;"></div>`;
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
describe('state-scroll.controller', () => {
  let element: StateScrollControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<state-scroll-controller-test-element></state-scroll-controller-test-element>`);
    element = fixture.querySelector<StateScrollControllerTestElement>('state-scroll-controller-test-element');
    await elementIsStable(element);
  });

  afterEach(async () => {
    removeFixture(fixture);
    element._internals.states.delete(':state(scrolling)');
  });

  it('should initialize with no scrolling state', async () => {
    await elementIsStable(element);
    expect(element.matches(':state(scrolling)')).toBe(false);
  });

  it('should add scrolling state on scroll', async () => {
    const event = untilEvent(element, 'scroll');
    element.scrollLeft = 10;
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
    await event;
    expect(element.matches(':state(scrolling)')).toBe(true);
  });

  it('should remove scrolling state on scrollend', async () => {
    const event = untilEvent(element, 'scrollend');
    element.scrollLeft = 10;
    element.dispatchEvent(new Event('scrollend', { bubbles: true }));
    await event;
    expect(element.matches(':state(scrolling)')).toBe(false);
  });

  it('should dispatch scrollend event when scroll reaches end of scrollbox', async () => {
    const event = untilEvent(element, 'scrollboxend');
    element.scrollTop = 50;
    element.dispatchEvent(new Event('scrollend'));
    await event;
    expect(await event).toBeTruthy();
  });

  it('should account for scroll offset', async () => {
    element.stateScrollConfig.scrollOffset = 5;
    const event = untilEvent(element, 'scrollboxend');
    element.scrollTop = 45;
    element.dispatchEvent(new Event('scrollend'));
    await event;
    expect(await event).toBeTruthy();
  });

  it('should add scrolling state on scroll for custom target', async () => {
    element.stateScrollConfig.target = element.shadowRoot.querySelector<HTMLElement>('div');
    const event = untilEvent(element, 'scroll');
    element.scrollLeft = 10;
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
    await event;
    expect(element.matches(':state(scrolling)')).toBe(true);

    element.stateScrollConfig.target = undefined;
    const eventElement = untilEvent(element, 'scroll');
    element.scrollLeft = 10;
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
    await eventElement;
    expect(element.matches(':state(scrolling)')).toBe(true);
  });
});
