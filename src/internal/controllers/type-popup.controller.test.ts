import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { PopupAlign, PopupPosition, TypePopupController } from '@elements/elements/internal';

@customElement('type-popup-controller-test-element')
class TypePopupControllerTestElement extends LitElement {
  @property({ type: String, reflect: true }) anchor: string | HTMLElement;

  @property({ type: String, reflect: true }) position: PopupPosition;

  @property({ type: String, reflect: true }) alignment: PopupAlign;

  @property({ type: String, reflect: true }) popupType: 'auto' | 'manual' | 'hint' = 'hint';

  @property({ type: Boolean, reflect: true }) arrow = true;

  get popupArrow() {
    return this.shadowRoot.querySelector<HTMLElement>('.arrow');
  }

  typePopupController = new TypePopupController<TypePopupControllerTestElement>(this);

  static styles = [css`
    :host {
      position: absolute;
      top: 0;
      left: 0;
    }

    dialog {
      border: 1px solid #ccc;
      padding: 18px;
      min-width: 80px;
      text-align: center;
      background: #fff;
      color: #2d2d2d;
      overflow: visible;
      position: fixed;
      margin: 0;
      z-index: 9999;
    }

    dialog::backdrop {
      background: #00000082;
    }

    .arrow {
      width: 18px;
      height: 18px;
      background: #fff;
      position: absolute;
    }

    :host(:not([anchor])) .arrow,
    :host([anchor*='body']) .arrow,
    :host([position*='center']) .arrow {
      display: none;
    }
  `];

  render() {
    return html`
      <dialog hidden>
        <button @click=${() => this.typePopupController.close()}>Close</button>
        <slot></slot>
        ${this.arrow ? html`<div class="arrow"></div>` : ''}
      </dialog>
    `;
  }
}

describe('type-popup.controller', () => {
  let element: TypePopupControllerTestElement;
  let dialog: HTMLDialogElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <button id="btn-anchor">anchor</button>
    <type-popup-controller-test-element id="btn-anchor" hidden></type-popup-controller-test-element>
    `);
    element = fixture.querySelector<TypePopupControllerTestElement>('type-popup-controller-test-element');
    dialog = element.shadowRoot.querySelector('dialog');
    await element.updateComplete;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define test element', () => {
    expect(customElements.get('type-popup-controller-test-element')).toBeDefined();
  });

  it('should position element to top of anchor', async () => {
    element.position = 'top';
    await elementIsStable(element);
    const { top, right, bottom, left } = dialog.getBoundingClientRect();
    // todo: until vitest supports headless browser testing these values will always be 0 as the element is not actually rendered
    expect(top).toBe(0);
    expect(right).toBe(0);
    expect(bottom).toBe(0);
    expect(left).toBe(0);
  });

  it('should sync hidden attribute of host element to the inner dialog element', async () => {
    await elementIsStable(element);
    expect(dialog.hidden).toBe(true);

    element.hidden = false;
    await elementIsStable(element);
    expect(dialog.hidden).toBe(false);
  });
});
