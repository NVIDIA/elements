// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TemplateResult } from 'lit';
import { render } from 'lit';

/**
 * Creates a test fixture DOM element for testing.
 * Fixture is ready when the registry defines all custom elements.
 */
export async function createFixture(template?: TemplateResult): Promise<HTMLElement> {
  const container = globalThis.document.createElement('div');
  globalThis.document.body.appendChild(container);

  if (template?.values) {
    render(template, container);
  }

  await waitForCustomElementsToBeDefined();
  return container;
}

/**
 * Removes test fixture DOM element.
 */
export function removeFixture(fixture: HTMLElement) {
  if (fixture) {
    globalThis.document.body.removeChild(fixture);
  }
}

/**
 * Find all elements not defined in the custom elements registry and wait until
 * the registry adds all elements https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined
 */
export async function waitForCustomElementsToBeDefined(): Promise<void> {
  const pendingElements = new Set(
    Array.from(globalThis.document.querySelectorAll('*:not(:defined)'))
      .filter(e => e.tagName.includes('-'))
      .map(e => e.tagName.toLocaleLowerCase())
  );
  return new Promise((resolve, reject) => {
    Promise.all(
      [...pendingElements].map(e => globalThis.customElements.whenDefined(e).then(() => pendingElements.delete(e)))
    )
      .then(() => resolve())
      .catch(e => reject(e));
    setTimeout(() => {
      if (pendingElements.size) {
        reject('Timed out waiting 5000ms for custom elements to be defined');
        console.log(`\x1b[91m Elements not defined: ${[...pendingElements]}\x1b[0m`);
      }
    }, 5000);
  });
}

/**
 * Awaits until Lit element has rendered and has no pending updates
 */
export async function elementIsStable(element: HTMLElement & { updateComplete?: Promise<boolean> }) {
  if (element.updateComplete) {
    return retry(async () =>
      (await element.updateComplete) ? Promise.resolve() : Promise.reject('Element did not stablize')
    );
  } else {
    return Promise.reject(`${element.tagName.toLocaleLowerCase()} is not a defined lit element`);
  }
}

function retry<T>(fn: () => Promise<T>, maxTries = 10): Promise<T> {
  return fn().catch(() => (maxTries > 0 ? retry(fn, maxTries--) : Promise.reject('Max attempts reached')));
}

/**
 * Triggers all native click events triggered from a user interaction.
 */
export function emulateClick(component: HTMLElement | Element) {
  const event1 = new MouseEvent('mousedown', { bubbles: true });
  const event2 = new MouseEvent('pointerdown', { bubbles: true });
  const event3 = new MouseEvent('mouseup', { bubbles: true });
  const event4 = new MouseEvent('pointerup', { bubbles: true });
  const event5 = new MouseEvent('click', { bubbles: true });
  component.dispatchEvent(event1);
  component.dispatchEvent(event2);
  component.dispatchEvent(event3);
  component.dispatchEvent(event4);
  component.dispatchEvent(event5);
}

/**
 * Triggers all native hover events triggered from a user interaction.
 */
export function emulateMouseEnter(component: HTMLElement | Element) {
  const event1 = new MouseEvent('mouseenter', { bubbles: true });
  const event2 = new MouseEvent('mousemove', { bubbles: true });
  component.dispatchEvent(event1);
  component.dispatchEvent(event2);
}

/**
 * Triggers all native mouse leave events triggered from a user interaction.
 */
export function emulateMouseLeave(component: HTMLElement | Element) {
  const event1 = new MouseEvent('mouseleave', { bubbles: true });
  component.dispatchEvent(event1);
}

/**
 * Creates a promise that will return an event result from a given element.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function untilEvent<T = Event>(element: HTMLElement | Document, event: string) {
  return new Promise<T & { detail?: any }>(resolve =>
    element.addEventListener(event, e => resolve(e as unknown as T & { detail?: any }))
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
