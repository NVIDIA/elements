import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { PopoverAlign, PopoverPosition, PopoverType, Size } from '@nvidia-elements/core/internal';
import {
  audit,
  excessiveInstanceLimit,
  I18nController,
  popoverStyles,
  TypeNativeAnchorController,
  TypeNativePopoverController,
  useStyles,
  attachInternals
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './dialog.css?inline';

/**
 * @element nve-dialog
 * @description Dialog is a component that appears above main content. A modal dialog is used to display critical information that requires users attention. Use `hidden` to show or hide the dialog.
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/dialog
 * @event open - Dispatched when the dialog is opened.
 * @event close - Dispatched when the dialog is closed.
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
 * @storybook https://NVIDIA.github.io/elements/docs/elements/dialog/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-39&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
@audit({ excessiveInstanceLimit })
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
  @property({ type: String, reflect: true }) alignment: PopoverAlign = 'center';

  /**
   * Sets the maximum size of the dialog.
   */
  @property({ type: String, reflect: true }) size?: Size;

  /**
   * Determines if a close button should render within dialog. Non-closable
   * dialogs can be used for dialogs that require user confirmation steps.
   */
  @property({ type: Boolean }) closable: boolean;

  /**
   * Determines if a dialog should have a modal backdrop that visually overlays the UI.
   */
  @property({ type: Boolean, reflect: true }) modal: boolean;

  /**
   * The anchor provides the element that the popover should position relative to.
   * Anchor can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement = globalThis.document?.body;

  /**
   * The trigger defines what element triggers an `open` interaction event.
   * A trigger can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) trigger: string | HTMLElement;

  /**
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** @private */
  get popoverType(): PopoverType {
    return this.modal ? 'auto' : 'manual';
  }

  /** @private */
  get popoverDismissible() {
    return !!this.closable;
  }

  protected typeNativeAnchorController = new TypeNativeAnchorController<Dialog>(this);

  protected typeNativePopoverController = new TypeNativePopoverController<Dialog>(this);

  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-dialog',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <div internal-host>
      <div class="header">
        ${this.closable ? html`<nve-icon-button size="sm" @click=${this.hidePopover} icon-name="cancel" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
        <slot name="header"></slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <slot name="footer"></slot>
    </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'dialog';
  }
}
