import { html, LitElement } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { defineScopedElement, scope } from '@nvidia-elements/core/scoped';
import { define } from '@nvidia-elements/core/internal';

export class TestTwoElement extends LitElement {
  static metadata = {
    tag: 'test-element',
    version: ''
  };
}

export class TestElement extends LitElement {
  static metadata = {
    tag: 'test-element',
    version: ''
  };

  static elementDefinitions = {
    'mlv-test-two': TestTwoElement
  };
}

scope(TestTwoElement);
define(TestTwoElement);
defineScopedElement('scoped', TestElement);

describe('scoped element', () => {
  let fixture: HTMLElement;
  let element: TestElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<test-element></test-element>`);
    element = fixture.querySelector('test-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('test-element')).toBeDefined();
  });

  it('should define scoped alias element', () => {
    expect(customElements.get('test-element-scoped')).toBeDefined();
  });

  it('should have static defined dependencies', () => {
    expect(TestElement.elementDefinitions['mlv-test-two']).toBe(TestTwoElement);
  });
});
