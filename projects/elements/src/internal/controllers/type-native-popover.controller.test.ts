import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@nvidia-elements/testing';
import {
  PopoverAlign,
  PopoverPosition,
  popoverStyles,
  TypeNativePopoverController,
  useStyles
} from '@nvidia-elements/core/internal';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/button/define.js';

@customElement('type-native-popover-controller-test-element')
class TypeNativePopoverControllerTestElement extends LitElement {
  @property({ type: String, reflect: true }) anchor: string | HTMLElement;

  @property({ type: String, reflect: true }) trigger: string | HTMLElement;

  @property({ type: String, reflect: true }) position: PopoverPosition;

  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  @property({ type: Number }) openDelay: number;

  @property({ type: Number }) closeTimeout: number;

  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger = false;

  @property({ type: String, reflect: true }) popoverType: 'auto' | 'manual' | 'hint' = 'auto';

  @property({ type: Boolean, reflect: true }) arrow = true;

  @property({ type: Boolean, reflect: true }) modal = false;

  get popoverArrow() {
    return this.shadowRoot.querySelector<HTMLElement>('.arrow');
  }

  popoverDismissible = true;

  typeNativePopoverController = new TypeNativePopoverController<TypeNativePopoverControllerTestElement>(this);

  static styles = useStyles([popoverStyles]);

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

  it('should render inert backdrop if popover is type modal', async () => {
    element.modal = true;
    await elementIsStable(element);
    expect(element.hasAttribute('modal')).toBe(true);
    expect(getComputedStyle(element, ':before').getPropertyValue('content')).toBe('" "');
  });

  it('should close popover if inert modal is rendered and clicked outside of popover bounds', async () => {
    element.modal = true;
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    emulateClick(button);
    expect((await open).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);

    element.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 0 }));
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);
  });

  it('should not close popover if modal type reports popover is not dismissable', async () => {
    element.modal = true;
    element.popoverDismissible = false;
    await elementIsStable(element);

    const open = untilEvent(element, 'open');
    emulateClick(button);
    expect((await open).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);

    element.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 0 }));
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should not close popover if modal type and nested child popover is open', async () => {
    element.modal = true;
    element.popoverDismissible = true;

    const childPopover = document.createElement('div');
    childPopover.popover = 'auto';
    element.appendChild(childPopover);

    // open parent popover
    const open = untilEvent(element, 'open');
    emulateClick(button);
    expect((await open).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);

    // open child popover
    childPopover.showPopover();
    expect(element.matches(':popover-open')).toBe(true);
    expect(childPopover.matches(':popover-open')).toBe(true);

    // close child popover, parent remains open
    element.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 0 }));
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('if popover is open it should not be inert', async () => {
    expect(element.inert).toBe(true);
    const event = untilEvent(element, 'open');
    element.showPopover();
    expect((await event).target).toBe(element);
    expect(element.inert).toBe(false);
  });
});

describe('type-popover.controller - default open', () => {
  let element: TypeNativePopoverControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <type-native-popover-controller-test-element></type-native-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    await element.updateComplete;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define test element', () => {
    expect(customElements.get('type-native-popover-controller-test-element')).toBeDefined();
  });

  it('if popover is open by default with no triggers it should not be inert', async () => {
    await elementIsStable(element);
    expect(element.inert).toBe(false);
  });
});

describe('type-popover.controller escaped id selectors', () => {
  let element: TypeNativePopoverControllerTestElement;
  let button: Button;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button>anchor</nve-button>
      <type-native-popover-controller-test-element></type-native-popover-controller-test-element>
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

  it('should not show popover by default due to correct id matching of escaped characters', async () => {
    button.popovertarget = ':popover';
    element.id = ':popover';
    await elementIsStable(element);
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
    await new Promise(r => requestAnimationFrame(r));
    await elementIsStable(element);
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

    const open = untilEvent(element, 'open');
    emulateClick(buttons[1]);
    await open;
    await element.updateComplete;
    expect(element.hidden).toBe(false);
  });

  it('should allow dynamic triggers', async () => {
    await element.updateComplete;
    expect(element.hidden).toBe(true);
    expect(element.behaviorTrigger).toBe(true);

    const open = untilEvent(element, 'open');
    emulateClick(buttons[0]);
    await element.updateComplete;
    await open;
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
    const open = untilEvent(element, 'open');
    element.showPopover();
    await open;
    await elementIsStable(element);

    const close = untilEvent(element, 'close');
    element.querySelector('div').dispatchEvent(new Event('close', { bubbles: true }));
    await close;
    await elementIsStable(element);
    expect(element.hidden).toBe(false);
  });

  it('should NOT trigger close if a cancel event fires from a slotted child element', async () => {
    const open = untilEvent(element, 'open');
    element.showPopover();
    await open;
    await elementIsStable(element);

    const cancel = untilEvent(element, 'cancel');
    element.querySelector('div').dispatchEvent(new Event('cancel', { bubbles: true }));
    await cancel;
    await elementIsStable(element);
    expect(element.hidden).toBe(false);
  });
});

describe('type-popover.controller - hint', () => {
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
    element.popoverType = 'hint';
    button = fixture.querySelector(Button.metadata.tag);
    await element.updateComplete;
    await button.updateComplete;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should open hint popover type when focused', async () => {
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    button.focus();
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should close hint popover type when blured', async () => {
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    button.focus();
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);

    button.blur();
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);
  });

  it('should open with delay when openDelay is set', async () => {
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    element.openDelay = 5;
    button.focus();

    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    await new Promise(r => setTimeout(() => r(null), 10));
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should close with delay when a closeTimeout is set', async () => {
    await elementIsStable(element);
    element.closeTimeout = 5;
    element.showPopover();
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);

    const toggle = await untilEvent(element, 'toggle');
    const close = await untilEvent(element, 'close');
    await new Promise(r => setTimeout(() => r(null), 10));
    expect(await toggle).toBeDefined();
    expect(await close).toBeDefined();
    expect(element.matches(':popover-open')).toBe(false);
  });
});
