import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import type { PopoverAlign, PopoverPosition } from '@nvidia-elements/core/internal';
import { TypeNativeAnchorController } from '@nvidia-elements/core/internal';

@customElement('type-native-anchor-controller-test-element')
class TypeNativeAnchorControllerTestElement extends LitElement {
  @property({ type: Object }) anchor: HTMLElement | string;
  @property({ type: String }) position: PopoverPosition;
  @property({ type: String }) alignment: PopoverAlign;
  _internals: ElementInternals;
  _typeNativeAnchorController = new TypeNativeAnchorController(this);
}

describe('type-native-anchor.controller', () => {
  let element: TypeNativeAnchorControllerTestElement;
  let fixture: HTMLElement;
  let anchor: HTMLButtonElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`
        <type-native-anchor-controller-test-element popover anchor="anchor-btn" id="popover">popover</type-native-anchor-controller-test-element>
        <button id="anchor-btn" popovertarget="popover">popover</button>
      `
    );
    element = fixture.querySelector<TypeNativeAnchorControllerTestElement>(
      'type-native-anchor-controller-test-element'
    );
    anchor = fixture.querySelector('button');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should create a anchor fallback controller if browser does not support native css anchor positioning', async () => {
    const supports = globalThis.CSS?.supports;
    globalThis.CSS.supports = () => false;

    const element = document.createElement(
      'type-native-anchor-controller-test-element'
    ) as TypeNativeAnchorControllerTestElement;
    fixture.appendChild(element);
    await elementIsStable(element);

    element.dispatchEvent(new CustomEvent('beforetoggle'));
    await elementIsStable(element);

    expect(element._internals.states.has('anchor-positioning-fallback')).toBe(true);
    expect(element['_typeNativeAnchorController']['typeNativeAnchorFallbackController']).toBeTruthy();
    globalThis.CSS.supports = supports;
  });

  it('should associate anchor name to popover and anchor elements', async () => {
    await elementIsStable(element);
    element.anchor = anchor;
    await elementIsStable(element);
    expect((anchor.style as CSSStyleDeclaration & { anchorName: string }).anchorName.startsWith('--')).toBe(true);
    expect((element.style as CSSStyleDeclaration & { positionAnchor: string }).positionAnchor.startsWith('--')).toBe(
      true
    );
    expect((element.style as CSSStyleDeclaration & { positionAnchor: string }).positionAnchor).toBe(
      (anchor.style as CSSStyleDeclaration & { anchorName: string }).anchorName
    );
  });

  it('should set anchor-body state selector if element is anchored to body element', async () => {
    element.anchor = anchor;
    await elementIsStable(element);
    expect(element.matches(':state(anchor-body)')).toBe(false);

    element.anchor = globalThis.document.body;
    await elementIsStable(element);
    expect(element.matches(':state(anchor-body)')).toBe(true);
  });
});
