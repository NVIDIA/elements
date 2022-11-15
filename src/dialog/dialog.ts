import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { animationFade, PopoverAlign, popoverBaseStyles, PopoverPosition, PopoverType, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './dialog.css?inline';

/**
 * @alpha
 * @event close
 * @element nve-dialog
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --gap
 * @cssprop --max-width
 * @cssprop --min-height
 * @cssprop --nve-sys-interaction-default-background
 * @cssprop --nve-sys-layer-popover-arrow-padding
 * @cssprop --nve-sys-layer-popover-arrow-offset
 * @cssprop --nve-sys-layer-popover-offset
 */
export class Dialog extends LitElement {
  @property({ type: String, reflect: true }) position: PopoverPosition = 'center';

  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  @property({ type: Boolean }) closable: boolean;
  
  @property({ type: Boolean }) modal: boolean;

  @property({ type: String }) anchor: string | HTMLElement = document.body;

  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  static styles = useStyles([popoverBaseStyles, styles]);

  get popoverType(): PopoverType {
    return this.modal ? 'auto' : 'manual';
  }

  #typePopoverController = new TypePopoverController<Dialog>(this);

  render() {
    return html`
    <dialog ${animationFade(this)}>
      <div class="header">
        ${this.closable ? html`<nve-icon-button @click=${() => this.#typePopoverController.close()} icon-name="cancel" aria-label="close"></nve-icon-button>` : ''}
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
