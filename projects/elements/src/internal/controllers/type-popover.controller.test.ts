import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@elements/elements/test';
import { PopoverAlign, PopoverPosition, TypePopoverController } from '@elements/elements/internal';
import type { Button } from '@elements/elements/button';
import '@elements/elements/button/define.js';

@customElement('type-popover-controller-test-element')
class TypePopoverControllerTestElement extends LitElement {
  @property({ type: String, reflect: true }) anchor: string | HTMLElement;

  @property({ type: String, reflect: true }) trigger: string | HTMLElement;

  @property({ type: String, reflect: true }) position: PopoverPosition;

  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  @property({ type: String, reflect: true }) popoverType: 'auto' | 'manual' | 'hint' = 'auto';

  @property({ type: Boolean, reflect: true }) arrow = true;

  get popoverArrow() {
    return this.shadowRoot.querySelector<HTMLElement>('.arrow');
  }

  popoverDismissible = true;

  typePopoverController = new TypePopoverController<TypePopoverControllerTestElement>(this);

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
        <mlv-button @click=${() => this.typePopoverController.close()}>Close</mlv-button>
        <slot></slot>
        ${this.arrow ? html`<div class="arrow"></div>` : ''}
      </dialog>
    `;
  }
}

describe('type-popover.controller', () => {
  let element: TypePopoverControllerTestElement;
  let dialog: HTMLDialogElement;
  let button: Button;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <mlv-button id="btn">anchor</mlv-button>
    <type-popover-controller-test-element .anchor=${'btn'} .trigger=${'btn'} hidden></type-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypePopoverControllerTestElement>('type-popover-controller-test-element');
    button = fixture.querySelector('mlv-button');
    dialog = element.shadowRoot.querySelector('dialog');
    await element.updateComplete;
    await button.updateComplete;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define test element', () => {
    expect(customElements.get('type-popover-controller-test-element')).toBeDefined();
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
    expect(element.inert).toBe(true);

    element.hidden = false;
    await elementIsStable(element);
    expect(element.inert).toBe(false);
  });

  it('should update :--anchor-active state on anchor', async () => {
    await elementIsStable(element);
    expect(button.matches(':--anchor-active')).toBe(false);

    // happy-dom not trigger attribute observer
    // element.setAttribute('hidden', '');
    // element.hidden = true;
    // element.requestUpdate();
    // await elementIsStable(element);
    // await elementIsStable(button);
    // expect(button.matches('[state--anchor-active]')).toBe(true);
  });

  it('should trigger close event when associated trigger is activated', async () => {
    element.hidden = false;
    await elementIsStable(element);
    const event = untilEvent(element, 'close');
    const closeBtn = dialog.querySelector('mlv-button');
    emulateClick(closeBtn);
    expect((await event).target).toBe(element);
  });

  it('should not trigger a close event when popover is closed via "hidden" attribute or property', async () => {
    element.hidden = false;
    await elementIsStable(element);

    let events = 0;
    untilEvent(element, 'close').then(() => events++);

    element.hidden = true;
    await elementIsStable(element);
    
    await new Promise(r => setTimeout(() => r(null), 0));
    expect(events).toBe(0);
  });

  it('should trigger open event when associated trigger is activated', async () => {
    element.requestUpdate();
    await elementIsStable(element);

    expect(element.trigger).toBe('btn');
    expect(element.anchor).toBe('btn');

    const event = untilEvent(element, 'open');
    emulateClick(button);
    expect((await event).target).toBe(element);
  });

  it('should not trigger a close event when element is not dismissable', async () => {
    element.hidden = false;
    element.popoverDismissible = false;
    await elementIsStable(element);

    let events = 0;
    untilEvent(element, 'close').then(() => events++);

    emulateClick(document.body);
    await new Promise(r => setTimeout(() => r(null), 0));
    expect(events).toBe(0);
  });

  // it('should not throw if disconnected before setup', async () => {
  //   const el = document.createElement('type-popover-controller-test-element') as any;
  //   el.parentNode = fixture;
  //   fixture.appendChild(el);
  //   element.remove();
  // });
});
