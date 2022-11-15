import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { animationFade, PopoverAlign, popoverBaseStyles, PopoverPosition, PopoverType, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './dropdown.css?inline';

/**
 * @alpha
 * @element mlv-dropdown
 * @event close
 * @slot - default slot for dropdown content
 * @cssprop --border
 * @cssprop --arrow-transform
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --mlv-sys-interaction-default-background
 * @cssprop --mlv-sys-layer-popover-arrow-padding
 * @cssprop --mlv-sys-layer-popover-arrow-offset
 * @cssprop --mlv-sys-layer-popover-offset
 */
export class Dropdown extends LitElement {
  @property({ type: String }) anchor: string | HTMLElement;

  @property({ type: String, reflect: true }) position: PopoverPosition = 'bottom';

  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  @property({ type: Boolean }) closable = false;

  @property({ type: Boolean }) arrow = false;

  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  @query('.arrow') popoverArrow: HTMLElement;

  static styles = useStyles([popoverBaseStyles, styles]);

  readonly popoverType: PopoverType = 'auto';

  #typePopoverController = new TypePopoverController<Dropdown>(this);

  render() {
    return html`
      <dialog ${animationFade(this)}>
        ${this.closable ? html`<mlv-icon-button @click=${() => this.#typePopoverController.close()} icon-name="cancel" interaction="ghost" aria-label="close"></mlv-icon-button>` : ''}
        <slot></slot>
        ${this.arrow ? html`<div class="arrow"></div>` : ''}
      </dialog>
    `;
  }
}
