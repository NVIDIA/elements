import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { typeButton } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';

@typeButton<TypeButtonControllerTestElement>()
@customElement('type-button-controller-test-element')
class TypeButtonControllerTestElement extends LitElement {
  @property({ type: Boolean }) readonly = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) href: string;
  _internals: ElementInternals;
}

describe('TypeButtonController', () => {
  let element: TypeButtonControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<type-button-controller-test-element></type-button-controller-test-element>`);
    element = fixture.querySelector('type-button-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize tabindex 0 for focus behavior', async () => {
    await elementIsStable(element);
    expect(element.tabIndex).toBe(0);
  });

  it('should initialize role button', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('button');
  });

  it('should remove tabindex if disabled', async () => {
    element.disabled = true;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
  });

  it('should remove tabindex and role if readonly', async () => {
    element.readonly = true;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
    expect(element._internals.role).toBe('none');
    expect(element.getAttribute('role')).toBe(null);
  });
});
