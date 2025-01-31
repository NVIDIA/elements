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
    value: string;
    disabled: boolean;
    type: 'button' | 'submit' | 'reset';
    readonly: boolean;
    _internals: ElementInternals;
  };

export class TypeSubmitController<T extends Submit> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostUpdated() {
    await this.host.updateComplete;
    this.#setButtonType();
    this.#setupNativeButtonBehavior();
  }

  #setButtonType() {
    if (!this.host.type && !this.host.hasAttribute('type') && this.host.closest('form')) {
      this.host.type = 'submit';
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
    if (this.host.disabled) {
      stopEvent(event);
      return;
    }

    if (this.host.type === 'submit') {
      const e = new SubmitEvent('submit', { cancelable: true });
      this.host._internals.form?.dispatchEvent(e);

      /* istanbul ignore next -- @preserve */
      if (!e.defaultPrevented) {
        this.host._internals.form?.submit();
      }
    } else if (this.host.type === 'reset') {
      this.host._internals.form?.reset();
    }
  }
}
