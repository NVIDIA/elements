import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@elements/elements/test';
import { stateScroll } from '@elements/elements/internal';

@stateScroll<StateScrollControllerTestElement>()
@customElement('state-scroll-controller-test-element')
class StateScrollControllerTestElement extends LitElement {
  declare _internals: ElementInternals;

  static styles = [css`:host { overflow: auto; width: 50px; height: 50px; display: block; }`];

  render() {
    return html`<div style="width: 100px; height: 100px;"></div>`
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 * https://github.com/calebdwilliams/element-internals-polyfill#state-api
 */
describe('state-scroll.controller', () => {
  let element: StateScrollControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<state-scroll-controller-test-element></state-scroll-controller-test-element>`);
    element = fixture.querySelector<StateScrollControllerTestElement>('state-scroll-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize with no scrolling state', async () => {
    await elementIsStable(element);
    expect(element.matches(':--scrolling')).toBe(false);
  });

  it('should add scrolling state on scroll', async () => {
    await elementIsStable(element);
    const event = untilEvent(element, 'scroll');
    element.scrollLeft = 10;
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
    await event;
    expect(element.matches(':--scrolling')).toBe(true);
  });

  it('should dispatch scrollend event when scroll reaches end of scrollbox', async () => {
    await elementIsStable(element);
    const event = untilEvent(element, 'scrollend');
    element.scrollTop = 10;
    element.dispatchEvent(new Event('scroll'));
    await event;
    expect(await event).toBeTruthy();
  });

  it('should remove scrolling state when scroll reaches end of scrollbox', async () => {
    await elementIsStable(element);
    const event = untilEvent(element, 'scroll');
    element.scrollTop = 10;
    element.dispatchEvent(new Event('scroll'));
    await event;
    expect(element.matches(':--scrolling')).toBe(false);
  });
});
