import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { animationSlide, I18nController, popoverBaseStyles, PopoverType, Size, TypePopoverController, useStyles } from '@elements/elements/internal';
import { IconButton } from '@elements/elements/icon-button';
import styles from './drawer.css?inline';

/**
 * @element mlv-drawer
 * @description Drawer are to display content that is out of context of the rest of the page (notifications, navigations, settings). Alternatively [Panel](./?path=/docs/elements-panel-documentation--docs) is inline as its content is coupled or closely related to the content on the page (details, additional actions/options).
 * @since 0.16.0
 * @event open - Dispatched when the drawer is opened.
 * @event close - Dispatched when the drawer is closed.
 * @slot default content slot
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --gap
 * @cssprop --max-width
 * @cssprop --min-height
 * @cssprop --mlv-sys-layer-popover-arrow-padding
 * @cssprop --mlv-sys-layer-popover-arrow-offset
 * @cssprop --mlv-sys-layer-popover-offset
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-drawer-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=4152%3A86953&mode=dev
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export class Drawer extends LitElement {
  /**
   * Sets the side position of the popover relative to the provided anchor element.
   * For drawer the anchor defaults to the document body.
   */
  @property({ type: String, reflect: true }) position: 'left' | 'right' = 'left';

  /**
   * Sets the maximum size of the drawer.
   */
  @property({ type: String, reflect: true }) size?: Size;

  /**
   * Determines if a close button should render within drawer. Non-closable
   * drawers can be used for drawers that require user confirmation steps.
   */
  @property({ type: Boolean }) closable: boolean;

  /**
   * Determines if a drawer should have a modal backdrop that visually overlays the UI.
   */
  @property({ type: Boolean, reflect: true }) modal: boolean;

  /**
   * The anchor provides the element that the popover should position relative to.
   * Anchor can accept a idref string within the same render root or a HTMLElement DOM reference.
   * Drawers should default to the document body.
   */
  @property({ type: String }) anchor: string | HTMLElement = globalThis.document.body;

  /**
   * The trigger defines what element triggers an `open` interaction event.
   * A trigger can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) trigger: string | HTMLElement;

  /**
   * Create a inline layout effect while retaining the a11y characteristics and top layer behavior (light dismiss, focus trap, non interactive background)
   * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
   */
  @property({ type: Boolean, reflect: true }) inline: boolean;

  /**
   * Determines if popover should be rendered and positioned.
   */
  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object, attribute: 'mlv-i18n' }) i18n = this.#i18nController.i18n;

  /** @private */
  get popoverType(): PopoverType {
    return this.modal ? 'auto' : 'manual';
  }

  /** @private */
  get popoverDismissible() {
    return !!this.closable;
  }

  #typePopoverController = new TypePopoverController<Drawer>(this);

  static styles = useStyles([popoverBaseStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-drawer',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-icon-button': IconButton
  }

  render() {
    return html`
    <dialog ${animationSlide(this)}>
      <div class="header">
        ${this.closable ? html`<mlv-icon-button @click=${() => this.#typePopoverController.close()} icon-name="cancel" .ariaLabel=${this.i18n.close} interaction="flat"></mlv-icon-button>` : ''}
        <slot name="header"></slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <div>
        <slot name="footer"></slot>
      </div>
    </dialog>
    `;
  }
}
