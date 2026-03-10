import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { getFlatDOMTree } from '../utils/dom.js';

export type InterestEvent = Event & {
  source: HTMLElement;
};

/**
 * Adds Interest Invoker Commands API support for interactive custom elements.
 * https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers
 */
export function typeInterest<T extends Interest>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new TypeInterestController(instance));
}

export type Interest = ReactiveElement &
  HTMLElement & {
    interestfor: string | null;
    interestForElement: HTMLElement | null;
    readonly: boolean;
    disabled: boolean;
  };

export class TypeInterestController<T extends Interest> implements ReactiveController {
  #interestSetupComplete = false;

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.#setupInterestEvents();
  }

  async hostUpdated() {
    await this.#setupInterestEvents();
  }

  hostDisconnected() {
    this.#teardownInterestEvents();
  }

  async #setupInterestEvents() {
    await this.host.updateComplete;
    if (!this.#interestSetupComplete) {
      this.#interestSetupComplete = true;
      this.host.addEventListener('mouseenter', this.#triggerInterest);
      this.host.addEventListener('mouseleave', this.#triggerLoseInterest);
      this.host.addEventListener('focus', this.#triggerInterest);
      this.host.addEventListener('blur', this.#triggerLoseInterest);
    }
  }

  #teardownInterestEvents() {
    this.#interestSetupComplete = false;
    this.host.removeEventListener('mouseenter', this.#triggerInterest);
    this.host.removeEventListener('mouseleave', this.#triggerLoseInterest);
    this.host.removeEventListener('focus', this.#triggerInterest);
    this.host.removeEventListener('blur', this.#triggerLoseInterest);
  }

  #triggerInterest = () => {
    this.#updateInterestForElement();
    if (this.host.interestForElement) {
      const event = new Event('interest', { cancelable: true }) as InterestEvent;
      event.source = this.host;
      this.host.interestForElement.dispatchEvent(event);
    }
  };

  #triggerLoseInterest = () => {
    this.#updateInterestForElement();
    if (this.host.interestForElement) {
      const event = new Event('loseinterest', { cancelable: true }) as InterestEvent;
      event.source = this.host;
      this.host.interestForElement.dispatchEvent(event);
    }
  };

  // we can only do this on interaction as its too costly to do this on every getter or update of the interestfor attribute, this diverges from the native behavior of the interestfor attribute
  #updateInterestForElement() {
    const interestForIdRef = this.host.getAttribute('interestfor');
    if (interestForIdRef && !this.host.interestForElement) {
      this.host.interestForElement = getFlatDOMTree(this.host.getRootNode() as HTMLElement).find(
        el => el.id === interestForIdRef
      )!;
    }

    // legacy behavior that allows popovertarget to trigger interestfor behavior for hint type popovers
    const popovertargetIdRef = this.host.getAttribute('popovertarget');
    if (popovertargetIdRef && !interestForIdRef) {
      const target = getFlatDOMTree(this.host.getRootNode() as HTMLElement).find(el => el.id === popovertargetIdRef);
      if (target && target.popover === 'hint') {
        this.host.interestForElement = target;
      }
    }
  }
}
