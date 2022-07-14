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

export type Submit = ReactiveElement & HTMLElement & {
  name: string;
  value: string;
  disabled: boolean;
  type: 'button' | 'submit';
  readonly: boolean;
};

export class TypeSubmitController<T extends Submit> implements ReactiveController {
  #button: HTMLButtonElement & { inert: boolean };

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
      this.#button = document.createElement('button') as HTMLButtonElement & { inert: boolean };
      this.#button.inert = true;
    }

    this.#button.value = this.host.value;
    this.#button.name = this.host.name;
    this.#button.type = this.host.type;
  }

  #setupNativeButtonBehavior() {
    if (this.host.readonly|| this.host.disabled) {
      this.host.removeEventListener('click', this.#triggerNativeButtonBehavior.bind(this));
      this.host.removeEventListener('keyup', this.#emulateKeyBoardEventBehavior.bind(this));
    } else {
      this.host.addEventListener('click', this.#triggerNativeButtonBehavior.bind(this));
      this.host.addEventListener('keyup', this.#emulateKeyBoardEventBehavior.bind(this));
    }
  }

  #emulateKeyBoardEventBehavior(event: KeyboardEvent) {
    onKeys(['Enter', 'Space'], event, () => {
      // when submitting forms with Enter key, default submit button receives click event from the form
      if (this.host.type === 'button') {
        this.#triggerNativeButtonBehavior(event);
      } else {
        this.host.click();
      }
      stopEvent(event);
    });
  }

  #triggerNativeButtonBehavior(event: Event) {
    if (this.host.disabled) {
      stopEvent(event);
    } else if (!event.defaultPrevented) {
      this.host.appendChild(this.#button);
      this.#button.dispatchEvent(new MouseEvent('click', { relatedTarget: this.host, composed: true }));
      this.#button.remove();
    }
  }
}
