import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { animationFade, attachInternals, PopoverAlign, popoverBaseStyles, PopoverPosition, PopoverType, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './tooltip.css?inline';

/**
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
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-tooltip-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-29&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 * @performance false
 * @stable false
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

  static readonly metadata = {
    tag: 'mlv-tooltip',
    version: 'PACKAGE_VERSION'
  };

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
