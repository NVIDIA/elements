import { TemplateResult, render } from 'lit';
import '@elements/elements/polyfills'; // polyfills for required for vitest
import './setup.js';

/**
 * Creates a test fixture DOM element for testing.
 * Fixture is ready when all custom elements have been defined.
 */
export async function createFixture(template?: TemplateResult): Promise<HTMLElement> {
  const container = document.createElement('div');
  document.body.appendChild(container);

  if (template) {
    render(template, container);
  }

  await waitForAllElementsToBeDefined();
  return container;
}

/**
 * Removes test fixture DOM element.
 */
export function removeFixture(fixture: HTMLElement) {
  document.body.removeChild(fixture);
}

/**
 * Find all elements not defined in the custom elmenets registry and wait until
 * all elements have been added to registry https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined
 */
function waitForAllElementsToBeDefined() {
  const pendingElements = Array.from(document.querySelectorAll(':not(:defined)'));
  return Promise.all(pendingElements.map(e => customElements.whenDefined(e.tagName)));
}

/**
 * Awaits until Lit element has rendered and has no pending updates
 */
export function elementIsStable(element: any) {
  return retry(async () => await element.updateComplete ? Promise.resolve() : Promise.reject());
}

function retry(fn: () => Promise<any>, maxTries = 10) {
  return fn().catch(() => maxTries > 0 ? retry(fn, maxTries--) : Promise.reject('Max attempts reached'));
}

export function emulateClick(component: HTMLElement | Element) {
  const event1 = new MouseEvent('mousedown');
  const event2 = new MouseEvent('mouseup');
  const event3 = new MouseEvent('click');
  component.dispatchEvent(event1);
  component.dispatchEvent(event2);
  component.dispatchEvent(event3);
}

export function untilEvent(element: HTMLElement | Document, event: string) {
  return new Promise<any>(resolve => element.addEventListener(event, e => resolve(e)));
}
