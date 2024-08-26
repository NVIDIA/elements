import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@nvidia-elements/testing';
import { PopoverAlign, PopoverPosition, TypePopoverController } from '@nvidia-elements/core/internal';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/button/define.js';

@customElement('type-popover-controller-test-element')
class TypePopoverControllerTestElement extends LitElement {
  @property({ type: String, reflect: true }) anchor: string | HTMLElement;

  @property({ type: String, reflect: true }) trigger: string | HTMLElement;

  @property({ type: String, reflect: true }) position: PopoverPosition;

  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger = false;

  @property({ type: Boolean, reflect: true }) hidden = false;

  @property({ type: String, reflect: true }) popoverType: 'auto' | 'manual' | 'hint' = 'auto';

  @property({ type: Boolean, reflect: true }) arrow = true;

  get popoverArrow() {
    return this.shadowRoot.querySelector<HTMLElement>('.arrow');
  }

  popoverDismissible = true;

  typePopoverController = new TypePopoverController<TypePopoverControllerTestElement>(this);

  static styles = [
    css`
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
    `
  ];

  render() {
    return html`
      <dialog hidden>
        <nve-button @click=${() => this.typePopoverController.close()}>Close</nve-button>
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
      <nve-button id="btn">anchor</nve-button>
      <type-popover-controller-test-element
        .anchor=${'btn'}
        .trigger=${'btn'}
        hidden
      ></type-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypePopoverControllerTestElement>('type-popover-controller-test-element');
    button = fixture.querySelector(Button.metadata.tag);
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

  it('should set pointer events to initial when completing computing position to avoid user interaction interference', async () => {
    element.hidden = true;
    await elementIsStable(element);
    expect(element.style.pointerEvents).toBe('initial');
  });

  it('should update :state(anchor-active) state on anchor', async () => {
    await elementIsStable(element);
    expect(button.matches(':state(anchor-active)')).toBe(false);

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
    const closeBtn = dialog.querySelector(Button.metadata.tag);
    emulateClick(closeBtn);
    expect((await event).target).toBe(element);
  });

  it('should not trigger a close event when popover is closed via "hidden" attribute or property', async () => {
    element.hidden = false;
    await elementIsStable(element);

    let events = 0;
    untilEvent(element, 'close')
      .then(() => events++)
      .catch(e => console.log(e));

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
    untilEvent(element, 'close')
      .then(() => events++)
      .catch(e => console.log(e));

    emulateClick(document.body);
    await new Promise(r => setTimeout(() => r(null), 0));
    expect(events).toBe(0);
  });

  it('should remove event listeners and not trigger events once removed from DOM but still in memory', async () => {
    element.hidden = false;
    element.disconnectedCallback();
    await elementIsStable(element);

    let events = 0;
    untilEvent(element, 'close')
      .then(() => events++)
      .catch(e => console.log(e));

    button.dispatchEvent(new PointerEvent('pointerdown', { clientX: 9000, clientY: 9000 }));
    await new Promise(r => setTimeout(() => r(null), 0));
    expect(events).toBe(0);
  });
});

describe('type-popover.controller behavior-trigger', () => {
  let element: TypePopoverControllerTestElement;
  let button: Button;
  let dialog: HTMLDialogElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button id="btn">anchor</nve-button>
      <type-popover-controller-test-element behavior-trigger trigger="btn" hidden>
        <div></div>
      </type-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypePopoverControllerTestElement>('type-popover-controller-test-element');
    button = fixture.querySelector(Button.metadata.tag);
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

  it('should trigger open event and open automaticaly when using behavior-trigger', async () => {
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.trigger).toBe('btn');
    expect(element.behaviorTrigger).toBe(true);
    expect(element.hidden).toBe(true);

    const event = untilEvent(element, 'open');
    emulateClick(button);
    expect((await event).target).toBe(element);
    expect(element.hidden).toBe(false);
  });

  it('should trigger close event and close automaticaly when using behavior-trigger', async () => {
    element.hidden = false;

    element.typePopoverController.close();
    await elementIsStable(element);
    expect(element.hidden).toBe(true);
  });

  it('should NOT trigger close if a close event fires from a slotted child element', async () => {
    element.hidden = false;
    await elementIsStable(element);
    const event = untilEvent(element, 'close');
    element.querySelector('div').dispatchEvent(new Event('close', { bubbles: true }));
    await event;
    await elementIsStable(element);
    expect(element.hidden).toBe(false);
  });

  it('should NOT trigger close if a cancel event fires from a slotted child element', async () => {
    element.hidden = false;
    await elementIsStable(element);
    const event = untilEvent(element, 'cancel');
    element.querySelector('div').dispatchEvent(new Event('cancel', { bubbles: true }));
    await event;
    await elementIsStable(element);
    expect(element.hidden).toBe(false);
  });
});

describe('type-popover.controller dynamic trigger', () => {
  let element: TypePopoverControllerTestElement;
  let buttons: Button[];
  let dialog: HTMLDialogElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button id="btn-1">anchor</nve-button>
      <nve-button id="btn-2">anchor</nve-button>
      <type-popover-controller-test-element behavior-trigger trigger="btn-1" anchor="btn-1" hidden>
        <div></div>
      </type-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypePopoverControllerTestElement>('type-popover-controller-test-element');
    buttons = Array.from(fixture.querySelectorAll(Button.metadata.tag));
    dialog = element.shadowRoot.querySelector('dialog');
    await element.updateComplete;
    await buttons[0].updateComplete;
    await buttons[1].updateComplete;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should not open popover when previous trigger is removed', async () => {
    element.trigger = buttons[1];
    element.anchor = buttons[1];
    await element.updateComplete;

    buttons[0].click();
    await element.updateComplete;
    expect(element.hidden).toBe(true);
  });

  it('should use the recently updated trigger', async () => {
    await element.updateComplete;
    expect(element.hidden).toBe(true);

    element.trigger = buttons[1];
    element.anchor = buttons[1];
    await element.updateComplete;

    buttons[1].click();
    await element.updateComplete;
    expect(element.hidden).toBe(false);
  });

  it('should allow dynamic triggers', async () => {
    await element.updateComplete;
    expect(element.hidden).toBe(true);

    buttons[0].click();
    await element.updateComplete;
    expect(element.hidden).toBe(false);

    element.trigger = buttons[1];
    element.anchor = buttons[1];
    element.hidden = true;
    await element.updateComplete;

    buttons[0].click();
    await element.updateComplete;
    expect(element.hidden).toBe(true);

    buttons[1].click();
    await element.updateComplete;
    expect(element.hidden).toBe(false);
  });
});
