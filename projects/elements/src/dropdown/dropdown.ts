import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { IconButton } from '@elements/elements/icon-button';
import { animationFade, PopoverAlign, popoverBaseStyles, PopoverPosition, PopoverType, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './dropdown.css?inline';

/**
 * @alpha
 * @element mlv-dropdown
 * @event open
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
  /**
   * The anchor provides the element that the popover should position relative to.
   * Anchor can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement;

  /**
   * The trigger defines what element triggers an `open` interaction event.
   * A trigger can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) trigger: string | HTMLElement;

  /**
   * Sets the side position of the popover relative to the provided anchor element.
   */
  @property({ type: String, reflect: true }) position: PopoverPosition = 'bottom';

  /**
   * Sets the alignment of the popover relative to the provided anchor element.
   * If an arrow exists the alginment will be relative to the arrow against the anchor.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign = 'start';

  /**
   * Determines if a close button should render within dropdown. Non-closable
   * dropdowns can be used for menu or selection patterns.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * Determines if an arrow should be rendered.
   */
  @property({ type: Boolean }) arrow = false;

  /**
   * Determines if popover should be rendered and positioned.
   */
  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  @query('.arrow') popoverArrow: HTMLElement;

  static styles = useStyles([popoverBaseStyles, styles]);

  /** @private */
  readonly popoverType: PopoverType = 'auto';

  #typePopoverController = new TypePopoverController<Dropdown>(this);

  static elementDefinitions = {
    'mlv-icon-button': IconButton
  }

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
