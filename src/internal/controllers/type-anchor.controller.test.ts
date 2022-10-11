import { html, LitElement } from 'lit';
import { customElement  } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { typeAnchor } from '@elements/elements/internal';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, emulateClick } from '@elements/elements/test';

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
  let elementTwo: TypeAnchorTestElement;
  let anchor: HTMLAnchorElement;
  let anchorTwo: HTMLAnchorElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <type-anchor-test-element><a href="#">anchor</a></type-anchor-test-element>
    <a href="#"><type-anchor-test-element>anchor</type-anchor-test-element></a>`);
    element = fixture.querySelectorAll<TypeAnchorTestElement>('type-anchor-test-element')[0];
    elementTwo = fixture.querySelectorAll<TypeAnchorTestElement>('type-anchor-test-element')[1];
    anchor = fixture.querySelectorAll<HTMLAnchorElement>('a')[0];
    anchorTwo = fixture.querySelectorAll<HTMLAnchorElement>('a')[1];
  });

  afterEach(() => {
    removeFixture(fixture);
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

  it('should allow element to slot anchor', () => {
    let clicks = 0;
    anchor.addEventListener('click', () => clicks++);

    emulateClick(anchor);
    expect(clicks).toBe(1);

    expect(element.readonly).toBe(true);
    expect(anchor.style.textDecoration).toBe('');
    expect(element.style.cursor).toBe('');
  });

  it('should allow element to be wrapped in anchor', () => {
    let clicks = 0;
    anchorTwo.addEventListener('click', () => clicks++);

    emulateClick(anchorTwo);
    expect(clicks).toBe(1);

    expect(elementTwo.readonly).toBe(true);
    expect(anchorTwo.style.textDecoration).toBe('none');
    expect(elementTwo.style.cursor).toBe('pointer');
  });
});
