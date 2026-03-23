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
  useStyles
} from '@nvidia-elements/core/internal';
import styles from './tooltip.css?inline';

/**
 * @element nve-tooltip
 * @description A contextual popup that displays a plaintext description. Tooltips are [triggered](https://w3c.github.io/aria/#tooltip) by hovering, focusing, or tapping an element and cannot have interactive elements within them. [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/tooltip
 * @event beforetoggle - Dispatched on a popover just before showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event)
 * @event toggle - Dispatched on a popover element just after showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event)
 * @event open - Dispatched when the tooltip opens.
 * @event close - Dispatched when the tooltip closes.
 * @slot - default content slot
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --arrow-transform
 * @cssprop --width
 * @cssprop --height
 * @cssprop --border
 * @csspart arrow
 * @cssprop --animation-duration - Duration of tooltip open/close animations
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
   * (optional) By default the popover automatically anchors itself relative to the trigger element.
   * Pass an optional custom anchor element as an idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement;

  /**
   * @deprecated Use the popover API instead.
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
   * @deprecated Use the popover API instead.
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  /**
   * visual treatment to represent a ongoing task or support status
   */
  @property({ type: String, reflect: true }) status: 'muted';

  /**
   * @deprecated Use interest-delay-start css property instead
   */
  @property({ type: Number, attribute: 'open-delay' }) openDelay: number;

  @query('.arrow') popoverArrow: HTMLElement;

  /** @private */
  readonly popoverType: PopoverType = 'hint';

  protected typeNativePopoverController = new TypeNativePopoverController<Tooltip>(this);

  /** @private */
  declare _internals: ElementInternals;

  /* eslint-disable local/no-invalid-css-parts */
  render() {
    return html`
    <div internal-host>
      <slot></slot>
    </div>
    <div part="arrow" class="arrow"></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'tooltip';
  }
}
