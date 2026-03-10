import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { IconButton } from '@nvidia-elements/core/icon-button';
import type { PopoverAlign, PopoverPosition, PopoverType } from '@nvidia-elements/core/internal';
import {
  attachInternals,
  audit,
  excessiveInstanceLimit,
  I18nController,
  popoverStyles,
  TypeNativePopoverController,
  useStyles,
  appendRootNodeStyle,
  scopedRegistry
} from '@nvidia-elements/core/internal';
import styles from './toggletip.css?inline';
import globalStyles from './toggletip.global.css?inline';

/**
 * @element nve-toggletip
 * @description Generic toggletip element for rendering a variety of different interactive content. [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
 * @since 0.38.0
 * @entrypoint \@nvidia-elements/core/toggletip
 * @event beforetoggle - Dispatched on a popover just before showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event)
 * @event toggle - Dispatched on a popover element just after showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event)
 * @event open - Dispatched when the toggletip opens.
 * @event close - Dispatched when the toggletip closes.
 * @slot - default slot for toggletip content
 * @cssprop --arrow-transform
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --box-shadow
 * @cssprop --width
 * @cssprop --min-width
 * @cssprop --gap
 * @cssprop --animation-duration - Duration of toggletip open/close animations
 * @csspart icon-button - The close icon button element

 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 *
 */
@scopedRegistry()
@audit({ excessiveInstanceLimit })
export class Toggletip extends LitElement {
  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-toggletip',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
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
   * If an arrow exists the alginment will be relative to the arrow against the anchor.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign = 'center';

  /**
   * @deprecated Use the popover API instead.
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  /**
   * Determines if a close button should render within toggletip.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * Determines if the component renders an arrow.
   */
  @property({ type: Boolean }) arrow = true;

  @query('.arrow') popoverArrow: HTMLElement;

  /** @private */
  readonly popoverType: PopoverType = 'auto';

  protected typeNativePopoverController = new TypeNativePopoverController<Toggletip>(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Updates internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <div internal-host>
      <slot name="header"></slot>
      ${this.closable ? html`<nve-icon-button part="icon-button" exportparts="icon:icon-button-icon" @click=${this.hidePopover} icon-name="cancel" container="flat" size="sm" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
      <div id="content" part="_content">
        <slot></slot>
      </div>
      <slot name="footer"></slot>
    </div>
    ${this.arrow ? html`<div class="arrow"></div>` : ''}
  `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'toggletip';
    appendRootNodeStyle(this, globalStyles);
  }
}
