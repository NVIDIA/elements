import { ReactiveController, ReactiveElement } from 'lit';
import { generateId, getAttributeChanges } from '../utils/dom.js';
import type { PopoverType } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';
import { getHostTrgger } from './type-native-popover.utils.js';

export interface NativePopover extends ReactiveElement {
  trigger?: HTMLElement | string;
  closeTimeout?: number;
  openDelay?: number;
  popoverType?: PopoverType;
  _activeTrigger?: HTMLElement;
  _internals?: ElementInternals;
  /** @deprecated */
  behaviorTrigger?: boolean;
}

/**
 * https://open-ui.org/components/popup.research.explainer
 */
export class TypeNativePopoverController<T extends NativePopover> implements ReactiveController {
  get #triggers(): HTMLElement[] {
    const triggers = Array.from(
      (this.host.getRootNode() as HTMLElement).querySelectorAll(`[popovertarget="${this.host.id}"]`)
    ) as HTMLElement[];
    this.#explicitTrigger ? triggers.push(this.#explicitTrigger) : null;
    return triggers;
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    attachInternals(this.host);
    this.host.popover = this.host.popoverType && this.host.popoverType !== 'hint' ? this.host.popoverType : 'auto';
    await this.host.updateComplete;
    this.host.setAttribute('nve-popover', '');
    this.#setupHiddenUpdates();
    this.#updateTriggers();

    this.host.addEventListener('beforetoggle', (e: ToggleEvent) => {
      if (this.host.behaviorTrigger) {
        this.host.hidden = e.newState === 'closed';
      }

      if (e.newState === 'open' && this.host.closeTimeout) {
        setTimeout(() => this.host.hidePopover(), this.host.closeTimeout);
      }

      this.host.dispatchEvent(
        new CustomEvent(e.newState === 'open' ? 'open' : 'close', {
          bubbles: true,
          detail: { trigger: this.host._activeTrigger }
        })
      );
    });
  }

  #observers: MutationObserver[] = [];

  hostUpdated() {
    this.#updateTriggers();
  }

  hostDisconnected() {
    this.#observers.forEach(observer => observer.disconnect());
  }

  #setupHiddenUpdates() {
    if (this.host.hidden) {
      this.#observers.push(
        getAttributeChanges(this.host, 'hidden', () => {
          if (this.host.hidden) {
            this.host.hidePopover();
          } else {
            this.host.showPopover();
          }
        })
      );
    }
  }

  #updateTriggers() {
    this.#updateExplicitTrigger();
    this.#removeTriggerInteractions();
    this.#addTriggerInteractions();
    this.#updateTriggerState();
  }

  #explicitTrigger: any;
  #updateExplicitTrigger() {
    if (this.#explicitTrigger) {
      this.#explicitTrigger.removeAttribute('popovertarget');
      this.#explicitTrigger.popoverTargetElement = null;
    }

    if (this.host.trigger) {
      const explicitTrigger = getHostTrgger(this.host, this.host.trigger);
      if (explicitTrigger) {
        this.host.id = this.host.id ? this.host.id : generateId();
        this.#explicitTrigger = explicitTrigger;
        this.#explicitTrigger.setAttribute('popovertarget', this.host.id);
        this.#explicitTrigger.popoverTargetElement = this.host;
      }
    }
  }

  #openDelayTimeout = null;
  #_close = () => this.#close();
  #_open = e => this.#open(e);
  #_pointerdown = (e: Event) => (this.host._activeTrigger = e.target as HTMLElement);

  #addTriggerInteractions() {
    this.#triggers.forEach(t => t.addEventListener('pointerdown', this.#_pointerdown));

    if (this.host.popoverType === 'hint') {
      this.#triggers.forEach(t => {
        t.addEventListener('mouseenter', this.#_open);
        t.addEventListener('mouseleave', this.#_close);
        t.addEventListener('focus', this.#_open);
        t.addEventListener('focusout', this.#_close);
      });
    }
  }

  #removeTriggerInteractions() {
    this.#triggers.forEach(t => t.removeEventListener('pointerdown', this.#_pointerdown));

    if (this.host.popoverType === 'hint') {
      this.#triggers.forEach(t => {
        t.removeEventListener('mouseenter', this.#_open);
        t.removeEventListener('mouseleave', this.#_close);
        t.removeEventListener('focus', this.#_open);
        t.removeEventListener('focusout', this.#_close);
      });
    }
  }

  async #updateTriggerState() {
    // if no trigger is provided and not hidden then we show the popover by default
    await new Promise(r => requestAnimationFrame(r));
    if (!this.#triggers.length) {
      this.host._internals.states.add('no-trigger');
    } else {
      this.host._internals.states.delete('no-trigger');
    }
  }

  #close() {
    this.host.hidePopover();
    this.#clearOpenDelay();
  }

  #open(event) {
    this.host._activeTrigger = event.target;
    if (this.host.openDelay) {
      this.#openDelay();
    } else {
      this.host.showPopover();
    }
  }

  #openDelay() {
    this.#clearOpenDelay();
    this.#openDelayTimeout = setTimeout(() => {
      if (this.#openDelayTimeout) {
        this.host.showPopover();
      }
    }, this.host.openDelay);
  }

  #clearOpenDelay() {
    clearTimeout(this.#openDelayTimeout);
    this.#openDelayTimeout = null;
  }
}
