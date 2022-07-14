import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { attachInternals } from '@elements/elements/internal';
import { createFixture } from '@elements/elements/test';

@customElement('element-internals-test-element')
class ElementInternalsTestElement extends LitElement {
  declare _internals: ElementInternals;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }
}

describe('attachInternals', () => {
  let element: ElementInternalsTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<element-internals-test-element></element-internals-test-element>`);
    element = fixture.querySelector('element-internals-test-element');
  });

  it('should attach an instance of element internals to a custom element', async () => {
    expect(element._internals).toBeDefined();
  });

  it('should prevent a element internals from being called multiple times', async () => {
    attachInternals(element); // should not throw if called multiple times
    expect(element._internals).toBeDefined();
  });
});
