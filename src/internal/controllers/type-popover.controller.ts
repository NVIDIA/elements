import { ReactiveController, ReactiveElement } from 'lit';
import { clickOutsideElementBounds, getAttributeChanges, getFlatDOMTree } from '../utils/dom.js';
import { computePopoverPosition, getPopoverCustomCSSProperites, PopoverAlign, PopoverConfig, PopoverPosition, popoverRenderUpdate, PopoverType, setArrowStyles, setPopoverStyles } from './type-popover.utils.js';

export type { Placement, PopoverAlign as PopoverAlign, PopoverPosition as PopoverPosition, PopoverType as PopoverType } from './type-popover.utils.js';

export interface Popover extends ReactiveElement {
  anchor?: HTMLElement | string;
  position?: PopoverPosition;
  alignment?: PopoverAlign;
  popoverArrow?: HTMLElement;
  popoverType?: PopoverType;
  autoClose?: number;
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

  get #config(): PopoverConfig {
    return {
      position: this.host.position,
      alignment: this.host.alignment,
      popover: this.#popover,
      anchor: this.#anchor,
      arrow: this.host.popoverArrow,
    }
  }

  #popoverType: PopoverType;
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
  }

  async hostUpdated() {
    await this.host.updateComplete;
    this.#updatePopoverType();
    this.#calculatePosition();

    if ((this.#dialog as any)?.open && this.host.hidden) {
      this.#dialog.close();
    }
  }

  hostDisconnected() {
    this.#cleanup.forEach(i => i.disconnect());
  }

  #update() {
    this.host.requestUpdate();
    this.#updateVisibility();
    this.#toggleLightDismiss();
    this.#calculatePosition();
    this.#autoClose();
  }

  #lightDismiss = ((e: PointerEvent) => {
    if (clickOutsideElementBounds(e, this.#popover)) {
      this.close();
    }
  }).bind(this);

  async #toggleLightDismiss() {
    document.removeEventListener('click', this.#lightDismiss);
    if (!this.host.hasAttribute('hidden') && this.host.popoverType !== 'manual' && !this.host.autoClose) {
      await new Promise(r => requestAnimationFrame(r));
      document.addEventListener('click', this.#lightDismiss);
    }
  }

  #updatePopoverType() {
    if (this.#popoverType !== this.host.popoverType) {
      this.#popoverType = this.host.popoverType;
      this.#updateVisibility();
    }
  }

  #autoClose() {
    if (!this.host.hidden && this.host.autoClose) {
      setTimeout(() => this.close(), this.host.autoClose);
    }
  }

  #updateVisibility() {
    if (this.#dialog) {
      this.#dialog.removeAttribute('open');
      this.#dialog.hidden = this.host.hidden;
      if (!this.host.hidden && this.host.popoverType !== 'manual') {
        this.host.popoverType === 'auto' ? this.#dialog.showModal() : this.#dialog.show();
      }
    }
  }

  close() {
    this.host.dispatchEvent(new CustomEvent('close'));
    if (this.#dialog && this.host.hidden) {
      this.#dialog.close();
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
