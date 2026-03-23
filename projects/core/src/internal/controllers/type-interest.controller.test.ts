import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, untilEvent, elementIsStable, emulateMouseEnter } from '@internals/testing';
import { TypeInterestController, type InterestEvent } from '@nvidia-elements/core/internal';

@customElement('type-interest-controller-test-element')
class TypeInterestControllerTestElement extends LitElement {
  @property({ type: String, reflect: true }) interestfor: string;
  @property({ type: Object }) interestForElement: HTMLElement;
  @property({ type: Boolean }) readonly: boolean;
  @property({ type: Boolean }) disabled: boolean;
  #typeInterestController = new TypeInterestController(this);
}

describe('type-interest.controller', () => {
  let element: TypeInterestControllerTestElement;
  let target: HTMLElement;
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  describe('interestfor attribute', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-interest-controller-test-element interestfor="target"></type-interest-controller-test-element>
          <div id="target"></div>
        `
      );
      element = fixture.querySelector<TypeInterestControllerTestElement>('type-interest-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#target');
      await elementIsStable(element);
    });

    it('should set interestForElement from interestfor attribute', async () => {
      emulateMouseEnter(element);
      await elementIsStable(element);
      expect(element.interestForElement).toBe(target);
    });

    it('should trigger interest event on mouseenter', async () => {
      const event = untilEvent<InterestEvent>(target, 'interest');
      element.dispatchEvent(new MouseEvent('mouseenter'));
      const result = await event;
      expect(result.source).toBe(element);
    });

    it('should trigger loseinterest event on mouseleave', async () => {
      const event = untilEvent<InterestEvent>(target, 'loseinterest');
      element.dispatchEvent(new MouseEvent('mouseleave'));
      const result = await event;
      expect(result.source).toBe(element);
    });

    it('should trigger interest event on focus', async () => {
      const event = untilEvent<InterestEvent>(target, 'interest');
      element.dispatchEvent(new FocusEvent('focus'));
      const result = await event;
      expect(result.source).toBe(element);
    });

    it('should trigger loseinterest event on blur', async () => {
      const event = untilEvent<InterestEvent>(target, 'loseinterest');
      element.dispatchEvent(new FocusEvent('blur'));
      const result = await event;
      expect(result.source).toBe(element);
    });
  });

  describe('popovertarget legacy behavior', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-interest-controller-test-element popovertarget="hint-target"></type-interest-controller-test-element>
          <div id="hint-target" popover="hint"></div>
        `
      );
      element = fixture.querySelector<TypeInterestControllerTestElement>('type-interest-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#hint-target');
      await elementIsStable(element);
    });

    it('should set interestForElement from popovertarget when target has popover="hint" but used popovertarget attribute', async () => {
      emulateMouseEnter(element);
      await elementIsStable(element);
      expect(element.interestForElement).toBe(target);
    });

    it('should trigger interest event on mouseenter for hint popover', async () => {
      const event = untilEvent<InterestEvent>(target, 'interest');
      element.dispatchEvent(new MouseEvent('mouseenter'));
      const result = await event;
      expect(result.source).toBe(element);
    });
  });

  describe('popovertarget without hint', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-interest-controller-test-element popovertarget="auto-target"></type-interest-controller-test-element>
          <div id="auto-target" popover="auto"></div>
        `
      );
      element = fixture.querySelector<TypeInterestControllerTestElement>('type-interest-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#auto-target');
      await elementIsStable(element);
    });

    it('should not set interestForElement when popover is not hint', () => {
      expect(element.interestForElement).toBeUndefined();
    });
  });

  describe('interestfor takes precedence over popovertarget', () => {
    let hintTarget: HTMLElement;

    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-interest-controller-test-element
            interestfor="interest-target"
            popovertarget="hint-target"
          ></type-interest-controller-test-element>
          <div id="interest-target"></div>
          <div id="hint-target" popover="hint"></div>
        `
      );
      element = fixture.querySelector<TypeInterestControllerTestElement>('type-interest-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#interest-target');
      hintTarget = fixture.querySelector<HTMLElement>('#hint-target');
      await elementIsStable(element);
    });

    it('should use interestfor over popovertarget', async () => {
      emulateMouseEnter(element);
      await elementIsStable(element);
      expect(element.interestForElement).toBe(target);
      expect(element.interestForElement).not.toBe(hintTarget);
    });
  });

  describe('disconnect and reconnect', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`
          <type-interest-controller-test-element interestfor="target"></type-interest-controller-test-element>
          <div id="target"></div>
        `
      );
      element = fixture.querySelector<TypeInterestControllerTestElement>('type-interest-controller-test-element');
      target = fixture.querySelector<HTMLElement>('#target');
      await elementIsStable(element);
    });

    it('should not fire duplicate interest events after disconnect and reconnect', async () => {
      element.remove();
      fixture.appendChild(element);
      await elementIsStable(element);

      let interestCount = 0;
      target.addEventListener('interest', () => interestCount++);
      element.dispatchEvent(new MouseEvent('mouseenter'));
      expect(interestCount).toBe(1);
    });

    it('should continue dispatching interest events after disconnect and reconnect', async () => {
      element.remove();
      fixture.appendChild(element);
      await elementIsStable(element);

      const event = untilEvent<InterestEvent>(target, 'interest');
      element.dispatchEvent(new MouseEvent('mouseenter'));
      const result = await event;
      expect(result.source).toBe(element);
    });

    it('should not dispatch interest events while disconnected', async () => {
      element.interestForElement = target;
      element.remove();

      let interestFired = false;
      target.addEventListener('interest', () => (interestFired = true));
      element.dispatchEvent(new MouseEvent('mouseenter'));
      expect(interestFired).toBe(false);
    });
  });

  describe('no target element', () => {
    beforeEach(async () => {
      fixture = await createFixture(
        html`<type-interest-controller-test-element></type-interest-controller-test-element>`
      );
      element = fixture.querySelector<TypeInterestControllerTestElement>('type-interest-controller-test-element');
      await elementIsStable(element);
    });

    it('should not have interestForElement when no attributes set', () => {
      expect(element.interestForElement).toBeUndefined();
    });

    it('should not throw when triggering events without target', () => {
      expect(() => {
        element.dispatchEvent(new MouseEvent('mouseenter'));
        element.dispatchEvent(new MouseEvent('mouseleave'));
        element.dispatchEvent(new FocusEvent('focus'));
        element.dispatchEvent(new FocusEvent('blur'));
      }).not.toThrow();
    });
  });
});
