import { ReactiveController, ReactiveElement } from 'lit';
import { clickOutsideElementBounds, getAttributeChanges, getFlatDOMTree } from '../utils/dom.js';
import {
  computePopoverPosition,
  getPopoverCustomCSSProperites,
  PopoverConfig,
  popoverRenderUpdate,
  setArrowStyles,
  setPopoverStyles
} from './type-popover.utils.js';
import type { PopoverAlign, PopoverPosition, PopoverType } from '../types/index.js';

export type { Placement, PopoverAlign, PopoverPosition, PopoverType } from '../types/index.js';

export interface Popover extends ReactiveElement {
  anchor?: HTMLElement | string;
  trigger?: HTMLElement | string;
  position?: PopoverPosition;
  alignment?: PopoverAlign;
  closeTimeout?: number;
  popoverArrow?: HTMLElement;
  popoverType?: PopoverType;
  popoverDismissible?: boolean;
  behaviorTrigger?: boolean;
}

/**
 * https://open-ui.org/components/popup.research.explainer
 */
export class TypePopoverController<T extends Popover> implements ReactiveController {
  get #popover() {
    return this.#dialog ? this.#dialog : this.host;
  }

  get #dialog() {
    return this.host.shadowRoot.querySelector<HTMLDialogElement>('dialog');
  }

  get #anchor() {
    const anchor = this.host.anchor ?? this.#trigger;
    if (typeof anchor === 'string' && anchor?.length) {
      return getFlatDOMTree(this.host.parentNode)
        .filter(el => el?.id !== '')
        .find(el => el.id === anchor);
    } else if (anchor && anchor !== globalThis.document.body) {
      return anchor as HTMLElement;
    } else {
      return globalThis.document.body;
    }
  }

  get #trigger() {
    if (typeof this.host.trigger === 'string') {
      return getFlatDOMTree(this.host.parentNode)
        .filter(el => el?.id !== '')
        .find(el => el.id === this.host.trigger);
    } else {
      return this.host.trigger as HTMLElement;
    }
  }

  get #config(): PopoverConfig {
    return {
      position: this.host.position,
      alignment: this.host.alignment,
      popover: this.#popover,
      anchor: this.#anchor,
      arrow: this.host.popoverArrow
    };
  }

  get #dismissible() {
    // by default all popover types are dismissible unless explicitly overridden such as non-closable dialogs
    return this.host.popoverDismissible !== false;
  }

  #popoverUpdateDisconnect = () => null;
  #hiddenUpdateObserver: MutationObserver;

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;
    this.#dialog?.addEventListener('close', e => {
      if (e.target === this.#dialog) {
        this.close();
      }
    });

    this.#dialog?.addEventListener('cancel', e => {
      if (e.target === this.#dialog) {
        e.preventDefault();
        this.close();
      }
    });

    this.#popoverUpdateDisconnect = popoverRenderUpdate(this.#config, async () => await this.#calculatePosition());
    this.#hiddenUpdateObserver = getAttributeChanges(this.host, 'hidden', async () => await this.#update());
    this.#setupTriggerInteractions();
    this.host.setAttribute('mlv-popover', '');
  }

  async hostUpdated() {
    this.#setupTriggerInteractions();
    await this.host.updateComplete;
    this.#updateVisibility();
    await this.#calculatePosition();
  }

  hostDisconnected() {
    this.#popoverUpdateDisconnect();
    this.#hiddenUpdateObserver?.disconnect();
  }

  async #update() {
    this.host.requestUpdate();
    this.#updateVisibility();
    this.#toggleLightDismiss();
    this.#closeTimeout();
    this.#updateAnchorState();
    await this.#calculatePosition();
  }

  #lightDismiss = (async (e: PointerEvent) => {
    await this.host.updateComplete;
    const hasOpenPopover = getFlatDOMTree(this.#popover).find((e: any) => !!e.popoverType && !e.hidden);
    if (clickOutsideElementBounds(e, this.#popover) && !hasOpenPopover) {
      this.close();
    }
  }).bind(this);

  #toggleLightDismiss() {
    globalThis.document.removeEventListener('pointerdown', this.#lightDismiss);
    if (!this.host.hasAttribute('hidden') && this.host.popoverType !== 'manual' && !this.host.closeTimeout) {
      requestAnimationFrame(() => globalThis.document.addEventListener('pointerdown', this.#lightDismiss));
    }
  }

  #open = () => this.open();
  #close = () => this.close();
  #prevTrigger: HTMLElement;

  #setupTriggerInteractions() {
    if (this.#prevTrigger !== this.#trigger) {
      this.#removeTriggerInteractions();
    }

    this.#addTriggerInteractions();
  }

  #removeTriggerInteractions() {
    if (this.#prevTrigger && this.host.popoverType === 'hint') {
      this.#prevTrigger.removeEventListener('mousemove', this.#open);
      this.#prevTrigger.removeEventListener('mouseleave', this.#close);
      this.#prevTrigger.removeEventListener('focus', this.#open);
      this.#prevTrigger.removeEventListener('focusout', this.#close);
    } else if (this.#prevTrigger) {
      this.#prevTrigger.removeEventListener('click', this.#open);
    }
  }

  #addTriggerInteractions() {
    if (this.#trigger && this.host.popoverType === 'hint') {
      this.#trigger.addEventListener('mousemove', this.#open);
      this.#trigger.addEventListener('mouseleave', this.#close);
      this.#trigger.addEventListener('focus', this.#open);
      this.#trigger.addEventListener('focusout', this.#close);
      this.#prevTrigger = this.#trigger;
    } else if (this.#trigger) {
      this.#trigger.addEventListener('click', this.#open);
      this.#prevTrigger = this.#trigger;
    }
  }

  #closeTimeout() {
    if (!this.host.hidden && this.host.closeTimeout) {
      setTimeout(() => this.close(), this.host.closeTimeout);
    }
  }

  #updateVisibility() {
    if (this.#dialog) {
      (this.host as any).inert = this.host.hidden;
      if (!this.host.hidden && !this.#dialog.open && this.host.popoverType === 'auto') {
        this.#dialog.showModal();
      } else if (this.host.hidden) {
        this.#dialog.close();
      }
    }
  }

  #updateAnchorState() {
    if (this.host.hidden) {
      (this.#anchor as HTMLElement & { _internals: ElementInternals })?._internals?.states.delete('anchor-active');
    } else {
      (this.#anchor as HTMLElement & { _internals: ElementInternals })?._internals?.states.add('anchor-active');
    }
  }

  close() {
    if (!this.host.hidden && this.#dismissible) {
      this.host.dispatchEvent(new CustomEvent('close', { bubbles: true }));
    }

    if (this.#dialog?.open && this.host.hidden) {
      this.#dialog.close();
    }

    if (this.host.behaviorTrigger) {
      this.host.hidden = true;
    }
  }

  open() {
    if (this.host.hidden) {
      this.host.dispatchEvent(new CustomEvent('open', { bubbles: true }));
    }

    if (this.host.behaviorTrigger) {
      this.host.hidden = false;
    }
  }

  async #calculatePosition() {
    await this.host.updateComplete;
    if (!this.host.hidden) {
      const config = { ...this.#config, ...getPopoverCustomCSSProperites(this.host) };
      config.arrow?.removeAttribute('style');
      await this.host.updateComplete;
      await new Promise(r => requestAnimationFrame(r));

      if (config.popover && config.position) {
        const position = await computePopoverPosition(config);
        setPopoverStyles(config, position);
        setArrowStyles(config, position);
      }
    }
  }
}
