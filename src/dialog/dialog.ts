import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { animationFade, PopupAlign, popupBaseStyles, PopupPosition, PopupType, TypePopupController, useStyles } from '@elements/elements/internal';
import styles from './dialog.css?inline';

/**
 * @alpha
 * @element nve-dialog
 */
export class Dialog extends LitElement {
  @property({ type: String, reflect: true }) position: PopupPosition = 'center';

  @property({ type: String, reflect: true }) alignment: PopupAlign;

  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  @property({ type: Boolean }) closable: boolean;
  
  @property({ type: Boolean }) modal: boolean;

  @property({ type: String }) anchor: string | HTMLElement = document.body;

  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  static styles = useStyles([popupBaseStyles, styles]);

  get popupType(): PopupType {
    return this.modal ? 'auto' : 'manual';
  }

  #typePopupController = new TypePopupController<Dialog>(this);

  render() {
    return html`
    <dialog ${animationFade(this)}>
      <div class="header">
        ${this.closable ? html`<nve-icon-button @click=${() => this.#typePopupController.close()} icon-name="cancel" aria-label="close"></nve-icon-button>` : ''}
        <slot name="header"></slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <slot name="footer"></slot>
    </dialog>
    `;
  }
}
