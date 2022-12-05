import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { animationFade, attachInternals, PopoverAlign, popoverBaseStyles, PopoverType, Status, statusIcons, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './notification.css?inline';

/**
 * @alpha
 * @element nve-notification
 * @event open
 * @event close
 * @slot default content slot
 * @cssprop --border-radius
 * @cssprop --status-color
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --min-width
 * @cssprop --width
 * @cssprop --nve-sys-layer-popover-offset
 */
export class Notification extends LitElement {
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
  @property({ type: String, reflect: true }) position;

  /**
   * Sets the alignment of the popover relative to the provided anchor element.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  /**
   * Determines if a close button should render within notification.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * A delayed `close` event will occur determined from the provided millisecond value.
   */
  @property({ type: Number, attribute: 'close-timeout' }) closeTimeout = 0;
  
  /**
   * Determines if popover should be rendered and positioned.
   */
  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  @property({ type: String, reflect: true }) status: Status;

  protected typePopoverController = new TypePopoverController<Notification>(this);

  static styles = useStyles([popoverBaseStyles, styles]);

  /** @private */
  get popoverType(): PopoverType {
    return 'manual';
  }

  /** @private */
  declare _internals: ElementInternals;

  get #popoverContent() {
    return html`
    <nve-icon .name=${statusIcons[this.status] ?? 'information'} part="status-icon"></nve-icon>
    ${this.closable ? html`<nve-icon-button @click=${() => this.typePopoverController.close()} icon-name="cancel" interaction="ghost" aria-label="close"></nve-icon-button>` : ''}
    <slot></slot>`;
  }

  render() {
    return html`
    ${this.position
    ? html`<dialog class="popover" ${animationFade(this)}>${this.#popoverContent}</dialog>`
    : html`<div class="popover" ${animationFade(this)}>${this.#popoverContent}</div>`}
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }
}
