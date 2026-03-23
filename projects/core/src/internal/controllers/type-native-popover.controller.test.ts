import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@internals/testing';
import type { PopoverAlign, PopoverPosition } from '@nvidia-elements/core/internal';
import { popoverStyles, TypeNativePopoverController, useStyles } from '@nvidia-elements/core/internal';
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

  @property({ type: Boolean, reflect: true }) hidden = false;

  @property({ type: Object }) popoverTargetElement: HTMLElement;

  _activeTrigger: HTMLElement;

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

    element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0 }));
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

    element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0 }));
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
    element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0 }));
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

  it('should update :state(transition-start) on beforetoggle for animation', async () => {
    await elementIsStable(element);

    const event = untilEvent(element, 'beforetoggle');
    element.showPopover();
    expect((await event).target).toBe(element);
    expect(element.matches(':state(transition-start)')).toBe(true);
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
      <nve-button popovertarget=":popover">anchor</nve-button>
      <type-native-popover-controller-test-element id=":popover"></type-native-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    button = fixture.querySelector(Button.metadata.tag);
    await elementIsStable(element);
    await elementIsStable(button);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should not show popover by default due to correct id matching of escaped characters', () => {
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
    await new Promise(r => requestAnimationFrame(r)); // wait for hidden mutation observer setup
    await elementIsStable(element);
    const open = untilEvent(element, 'open');
    element.removeAttribute('hidden');
    expect((await open).target).toBe(element);
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should hide popover if hidden attribute is added', async () => {
    await new Promise(r => requestAnimationFrame(r)); // wait for hidden mutation observer setup
    await elementIsStable(element);
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
    await elementIsStable(element);
    expect(element.hidden).toBe(true);

    emulateClick(buttons[0]);
    await elementIsStable(element);
    expect(element.hidden).toBe(true);
  });

  it('should use the recently updated trigger', async () => {
    await elementIsStable(element);
    expect(element.hidden).toBe(true);

    element.trigger = buttons[1];
    element.anchor = buttons[1];
    await element.updateComplete;

    const open = untilEvent(element, 'open');
    emulateClick(buttons[1]);
    await open;
    await elementIsStable(element);
    expect(element.hidden).toBe(false);
  });

  it('should allow dynamic triggers', async () => {
    await elementIsStable(element);
    expect(element.hidden).toBe(true);
    expect(element.behaviorTrigger).toBe(true);

    const open = untilEvent(element, 'open');
    emulateClick(buttons[0]);
    await open;
    await elementIsStable(element);
    expect(element.hidden).toBe(false);

    element.trigger = buttons[1];
    element.anchor = buttons[1];
    await elementIsStable(element);

    emulateClick(buttons[0]);
    await elementIsStable(element);
    expect(element.hidden).toBe(false);
    expect(buttons[0].popoverTargetElement).toBe(null);
    expect(buttons[0].hasAttribute('popovertarget')).toBe(false);
    expect(buttons[1].popoverTargetElement).toBe(element);
    expect(buttons[1].hasAttribute('popovertarget')).toBe(true);

    const event = untilEvent(element, 'close');
    emulateClick(buttons[1]);
    expect((await event).target).toBe(element);
    await elementIsStable(element);
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
    await elementIsStable(element);
    expect(element.hidden).toBe(false);
  });

  it('should trigger close event and close automaticaly when using behavior-trigger', async () => {
    element.behaviorTrigger = true;
    const open = untilEvent(element, 'open');
    element.showPopover();
    expect((await open).target).toBe(element);
    await elementIsStable(element);
    expect(element.hidden).toBe(false);

    const close = untilEvent(element, 'close');
    element.hidePopover();
    expect((await close).target).toBe(element);
    await elementIsStable(element);
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

describe('type-popover.controller - legacy popovertarget hint', () => {
  let element: TypeNativePopoverControllerTestElement;
  let button: Button;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button popovertarget="popover">anchor</nve-button>
      <type-native-popover-controller-test-element id="popover" .openDelay=${0} .popoverType=${'hint'}></type-native-popover-controller-test-element>
    `);
    element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    button = fixture.querySelector(Button.metadata.tag);
    await element.updateComplete;
    await button.updateComplete;
    element.hidePopover();
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

  it('should find shadow root active triggers', async () => {
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);
    element._activeTrigger = undefined;

    const shadowHost = document.createElement('div');
    shadowHost.attachShadow({ mode: 'open', delegatesFocus: true });
    button.remove();
    shadowHost.shadowRoot.appendChild(button);
    document.body.appendChild(shadowHost);

    element.requestUpdate();
    await elementIsStable(element);

    shadowHost.focus();
    await elementIsStable(element);
    expect(button.matches(':focus')).toBe(true);
  });
});

describe('type-popover.controller - close timeout', () => {
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

  it('should close with delay when a closeTimeout is set', async () => {
    await elementIsStable(element);
    element.closeTimeout = 5;
    element.showPopover();
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);

    const toggle = untilEvent(element, 'toggle');
    const close = untilEvent(element, 'close');
    expect(await toggle).toBeDefined();
    expect(await close).toBeDefined();
    expect(element.matches(':popover-open')).toBe(false);
  });
});

describe('type-popover.controller - invoker command support', () => {
  let element: TypeNativePopoverControllerTestElement;
  let button: Button;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button commandfor="popover" command="toggle-popover">anchor</nve-button>
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

  it('should toggle popover when command is triggered', async () => {
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    const event = untilEvent<Event & { source: HTMLElement; command: string }>(element, 'command');
    await emulateClick(button);
    const { source, command } = await event;
    expect(source).toBe(button);
    expect(command).toBe('toggle-popover');
    expect(element.matches(':popover-open')).toBe(true);
  });
});

describe('type-popover.controller - interest invoker support', () => {
  let element: TypeNativePopoverControllerTestElement;
  let button: Button;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-button interestfor="popover">anchor</nve-button>
      <type-native-popover-controller-test-element id="popover" .openDelay=${0}></type-native-popover-controller-test-element>
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

  it('should show popover when interest event is dispatched from custom element', async () => {
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    const interestEvent = new Event('interest', { cancelable: true }) as Event & { source: HTMLElement };
    interestEvent.source = button;
    element.dispatchEvent(interestEvent);
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should hide popover when loseinterest event is dispatched from custom element', async () => {
    await elementIsStable(element);
    element.showPopover();
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);

    const loseInterestEvent = new Event('loseinterest', { cancelable: true }) as Event & { source: HTMLElement };
    loseInterestEvent.source = button;
    element.dispatchEvent(loseInterestEvent);
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);
  });

  it('should not show popover when interest event source is not a custom element', async () => {
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    const nativeDiv = document.createElement('div');
    const interestEvent = new Event('interest', { cancelable: true }) as Event & { source: HTMLElement };
    interestEvent.source = nativeDiv;
    element.dispatchEvent(interestEvent);
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);
  });

  it('should not hide popover when loseinterest event source is not a custom element', async () => {
    await elementIsStable(element);
    element.showPopover();
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);

    const nativeDiv = document.createElement('div');
    const loseInterestEvent = new Event('loseinterest', { cancelable: true }) as Event & { source: HTMLElement };
    loseInterestEvent.source = nativeDiv;
    element.dispatchEvent(loseInterestEvent);
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should delay showing popover when openDelay is set', async () => {
    element.openDelay = 20;
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    const interestEvent = new Event('interest', { cancelable: true }) as Event & { source: HTMLElement };
    interestEvent.source = button;
    element.dispatchEvent(interestEvent);
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    await new Promise(r => setTimeout(r, 30));
    expect(element.matches(':popover-open')).toBe(true);
  });

  it('should cancel delayed show when loseinterest event is dispatched before delay completes', async () => {
    element.openDelay = 50;
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    const interestEvent = new Event('interest', { cancelable: true }) as Event & { source: HTMLElement };
    interestEvent.source = button;
    element.dispatchEvent(interestEvent);
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    // Dispatch loseinterest before delay completes
    const loseInterestEvent = new Event('loseinterest', { cancelable: true }) as Event & { source: HTMLElement };
    loseInterestEvent.source = button;
    element.dispatchEvent(loseInterestEvent);

    // Wait for original delay to pass
    await new Promise(r => setTimeout(r, 60));
    expect(element.matches(':popover-open')).toBe(false);
  });
});

describe('type-popover.controller - showPopover source fallback', () => {
  it('should use explicitly provided source when calling showPopover with options', async () => {
    const fixture = await createFixture(html`
      <nve-button id="explicit-source">source</nve-button>
      <type-native-popover-controller-test-element id="popover"></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    const sourceButton = fixture.querySelector<Button>('#explicit-source');
    await elementIsStable(element);
    await elementIsStable(sourceButton);

    const openEvent = untilEvent<CustomEvent>(element, 'open');
    element.showPopover({ source: sourceButton });
    const event = await openEvent;
    expect(event.detail.trigger).toBe(sourceButton);
    removeFixture(fixture);
  });

  it('should fallback to anchor property when showPopover is called without source', async () => {
    const fixture = await createFixture(html`
      <nve-button id="anchor-btn">anchor</nve-button>
      <type-native-popover-controller-test-element id="popover" .anchor=${'anchor-btn'}></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    const anchorButton = fixture.querySelector<Button>('#anchor-btn');
    await elementIsStable(element);
    await elementIsStable(anchorButton);

    const openEvent = untilEvent<CustomEvent>(element, 'open');
    element.showPopover();
    const event = await openEvent;
    expect(event.detail.trigger).toBe(anchorButton);
    removeFixture(fixture);
  });

  it('should fallback to trigger property when showPopover is called without source and no anchor', async () => {
    const fixture = await createFixture(html`
      <nve-button id="trigger-btn">trigger</nve-button>
      <type-native-popover-controller-test-element id="popover" .trigger=${'trigger-btn'} hidden></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    const triggerButton = fixture.querySelector<Button>('#trigger-btn');
    await elementIsStable(element);
    await elementIsStable(triggerButton);

    const openEvent = untilEvent<CustomEvent>(element, 'open');
    element.showPopover();
    const event = await openEvent;
    expect(event.detail.trigger).toBe(triggerButton);
    removeFixture(fixture);
  });

  it('should fallback to document.activeElement when showPopover is called without source, anchor, or trigger', async () => {
    const fixture = await createFixture(html`
      <nve-button id="focused-btn">focused</nve-button>
      <type-native-popover-controller-test-element id="popover"></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    const focusedButton = fixture.querySelector<Button>('#focused-btn');
    await elementIsStable(element);
    await elementIsStable(focusedButton);

    focusedButton.focus();
    await elementIsStable(focusedButton);

    const openEvent = untilEvent<CustomEvent>(element, 'open');
    element.showPopover();
    const event = await openEvent;
    expect(event.detail.trigger).toBe(focusedButton);
    removeFixture(fixture);
  });

  it('should prefer explicit source over anchor property', async () => {
    const fixture = await createFixture(html`
      <nve-button id="explicit-source">explicit</nve-button>
      <nve-button id="anchor-btn">anchor</nve-button>
      <type-native-popover-controller-test-element id="popover" .anchor=${'anchor-btn'}></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    const explicitSource = fixture.querySelector<Button>('#explicit-source');
    const anchorButton = fixture.querySelector<Button>('#anchor-btn');
    await elementIsStable(element);
    await elementIsStable(explicitSource);
    await elementIsStable(anchorButton);

    const openEvent = untilEvent<CustomEvent>(element, 'open');
    element.showPopover({ source: explicitSource });
    const event = await openEvent;
    expect(event.detail.trigger).toBe(explicitSource);
    expect(event.detail.trigger).not.toBe(anchorButton);
    removeFixture(fixture);
  });

  it('should prefer anchor over trigger property', async () => {
    const fixture = await createFixture(html`
      <nve-button id="anchor-btn">anchor</nve-button>
      <nve-button id="trigger-btn">trigger</nve-button>
      <type-native-popover-controller-test-element id="popover" .anchor=${'anchor-btn'} .trigger=${'trigger-btn'} hidden></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    const anchorButton = fixture.querySelector<Button>('#anchor-btn');
    const triggerButton = fixture.querySelector<Button>('#trigger-btn');
    await elementIsStable(element);
    await elementIsStable(anchorButton);
    await elementIsStable(triggerButton);

    const openEvent = untilEvent<CustomEvent>(element, 'open');
    element.showPopover();
    const event = await openEvent;
    expect(event.detail.trigger).toBe(anchorButton);
    expect(event.detail.trigger).not.toBe(triggerButton);
    removeFixture(fixture);
  });
});

describe('type-popover.controller - dynamic DOM creation', () => {
  it('should open popover when dynamically created without trigger or anchor', async () => {
    const fixture = await createFixture(html`<nve-button id="focus-target">focus</nve-button>`);
    const focusTarget = fixture.querySelector<Button>('#focus-target');
    await elementIsStable(focusTarget);

    focusTarget.focus();

    const element = document.createElement(
      'type-native-popover-controller-test-element'
    ) as TypeNativePopoverControllerTestElement;
    element.id = 'dynamic-popover';
    fixture.appendChild(element);
    await element.updateComplete;
    await elementIsStable(element);

    const openEvent = untilEvent<CustomEvent>(element, 'open');
    element.showPopover();
    const event = await openEvent;

    expect(element.matches(':popover-open')).toBe(true);
    expect(event.detail.trigger).toBe(focusTarget);
    removeFixture(fixture);
  });

  it('should open popover when dynamically created with explicit source', async () => {
    const fixture = await createFixture(html`<nve-button id="source-btn">source</nve-button>`);
    const sourceButton = fixture.querySelector<Button>('#source-btn');
    await elementIsStable(sourceButton);

    const element = document.createElement(
      'type-native-popover-controller-test-element'
    ) as TypeNativePopoverControllerTestElement;
    element.id = 'dynamic-popover';
    fixture.appendChild(element);
    await element.updateComplete;
    await elementIsStable(element);

    const openEvent = untilEvent<CustomEvent>(element, 'open');
    element.showPopover({ source: sourceButton });
    const event = await openEvent;

    expect(element.matches(':popover-open')).toBe(true);
    expect(event.detail.trigger).toBe(sourceButton);
    removeFixture(fixture);
  });
});

describe('type-popover.controller - interest timeout cleanup on disconnect', () => {
  it('should cancel pending interest timeout when element is disconnected', async () => {
    const fixture = await createFixture(html`
      <nve-button interestfor="popover">anchor</nve-button>
      <type-native-popover-controller-test-element id="popover" .openDelay=${50}></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    const button = fixture.querySelector<Button>(Button.metadata.tag);
    await elementIsStable(element);
    await elementIsStable(button);

    // Trigger interest with a delay
    const interestEvent = new Event('interest', { cancelable: true }) as Event & { source: HTMLElement };
    interestEvent.source = button;
    element.dispatchEvent(interestEvent);
    await elementIsStable(element);
    expect(element.matches(':popover-open')).toBe(false);

    // Disconnect element before delay completes
    element.disconnectedCallback();

    // Wait for original delay to pass
    await new Promise(r => setTimeout(r, 60));

    // Popover should not have opened since timeout was cleared on disconnect
    expect(element.matches(':popover-open')).toBe(false);
    removeFixture(fixture);
  });

  it('should not throw when disconnecting with no pending interest timeout', async () => {
    const fixture = await createFixture(html`
      <type-native-popover-controller-test-element id="popover"></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    await elementIsStable(element);

    expect(() => element.disconnectedCallback()).not.toThrow();
    removeFixture(fixture);
  });
});

describe('type-popover.controller - disconnected element handling', () => {
  it('should not throw when showPopover is called on a disconnected element', async () => {
    const fixture = await createFixture(html`
      <type-native-popover-controller-test-element id="popover"></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    await elementIsStable(element);

    element.remove();

    expect(() => element.showPopover()).not.toThrow();
    expect(element.isConnected).toBe(false);
    removeFixture(fixture);
  });

  it('should not open popover when showPopover is called on a disconnected element', async () => {
    const fixture = await createFixture(html`
      <type-native-popover-controller-test-element id="popover"></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    await elementIsStable(element);

    element.remove();
    element.showPopover();

    expect(element.matches(':popover-open')).toBe(false);
    removeFixture(fixture);
  });

  it('should not throw when showPopover is called with options on a disconnected element', async () => {
    const fixture = await createFixture(html`
      <nve-button id="source-btn">source</nve-button>
      <type-native-popover-controller-test-element id="popover"></type-native-popover-controller-test-element>
    `);
    const element = fixture.querySelector<TypeNativePopoverControllerTestElement>(
      'type-native-popover-controller-test-element'
    );
    const sourceButton = fixture.querySelector<Button>('#source-btn');
    await elementIsStable(element);
    await elementIsStable(sourceButton);

    element.remove();

    expect(() => element.showPopover({ source: sourceButton })).not.toThrow();
    expect(element.isConnected).toBe(false);
    removeFixture(fixture);
  });
});
