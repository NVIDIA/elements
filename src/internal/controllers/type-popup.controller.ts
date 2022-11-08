import { ReactiveController, ReactiveElement } from 'lit';
import { clickOutsideElementBounds, getAttributeChanges, getFlatDOMTree } from '../utils/dom.js';
import { computePopupPosition, getPopupCustomCSSProperites, PopupAlign, PopupConfig, PopupPosition, popupRenderUpdate, PopupType, setArrowStyles, setPopupStyles } from './type-popup.utils.js';

export type { Placement, PopupAlign, PopupPosition, PopupType } from './type-popup.utils.js';

export interface Popup extends ReactiveElement {
  anchor?: HTMLElement | string;
  position?: PopupPosition;
  alignment?: PopupAlign;
  popupArrow?: HTMLElement;
  popupType?: PopupType;
  autoClose?: number;
}

/**
 * https://open-ui.org/components/popup.research.explainer
 */
export class TypePopupController<T extends Popup> implements ReactiveController {
  get #popup() {
    return this.#dialog ? this.#dialog : this.host;
  }

  get #dialog() {
    return this.host.shadowRoot.querySelector<HTMLDialogElement>('dialog');
  }

  get #anchor() {
    const id = typeof this.host.anchor === 'string' ? this.host.anchor : this.host.anchor?.id;
    const anchor = getFlatDOMTree(this.host.parentElement).filter(el => el?.id !== '').find(el => el.id === id) as HTMLElement;
    return anchor ? anchor : document.body;
  }

  get #config(): PopupConfig {
    return {
      position: this.host.position,
      alignment: this.host.alignment,
      popup: this.#popup,
      anchor: this.#anchor,
      arrow: this.host.popupArrow,
    }
  }

  #popupType: PopupType;

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;
    this.#dialog?.addEventListener('close', () => this.close());
    popupRenderUpdate(this.#config, () => this.#calculatePosition());
    getAttributeChanges(this.host, 'hidden', () => this.#update());
  }

  async hostUpdated() {
    await this.host.updateComplete;
    this.#updatePopupType();
    this.#calculatePosition();
  }

  #update() {
    this.host.requestUpdate();
    this.#updateModal();
    this.#toggleLightDismiss();
    this.#calculatePosition();
    this.#autoClose();
  }

  #lightDismiss = ((e: PointerEvent) => {
    if (clickOutsideElementBounds(e, this.#popup)) {
      this.close();
    }
  }).bind(this);

  async #toggleLightDismiss() {
    document.removeEventListener('click', this.#lightDismiss);
    if (!this.host.hasAttribute('hidden') && this.host.popupType !== 'manual' && !this.host.autoClose) {
      await new Promise(r => requestAnimationFrame(r));
      document.addEventListener('click', this.#lightDismiss);
    }
  }

  #updatePopupType() {
    if (this.#popupType !== this.host.popupType) {
      this.#popupType = this.host.popupType;
      this.#updateModal();
    }
  }

  #autoClose() {
    if (!this.host.hidden && this.host.autoClose) {
      setTimeout(() => this.close(), this.host.autoClose);
    }
  }

  #updateModal() {
    if (this.#dialog) {
      this.#dialog.removeAttribute('open');
      this.#dialog.hidden = this.host.hidden;
      if (!this.host.hidden && this.host.popupType !== 'manual') {
        this.host.popupType === 'auto' ? this.#dialog.showModal() : this.#dialog.show();
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
      const config = { ...this.#config, ...getPopupCustomCSSProperites(this.host) };
      config.arrow?.removeAttribute('style');
      await this.host.updateComplete;
      await new Promise(r => requestAnimationFrame(r));

      if (config.popup && config.position) {
        const position = await computePopupPosition(config);
        setPopupStyles(config, position);
        setArrowStyles(config, position);
      }
    }
  }
}
