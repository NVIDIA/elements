import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { IconButton } from '@nvidia-elements/core/icon-button';
import type { PopoverAlign, PopoverPosition, PopoverType } from '@nvidia-elements/core/internal';
import {
  audit,
  excessiveInstanceLimit,
  I18nController,
  popoverStyles,
  TypeNativeAnchorController,
  TypeNativePopoverController,
  useStyles
} from '@nvidia-elements/core/internal';
import styles from './dropdown.css?inline';

/**
 * @element nve-dropdown
 * @description Generic dropdown element for rendering a variety of different content such as interactive navigation or form controls. [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/dropdown
 * @event open - Dispatched when the dropdown is opened.
 * @event close - Dispatched when the dropdown is closed.
 * @slot - default slot for dropdown content
 * @cssprop --border
 * @cssprop --arrow-transform
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @storybook https://NVIDIA.github.io/elements/docs/elements/dropdown/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@audit({ excessiveInstanceLimit })
export class Dropdown extends LitElement {
  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-dropdown',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
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
  @property({ type: String, reflect: true }) position: PopoverPosition = 'bottom';

  /**
   * Sets the alignment of the popover relative to the provided anchor element.
   * If an arrow exists the alginment will be relative to the arrow against the anchor.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign = 'start';

  /**
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  /**
   * Determines if a close button should render within dropdown. Non-closable
   * dropdowns can be used for menu or selection patterns.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * Determines if an arrow should be rendered.
   */
  @property({ type: Boolean }) arrow = false;

  /** @private */
  @property({ type: Boolean, reflect: true }) modal = true;

  /** @private */
  @property({ type: String, attribute: 'popover-type' }) popoverType: PopoverType = 'auto';

  @query('.arrow') popoverArrow: HTMLElement;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  protected typeNativePopoverController = new TypeNativePopoverController<Dropdown>(this);

  protected typeNativeAnchorController = new TypeNativeAnchorController<Dropdown>(this);

  /** @private */
  get popoverDismissible() {
    return this.modal;
  }

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`
    <div internal-host>
      <slot name="header"></slot>
      ${this.closable ? html`<nve-icon-button @click=${this.hidePopover} icon-name="cancel" container="flat" size="sm" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
      <slot></slot>
      <slot name="footer"></slot>
      ${this.arrow ? html`<div class="arrow"></div>` : ''}
    </div>
  `;
  }
}
