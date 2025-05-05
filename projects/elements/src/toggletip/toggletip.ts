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
  TypeNativeAnchorController
} from '@nvidia-elements/core/internal';
import styles from './toggletip.css?inline';

/**
 * @element nve-toggletip
 * @description Generic toggletip element for rendering a variety of different content within a toggletip container.
 * @since 0.38.0
 * @entrypoint \@nvidia-elements/core/toggletip
 * @event open - Dispatched when the toggletip is opened.
 * @event close - Dispatched when the toggletip is closed.
 * @slot - default slot for toggletip content
 * @cssprop --arrow-transform
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @storybook https://NVIDIA.github.io/elements/docs/elements/toggletip/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 * @stable false
 */
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
   * If an arrow exists the alginment will be relative to the arrow against the anchor.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign = 'center';

  /**
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  /**
   * Determines if a close button should render within toggletip.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * Determines if an arrow should be rendered.
   */
  @property({ type: Boolean }) arrow = true;

  @query('.arrow') popoverArrow: HTMLElement;

  /** @private */
  readonly popoverType: PopoverType = 'auto';

  protected typeNativeAnchorController = new TypeNativeAnchorController<Toggletip>(this);

  protected typeNativePopoverController = new TypeNativePopoverController<Toggletip>(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <div internal-host>
      <slot name="header"></slot>
      ${this.closable ? html`<nve-icon-button @click=${this.hidePopover} icon-name="cancel" container="flat" size="sm" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
      <div id="content">
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
  }
}
