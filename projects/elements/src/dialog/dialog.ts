import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { animationFade, PopoverAlign, popoverBaseStyles, PopoverPosition, PopoverType, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './dialog.css?inline';
import { IconButton } from '../icon-button';

/**
 * @alpha
 * @element mlv-dialog
 * @event open
 * @event close
 * @slot default content slot
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --gap
 * @cssprop --max-width
 * @cssprop --min-height
 * @cssprop --mlv-sys-interaction-default-background
 * @cssprop --mlv-sys-layer-popover-arrow-padding
 * @cssprop --mlv-sys-layer-popover-arrow-offset
 * @cssprop --mlv-sys-layer-popover-offset
 */
export class Dialog extends LitElement {
  /**
   * Sets the side position of the popover relative to the provided anchor element.
   * For dialog the anchor defaults to the document body.
   */
  @property({ type: String, reflect: true }) position: PopoverPosition = 'center';

  /**
   * Sets the alignment of the popover relative to the provided anchor element.
   * If an arrow exists the alginment will be relative to the arrow against the anchor.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  /**
   * Sets the maximum size of the dialog.
   */
  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Determines if a close button should render within dialog. Non-closable
   * dialogs can be used for dialogs that require user confirmation steps.
   */
  @property({ type: Boolean }) closable: boolean;

  /**
   * Determines if a dialog should have a modal backdrop that visually overlays the UI.
   */
  @property({ type: Boolean }) modal: boolean;

  /**
   * The anchor provides the element that the popover should position relative to.
   * Anchor can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement = document.body;

  /**
   * The trigger defines what element triggers an `open` interaction event.
   * A trigger can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) trigger: string | HTMLElement;

  /**
   * Determines if popover should be rendered and positioned.
   */
  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  static styles = useStyles([popoverBaseStyles, styles]);

  /** @private */
  get popoverType(): PopoverType {
    return this.modal ? 'auto' : 'manual';
  }

  #typePopoverController = new TypePopoverController<Dialog>(this);

  static elementDefinitions = {
    'mlv-icon-button': IconButton
  }

  render() {
    return html`
    <dialog ${animationFade(this)}>
      <div class="header">
        ${this.closable ? html`<mlv-icon-button @click=${() => this.#typePopoverController.close()} icon-name="cancel" aria-label="close"></mlv-icon-button>` : ''}
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
