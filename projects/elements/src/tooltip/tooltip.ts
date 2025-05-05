import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import type { PopoverAlign, PopoverPosition, PopoverType } from '@nvidia-elements/core/internal';
import {
  attachInternals,
  audit,
  excessiveInstanceLimit,
  popoverStyles,
  TypeNativePopoverController,
  TypeNativeAnchorController,
  useStyles
} from '@nvidia-elements/core/internal';
import styles from './tooltip.css?inline';

/**
 * @element nve-tooltip
 * @description A contextual popup that displays a description for an element. Tooltips are [triggered](https://w3c.github.io/aria/#tooltip) by hovering, focusing, or tapping an element and cannot have interactive elements within them.
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/tooltip
 * @event open - Dispatched when the tooltip is opened.
 * @event close - Dispatched when the tooltip is closed.
 * @slot default content slot
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --font-size
 * @cssprop --arrow-transform
 * @storybook https://NVIDIA.github.io/elements/docs/elements/tooltip/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-29&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 */
@audit({ excessiveInstanceLimit })
export class Tooltip extends LitElement {
  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-tooltip',
    version: '0.0.0'
  };

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
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  /**
   * visual treatment to represent a ongoing task or support status
   */
  @property({ type: String, reflect: true }) status: 'muted';

  /**
   * A delayed `open` event will occur determined from the provided millisecond value.
   */
  @property({ type: Number, attribute: 'open-delay' }) openDelay = 0;

  @query('.arrow') popoverArrow: HTMLElement;

  /** @private */
  readonly popoverType: PopoverType = 'hint';

  protected typeNativePopoverController = new TypeNativePopoverController<Tooltip>(this);

  protected typeNativeAnchorController = new TypeNativeAnchorController<Tooltip>(this);

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <div internal-host>
      <slot></slot>
    </div>
    <div class="arrow"></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'tooltip';
  }
}
