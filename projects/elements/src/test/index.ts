// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TemplateResult } from 'lit';
import { render } from 'lit';
export * from './demo.js';

/**
 * @deprecated
 * Creates a test fixture DOM element for testing.
 * Fixture is ready when the registry defines all custom elements.
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
 * @deprecated
 * Removes test fixture DOM element.
 */
export function removeFixture(fixture: HTMLElement) {
  if (fixture) {
    document.body.removeChild(fixture);
  }
}

/**
 * @deprecated
 * Find all undefined elements in the custom elements registry and wait until
 * the registry adds all elements https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined
 */
async function waitForAllElementsToBeDefined() {
  const pendingElements = [
    ...new Set(
      Array.from(document.querySelectorAll('*:not(:defined)'))
        .filter(e => e.tagName.includes('-'))
        .map(e => e.tagName.toLocaleLowerCase())
    )
  ];
  return new Promise((resolve, reject) => {
    const undefinedElements: string[] = [];
    Promise.all(pendingElements.map(e => customElements.whenDefined(e)))
      .then(() => resolve(''))
      .catch(e => reject(e));
    setTimeout(() => {
      if (undefinedElements.length) {
        reject('');
        console.log(`\x1b[91m Elements not defined: ${undefinedElements}\x1b[0m`);
      }
    }, 5000);
  });
}

/**
 * @deprecated
 * Awaits until Lit element has rendered and has no pending updates
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function elementIsStable(element: any) {
  if (element.updateComplete) {
    return retry(async () =>
      (await element.updateComplete) ? Promise.resolve() : Promise.reject('Element did not stablize')
    );
  } else {
    return Promise.reject(`${element.tagName.toLocaleLowerCase()} is not a defined lit element`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function retry(fn: () => Promise<any>, maxTries = 10): Promise<any> {
  return fn().catch(() => (maxTries > 0 ? retry(fn, maxTries--) : Promise.reject('Max attempts reached')));
}

/**
 * @deprecated
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
 * @deprecated
 */
export function untilEvent(element: HTMLElement | Document, event: string) {
  return new Promise<any>(resolve => element.addEventListener(event, e => resolve(e))); // eslint-disable-line @typescript-eslint/no-explicit-any
}
