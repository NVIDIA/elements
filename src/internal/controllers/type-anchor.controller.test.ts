import { html, LitElement } from 'lit';
import { customElement  } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { typeAnchor } from '@elements/elements/internal';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { elementIsStable, createFixture, emulateClick } from '@elements/elements/test';

@typeAnchor<TypeAnchorTestElement>()
@customElement('type-anchor-test-element')
class TypeAnchorTestElement extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readonly = false;

  render() {
    return html`<slot></slot>`;
  }
}

describe('type-anchor.controller', () => {
  let fixture: HTMLElement;
  let element: TypeAnchorTestElement;
  let anchor: HTMLAnchorElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<type-anchor-test-element><a href="#">anchor</a></type-anchor-test-element>`);
    element = fixture.querySelector<TypeAnchorTestElement>('type-anchor-test-element');
    anchor = element.querySelector<HTMLAnchorElement>('a');
  });

  afterEach(() => {
    fixture.remove();
  });

  it('should prevent click event if host disabled', () => {
    let clicks = 0;
    anchor.addEventListener('click', () => clicks++);

    emulateClick(anchor);
    expect(clicks).toBe(1);

    element.disabled = true;
    emulateClick(anchor);

    expect(element.readonly).toBe(true);
    expect(clicks).toBe(1);

    element.disabled = false;
    emulateClick(anchor);
    expect(clicks).toBe(2);
  });
});
