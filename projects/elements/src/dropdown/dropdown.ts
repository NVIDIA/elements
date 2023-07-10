import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { IconButton } from '@elements/elements/icon-button';
import { animationFade, I18nController, PopoverAlign, popoverBaseStyles, PopoverPosition, PopoverType, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './dropdown.css?inline';

/**
 * @element nve-dropdown
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
 * @cssprop --nve-sys-layer-popover-arrow-padding
 * @cssprop --nve-sys-layer-popover-arrow-offset
 * @cssprop --nve-sys-layer-popover-offset
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-dropdown-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
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

  /** @private */
  readonly popoverType: PopoverType = 'auto';

  #typePopoverController = new TypePopoverController<Dropdown>(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;

  static styles = useStyles([popoverBaseStyles, styles]);

  static readonly metadata = {
    tag: 'nve-dropdown',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon-button': IconButton
  }

  render() {
    return html`
      <dialog ${animationFade(this)}>
        ${this.closable ? html`<nve-icon-button @click=${() => this.#typePopoverController.close()} icon-name="cancel" interaction="falt" size="sm" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
        <slot></slot>
        ${this.arrow ? html`<div class="arrow"></div>` : ''}
      </dialog>
    `;
  }
}
