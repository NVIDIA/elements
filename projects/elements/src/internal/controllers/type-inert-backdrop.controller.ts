import { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';
import { getAttributeChanges } from '../utils/dom.js';

/**
 * https://open-ui.org/components/popover.research.explainer/#backdrop
 *
 * This is a minimalist controller to manage inert backdrops. Currently popover backdrops
 * while visual do not block user interactions underneath them. This controller
 * allows components (popovers) to enable a inert backdrop for modal behaviors like dialog and dropdown.
 *
 * This controller is simplistic in its approach and assumes its the only current active backdrop.
 * Future iterations can improve on this and track the number of active backdrops to prevent
 * disabling the intert behavior if others are still open.
 */
export class TypeInertBackdropController<T extends ReactiveElement> implements ReactiveController {
  get isEnabled() {
    return document.body.style.pointerEvents === 'none';
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    attachInternals(this.host);

    this.#observers.push(
      getAttributeChanges(this.host, 'hidden', value => {
        if (value !== null) {
          this.disable();
        }
      })
    );
  }

  #observers: MutationObserver[] = [];

  hostDisconnected() {
    this.#observers.forEach(observer => observer.disconnect());
    this.disable();
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  enable() {
    document.body.style.pointerEvents = 'none';
  }

  disable() {
    document.body.style.pointerEvents = 'initial';
  }
}
