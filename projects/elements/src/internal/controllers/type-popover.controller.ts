import { ReactiveController, ReactiveElement } from 'lit';
import { clickOutsideElementBounds, getAttributeChanges, getFlatDOMTree } from '../utils/dom.js';
import { computePopoverPosition, getPopoverCustomCSSProperites, PopoverAlign, PopoverConfig, PopoverPosition, popoverRenderUpdate, PopoverType, setArrowStyles, setPopoverStyles } from './type-popover.utils.js';

export type { Placement, PopoverAlign as PopoverAlign, PopoverPosition as PopoverPosition, PopoverType as PopoverType } from './type-popover.utils.js';

export interface Popover extends ReactiveElement {
  anchor?: HTMLElement | string;
  trigger?: HTMLElement | string;
  position?: PopoverPosition;
  alignment?: PopoverAlign;
  popoverArrow?: HTMLElement;
  popoverType?: PopoverType;
  closeTimeout?: number;
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
    const id = typeof this.host.anchor === 'string' ? this.host.anchor : this.host.anchor?.id;
    const anchor = getFlatDOMTree(this.host.parentNode).filter(el => el?.id !== '').find(el => el.id === id) as HTMLElement;
    return anchor ? anchor : document.body;
  }

  get #trigger() {
    const id = typeof this.host.trigger === 'string' ? this.host.trigger : this.host.trigger?.id;
    return getFlatDOMTree(this.host.parentNode).filter(el => el?.id !== '').find(el => el.id === id) as HTMLElement;
  }

  get #config(): PopoverConfig {
    return {
      position: this.host.position,
      alignment: this.host.alignment,
      popover: this.#popover,
      anchor: this.#anchor,
      arrow: this.host.popoverArrow,
    }
  }

  #cleanup: ({ disconnect: () => void })[];

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;
    this.#dialog?.addEventListener('close', () => this.close());
    this.#cleanup = [
      { disconnect: popoverRenderUpdate(this.#config, () => this.#calculatePosition()) },
      getAttributeChanges(this.host, 'hidden', () => this.#update())
    ];

    this.#addTriggerInteractions();
    this.host.setAttribute('nve-popover', '');
  }

  async hostUpdated() {
    await this.host.updateComplete;
    this.#calculatePosition();
    this.#updateVisibility();
  }

  hostDisconnected() {
    this.#cleanup.forEach(i => i.disconnect());
  }

  #update() {
    this.host.requestUpdate();
    this.#updateVisibility();
    this.#toggleLightDismiss();
    this.#calculatePosition();
    this.#closeTimeout();
  }

  #lightDismiss = ((e: PointerEvent) => {
    if (clickOutsideElementBounds(e, this.#popover)) {
      this.close();
    }
  }).bind(this);

  async #toggleLightDismiss() {
    document.removeEventListener('pointerdown', this.#lightDismiss);
    if (!this.host.hasAttribute('hidden') && this.host.popoverType !== 'manual' && !this.host.closeTimeout) {
      await new Promise(r => requestAnimationFrame(r));
      document.addEventListener('pointerdown', this.#lightDismiss);
    }
  }

  #addTriggerInteractions() {
    if (this.#trigger && this.host.popoverType === 'hint') {
      this.#trigger.addEventListener('mousemove', () => this.open());
      this.#trigger.addEventListener('mouseleave', () => this.close());
      this.#trigger.addEventListener('focus', () => this.open());
      this.#trigger.addEventListener('focusout', () => this.close());
    } else if (this.#trigger) {
      this.#trigger.addEventListener('click', () => this.open());
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

  close() {
    this.host.dispatchEvent(new CustomEvent('close'));
    if (this.#dialog?.open && this.host.hidden) {
      this.#dialog.close();
    }
  }

  open() {
    if (this.host.hidden) {
      this.host.dispatchEvent(new CustomEvent('open'));
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
