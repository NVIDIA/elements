import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { animationFade, attachInternals, PopoverAlign, popoverBaseStyles, PopoverPosition, PopoverType, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './tooltip.css?inline';

/**
 * @alpha
 * @element mlv-tooltip
 * @event open
 * @event close
 * @slot default content slot
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --font-size
 * @cssprop --arrow-transform
 * @cssprop --mlv-sys-layer-popover-arrow-padding
 * @cssprop --mlv-sys-layer-popover-arrow-offset
 * @cssprop --mlv-sys-layer-popover-offset
 */
export class Tooltip extends LitElement {
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
  @property({ type: String, reflect: true }) position: PopoverPosition = 'top';

  /**
   * Sets the alignment of the popover relative to the provided anchor element.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  /**
   * Determines if popover should be rendered and positioned.
   */
  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  @query('.arrow') popoverArrow: HTMLElement;

  static styles = useStyles([popoverBaseStyles, styles]);

  /** @private */
  readonly popoverType: PopoverType = 'hint';

  protected typePopoverController = new TypePopoverController<Tooltip>(this);

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <dialog ${animationFade(this)}>
      <slot></slot>
      <div class="arrow"></div>
    </dialog>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'tooltip';
  }
}
