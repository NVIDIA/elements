import { ReactiveController, ReactiveElement } from 'lit';
import { stopEvent } from '../utils/events.js';
import { onKeys } from '../utils/keynav.js';

/**
 * Adds Form submit support for interactive custom elements.
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
 */
export function typeSubmit<T extends Submit>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new TypeSubmitController(instance));
}

export type Submit = ReactiveElement &
  HTMLElement & {
    name: string;
    form: string;
    value: string;
    disabled: boolean;
    type: 'button' | 'submit';
    readonly: boolean;
  };

type InnerSubmitButton = HTMLButtonElement & { inert: boolean; form: string };

export class TypeSubmitController<T extends Submit> implements ReactiveController {
  #button: InnerSubmitButton;

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostUpdated() {
    await this.host.updateComplete;
    this.#setButtonType();
    this.#setupSubmitButton();
    this.#setupNativeButtonBehavior();
  }

  #setButtonType() {
    if (!this.host.type && !this.host.hasAttribute('type') && this.host.closest('form')) {
      this.host.type = 'submit';
    }
  }

  #setupSubmitButton() {
    if (!this.#button) {
      this.#button = globalThis.document.createElement('button') as InnerSubmitButton;
      this.#button.hidden = true;
      this.#button.inert = true;
    }

    this.#button.value = this.host.value;
    this.#button.name = this.host.name;
    this.#button.type = this.host.type;
    if (this.host.form !== undefined) {
      this.#button.setAttribute('form', this.host.form);
    } else {
      this.#button.removeAttribute('form');
    }
  }

  #setupNativeButtonBehavior() {
    if (!this.host.readonly && !this.host.disabled) {
      this.host.addEventListener('click', this.#triggerNativeButtonBehaviorFn);
      this.host.addEventListener('keyup', this.#emulateKeyBoardEventBehaviorFn);
    } else {
      this.host.removeEventListener('click', this.#triggerNativeButtonBehaviorFn);
      this.host.removeEventListener('keyup', this.#emulateKeyBoardEventBehaviorFn);
    }
  }

  #triggerNativeButtonBehaviorFn = this.#triggerNativeButtonBehavior.bind(this);
  #emulateKeyBoardEventBehaviorFn = this.#emulateKeyBoardEventBehavior.bind(this);

  // when submitting forms with Enter key, default submit button receives click event from the form
  #emulateKeyBoardEventBehavior(event: KeyboardEvent) {
    onKeys(['Enter', 'Space'], event, () => this.host.click());
  }

  #triggerNativeButtonBehavior(event: Event) {
    /* istanbul ignore next -- @preserve */
    if (this.host.disabled) {
      stopEvent(event);
    } else if (!event.defaultPrevented) {
      this.host.appendChild(this.#button);
      this.#button.dispatchEvent(new PointerEvent('click', { relatedTarget: this.host, composed: true }));
      this.#button.remove();
    }
  }
}
