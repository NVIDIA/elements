import { ReactiveController, ReactiveElement } from 'lit';
import { clickOutsideElementBounds, generateId, getAttributeListChanges } from '../utils/dom.js';
import { attachInternals } from '../utils/a11y.js';
import { focusElement } from '../utils/focus.js';
import { getHostTrigger } from './type-native-popover.utils.js';
import type { PopoverType } from '../types/index.js';

export interface NativePopover extends ReactiveElement {
  trigger?: HTMLElement | string;
  closeTimeout?: number;
  openDelay?: number;
  popoverType?: PopoverType;
  modal?: boolean;
  popoverDismissible?: boolean;
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
    const triggers = this.#nativeTriggers;
    this.#explicitTrigger ? triggers.push(this.#explicitTrigger) : null;
    return triggers;
  }

  get #nativeTriggers(): HTMLElement[] {
    return Array.from(
      (this.host.getRootNode() as HTMLElement).querySelectorAll(
        `[popovertarget="${CSS.escape ? CSS.escape(this.host.id) : this.host.id}"]`
      )
    ) as HTMLElement[];
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    attachInternals(this.host);
    this.#updatePopoverType();
    await this.host.updateComplete;
    this.host.setAttribute('nve-popover', '');
    this.#setupHiddenUpdates();
    this.#updateTriggers();
    this.#setupDefaultHiddenState();
    this.#setupModalLightDismiss();
    this.host.inert = this.host.matches(':not(:popover-open)') && !!this.#triggers.length;

    this.host.addEventListener('toggle', (e: ToggleEvent) => {
      if (this.host.behaviorTrigger) {
        this.host.hidden = e.newState === 'closed';
      }

      if (e.newState === 'open' && this.host.closeTimeout) {
        setTimeout(() => this.host.hidePopover(), this.host.closeTimeout);
      }

      this.host.inert = !this.host.hidden && e.newState !== 'open' && !!this.#triggers.length;

      if (this.host.modal) {
        this.#toggleFocus(e.newState === 'open');
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

  async hostUpdated() {
    this.#updatePopoverType();
    this.#updateTriggers();
  }

  hostDisconnected() {
    this.#observers.forEach(observer => observer.disconnect());
  }

  #updatePopoverType() {
    this.host.popover = this.host.popoverType && this.host.popoverType !== 'hint' ? this.host.popoverType : 'auto';
  }

  #setupModalLightDismiss() {
    this.host.addEventListener('pointerup', e => {
      if (
        this.host.popoverDismissible &&
        this.host.modal &&
        this.host.matches(':popover-open') &&
        clickOutsideElementBounds(e, this.host)
      ) {
        this.host.hidePopover();
      }
    });
  }

  async #setupDefaultHiddenState() {
    await new Promise(r => requestAnimationFrame(r));
    const nativeTriggers = this.#triggers.filter(t => t !== this.#explicitTrigger);
    if (this.host.isConnected && !nativeTriggers.length && !this.host.hidden && !this.host.matches(':popover-open')) {
      this.host.showPopover();
    }
  }

  async #setupHiddenUpdates() {
    await new Promise(r => requestAnimationFrame(r));
    this.#observers.push(
      getAttributeListChanges(this.host, ['hidden'], () => {
        if (this.host.isConnected && !this.host.hidden && !this.host.matches(':popover-open')) {
          this.host.showPopover();
        }

        if (this.host.isConnected && this.host.hidden && this.host.matches(':popover-open')) {
          this.host.hidePopover();
        }
      })
    );
  }

  #updateTriggers() {
    this.#updateExplicitTrigger();
    this.#removeTriggerInteractions();
    this.#addTriggerInteractions();
    this.#updateTriggerState();
  }

  #explicitTrigger: any;
  #updateExplicitTrigger() {
    // reset trigger to query for latest explicit trigger
    if (this.#explicitTrigger && this.host.id === this.#explicitTrigger.popoverTargetElement?.id) {
      this.#explicitTrigger.removeAttribute('popovertarget');
      this.#explicitTrigger.popoverTargetElement = null;
    }

    if (this.host.trigger) {
      const explicitTrigger = getHostTrigger(this.host, this.host.trigger) as HTMLButtonElement;

      // if not a hint type setup native popovertaget
      if (explicitTrigger && this.host.popoverType !== 'hint') {
        this.host.id = this.host.id ? this.host.id : generateId();
        explicitTrigger.popoverTargetElement = this.host;
        explicitTrigger.setAttribute('popovertarget', this.host.id);
      }

      this.#explicitTrigger = explicitTrigger;
    }
  }

  #openDelayTimeout = null;
  #_close = () => this.#close();
  #_open = e => this.#open(e);
  #_pointerdown = (e: Event) => (this.host._activeTrigger = e.target as HTMLElement);
  #_focus = () => (this.host._activeTrigger = document.activeElement as HTMLElement);

  #addTriggerInteractions() {
    this.#triggers.forEach(t => t.addEventListener('pointerdown', this.#_pointerdown));
    this.#triggers.forEach(t => t.addEventListener('focus', this.#_focus));

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
    this.#triggers.forEach(t => t.removeEventListener('focus', this.#_focus));

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
    } else if (this.host.isConnected) {
      this.host.showPopover();
    }
  }

  #openDelay() {
    this.#clearOpenDelay();
    this.#openDelayTimeout = setTimeout(() => {
      if (this.host.isConnected && this.#openDelayTimeout) {
        this.host.showPopover();
      }
    }, this.host.openDelay);
  }

  #clearOpenDelay() {
    clearTimeout(this.#openDelayTimeout);
    this.#openDelayTimeout = null;
  }

  #toggleFocus(open: boolean) {
    if (open) {
      // only focus popover if it is not the active element and it does not contain the active element already
      if ((this.host.getRootNode() as any).activeElement !== this.host && !this.host.shadowRoot.activeElement) {
        focusElement(this.host);
      }
    } else {
      focusElement(this.host._activeTrigger);
    }
  }
}
