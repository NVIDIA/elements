import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { typeAnchor } from '@nvidia-elements/core/internal';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, emulateClick, elementIsStable } from '@nvidia-elements/testing';

@typeAnchor<TypeAnchorTestElement>()
@customElement('type-anchor-test-element')
class TypeAnchorTestElement extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readonly = false;

  declare _internals: ElementInternals;

  render() {
    return html`<slot></slot>`;
  }
}

describe('type-anchor.controller', () => {
  let fixture: HTMLElement;
  let element: TypeAnchorTestElement;
  let anchor: HTMLAnchorElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <type-anchor-test-element>
      <a href="#">anchor</a>
    </type-anchor-test-element>`);

    element = fixture.querySelector<TypeAnchorTestElement>('type-anchor-test-element');
    anchor = fixture.querySelector<HTMLAnchorElement>('a');
    await elementIsStable(element);
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
    expect(element.matches(':state(anchor)')).toBe(true);
  });

  // it('should allow element to be wrapped in anchor', () => {
  //   let clicks = 0;
  //   anchorTwo.addEventListener('click', () => clicks++);

  //   emulateClick(anchorTwo);
  //   expect(clicks).toBe(1);

  //   expect(elementTwo.readonly).toBe(true);
  //   expect(anchorTwo.style.textDecoration).toBe('none');
  //   expect(elementTwo.style.cursor).toBe('pointer');
  //   expect(element.matches(':state(anchor)')).toBe(true);
  // });

  // it('should allow for element to pick up anchors that have been slotted in the shadow DOM', () => {
  //   const slotWrappedElement = slotTest?.shadowRoot.querySelector<TypeAnchorTestElement>('type-anchor-test-element');

  //   let clicks = 0;
  //   slottedAnchor.addEventListener('click', () => clicks++);

  //   emulateClick(slottedAnchor);
  //   expect(clicks).toBe(1);

  //   expect(slotWrappedElement.readonly).toBe(true);
  //   expect(slottedAnchor.style.textDecoration).toBe('');
  //   expect(slotWrappedElement.style.cursor).toBe('');
  // });
});

describe('type-anchor.controller wrapped element', () => {
  let fixture: HTMLElement;
  let element: TypeAnchorTestElement;
  let anchor: HTMLAnchorElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <a href="#"><type-anchor-test-element>anchor</type-anchor-test-element></a>
    `);

    element = fixture.querySelector<TypeAnchorTestElement>('type-anchor-test-element');
    anchor = fixture.querySelector<HTMLAnchorElement>('a');
    await elementIsStable(element);
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

  it('should allow element to be wrapped in anchor', () => {
    let clicks = 0;
    anchor.addEventListener('click', () => clicks++);

    emulateClick(anchor);
    expect(clicks).toBe(1);

    expect(element.readonly).toBe(true);
    expect(anchor.style.textDecoration).toBe('none');
    expect(element.style.cursor).toBe('pointer');
    expect(element.matches(':state(anchor)')).toBe(true);
  });
});
