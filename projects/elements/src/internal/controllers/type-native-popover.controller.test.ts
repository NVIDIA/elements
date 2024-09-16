import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@nvidia-elements/testing';
import { PopoverAlign, PopoverPosition, TypeNativePopoverController } from '@nvidia-elements/core/internal';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/button/define.js';

@customElement('type-native-popover-controller-test-element')
class TypeNativePopoverControllerTestElement extends LitElement {
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

  typeNativePopoverController = new TypeNativePopoverController<TypeNativePopoverControllerTestElement>(this);

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
      <div internal-host>
        <nve-button @click=${this.hidePopover}>Close</nve-button>
        <slot></slot>
        ${this.arrow ? html`<div class="arrow"></div>` : ''}
      </div>
    `;
  }
}

describe('type-popover.controller', () => {
  let element: TypeNativePopoverControllerTestElement;
  let button: Button;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button popovertarget="popover">anchor</nve-button>
      <type-native-popover-controller-test-element id="popover"></type-native-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    button = fixture.querySelector(Button.metadata.tag);
    await element.updateComplete;
    await button.updateComplete;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define test element', () => {
    expect(customElements.get('type-native-popover-controller-test-element')).toBeDefined();
  });

  it('should update :state(anchor-active) state on anchor', async () => {
    await elementIsStable(element);
    expect(button.matches(':state(anchor-active)')).toBe(false);
  });

  it('should default to closed', async () => {
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);
  });

  it('should trigger open event when popover open', async () => {
    const event = untilEvent(element, 'open');
    element.showPopover();
    expect((await event).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should trigger close event when popover closed', async () => {
    const open = untilEvent(element, 'open');
    element.showPopover();
    expect((await open).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);

    const close = untilEvent(element, 'close');
    element.hidePopover();
    expect((await close).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(false);
  });

  it('should open popover when trigger is activated', async () => {
    const event = untilEvent(element, 'open');
    emulateClick(button);
    expect((await event).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should close popover when trigger is activated', async () => {
    const open = untilEvent(element, 'open');
    emulateClick(button);
    expect((await open).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);

    const close = untilEvent(element, 'close');
    emulateClick(button);
    expect((await close).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(false);
  });
});

describe('type-popover.controller explicit trigger', () => {
  let element: TypeNativePopoverControllerTestElement;
  let button: Button;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button id="btn">anchor</nve-button>
      <type-native-popover-controller-test-element
        .anchor=${'btn'}
        .trigger=${'btn'}
        hidden
      ></type-native-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    button = fixture.querySelector(Button.metadata.tag);
    await element.updateComplete;
    await button.updateComplete;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define test element', () => {
    expect(customElements.get('type-native-popover-controller-test-element')).toBeDefined();
  });

  it('should update :state(anchor-active) state on anchor', async () => {
    await elementIsStable(element);
    expect(button.matches(':state(anchor-active)')).toBe(false);
  });

  it('should trigger close event when associated trigger is activated', async () => {
    element.showPopover();
    await elementIsStable(element);
    const event = untilEvent(element, 'close');
    const closeBtn = element.shadowRoot.querySelector(Button.metadata.tag);
    emulateClick(closeBtn);
    expect((await event).target).toBe(element);
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
    element.showPopover();
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
    element.showPopover();
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

  it('should show popover if hidden attribute is removed', async () => {
    const open = untilEvent(element, 'open');
    element.removeAttribute('hidden');
    expect((await open).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should hide popover if hidden attribute is added', async () => {
    expect(element.hasAttribute('hidden')).toBe(true);
    expect(element.matches(':popover-open')).toBe(false);

    const open = untilEvent(element, 'open');
    element.removeAttribute('hidden');
    expect((await open).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);

    const close = untilEvent(element, 'close');
    element.setAttribute('hidden', '');
    expect((await close).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(false);
  });
});

describe('type-popover.controller explicit dynamic trigger', () => {
  let element: TypeNativePopoverControllerTestElement;
  let buttons: Button[];
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button id="btn-1">anchor</nve-button>
      <nve-button id="btn-2">anchor</nve-button>
      <type-native-popover-controller-test-element behavior-trigger trigger="btn-1" anchor="btn-1" hidden>
        <div></div>
      </type-native-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    buttons = Array.from(fixture.querySelectorAll(Button.metadata.tag));
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
    expect(element.hidden).toBe(true);

    emulateClick(buttons[0]);
    await element.updateComplete;
    expect(element.hidden).toBe(true);
  });

  it('should use the recently updated trigger', async () => {
    await element.updateComplete;
    expect(element.hidden).toBe(true);

    element.trigger = buttons[1];
    element.anchor = buttons[1];
    await element.updateComplete;

    emulateClick(buttons[1]);
    await element.updateComplete;
    expect(element.hidden).toBe(false);
  });

  it('should allow dynamic triggers', async () => {
    await element.updateComplete;
    expect(element.hidden).toBe(true);
    expect(element.behaviorTrigger).toBe(true);

    emulateClick(buttons[0]);
    await element.updateComplete;
    expect(element.hidden).toBe(false);

    element.trigger = buttons[1];
    element.anchor = buttons[1];
    await element.updateComplete;

    emulateClick(buttons[0]);
    await element.updateComplete;
    expect(element.hidden).toBe(false);
    expect(buttons[0].popoverTargetElement).toBe(null);
    expect(buttons[0].hasAttribute('popovertarget')).toBe(false);
    expect(buttons[1].popoverTargetElement).toBe(element);
    expect(buttons[1].hasAttribute('popovertarget')).toBe(true);

    const event = untilEvent(element, 'close');
    emulateClick(buttons[1]);
    expect((await event).target).toBe(element);
    expect(element.hidden).toBe(true);
  });
});

describe('type-popover.controller legacy behavior-trigger', () => {
  let element: TypeNativePopoverControllerTestElement;
  let button: Button;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button id="btn">anchor</nve-button>
      <type-native-popover-controller-test-element behavior-trigger trigger="btn" hidden>
        <div></div>
      </type-native-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    button = fixture.querySelector(Button.metadata.tag);
    await element.updateComplete;
    await button.updateComplete;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define test element', () => {
    expect(customElements.get('type-native-popover-controller-test-element')).toBeDefined();
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
    element.behaviorTrigger = true;
    const open = untilEvent(element, 'open');
    element.showPopover();
    expect((await open).target).toBe(element);
    expect(element.hidden).toBe(false);

    const close = untilEvent(element, 'close');
    element.hidePopover();
    expect((await close).target).toBe(element);
    expect(element.hidden).toBe(true);
  });

  it('should NOT trigger close if a close event fires from a slotted child element', async () => {
    element.showPopover();
    await elementIsStable(element);
    const event = untilEvent(element, 'close');
    element.querySelector('div').dispatchEvent(new Event('close', { bubbles: true }));
    await event;
    await elementIsStable(element);
    expect(element.hidden).toBe(false);
  });

  it('should NOT trigger close if a cancel event fires from a slotted child element', async () => {
    element.showPopover();
    await elementIsStable(element);
    const event = untilEvent(element, 'cancel');
    element.querySelector('div').dispatchEvent(new Event('cancel', { bubbles: true }));
    await event;
    await elementIsStable(element);
    expect(element.hidden).toBe(false);
  });
});
