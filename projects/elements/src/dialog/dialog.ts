import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { animationFade, I18nController, PopoverAlign, popoverBaseStyles, PopoverPosition, PopoverType, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './dialog.css?inline';
import { IconButton } from '../icon-button';

/**
 * @element nve-dialog
 * @event open
 * @event close
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
 * @cssprop --nve-sys-layer-popover-arrow-padding
 * @cssprop --nve-sys-layer-popover-arrow-offset
 * @cssprop --nve-sys-layer-popover-offset
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-dialog-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-39&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export class Dialog extends LitElement {
  /**
   * Sets the side position of the popover relative to the provided anchor element.
   * For dialog the anchor defaults to the document body.
   */
  @property({ type: String, reflect: true }) position: PopoverPosition = 'center';

  /**
   * Sets the alignment of the popover relative to the provided anchor element.
   * If an arrow exists the alginment will be relative to the arrow against the anchor.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  /**
   * Sets the maximum size of the dialog.
   */
  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Determines if a close button should render within dialog. Non-closable
   * dialogs can be used for dialogs that require user confirmation steps.
   */
  @property({ type: Boolean }) closable: boolean;

  /**
   * Determines if a dialog should have a modal backdrop that visually overlays the UI.
   */
  @property({ type: Boolean }) modal: boolean;

  /**
   * The anchor provides the element that the popover should position relative to.
   * Anchor can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement = document.body;

  /**
   * The trigger defines what element triggers an `open` interaction event.
   * A trigger can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) trigger: string | HTMLElement;

  /**
   * Determines if popover should be rendered and positioned.
   */
  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;

  /** @private */
  get popoverType(): PopoverType {
    return this.modal ? 'auto' : 'manual';
  }

  /** @private */
  get popoverDismissible() {
    return !!this.closable;
  }

  #typePopoverController = new TypePopoverController<Dialog>(this);

  static styles = useStyles([popoverBaseStyles, styles]);

  static readonly metadata = {
    tag: 'nve-dialog',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon-button': IconButton
  }

  render() {
    return html`
    <dialog ${animationFade(this)}>
      <div class="header">
        ${this.closable ? html`<nve-icon-button @click=${() => this.#typePopoverController.close()} icon-name="cancel" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
        <slot name="header"></slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <slot name="footer"></slot>
    </dialog>
    `;
  }
}
