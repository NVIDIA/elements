import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { IconButton } from '@elements/elements/icon-button';
import { animationFade, attachInternals, I18nController, PopoverAlign, popoverBaseStyles, PopoverPosition, PopoverType, statusIcons, SupportStatus, TypePopoverController, useStyles } from '@elements/elements/internal';
import type { IconName } from '@elements/elements/icon';
import styles from './toast.css?inline';

/**
 * @element mlv-toast
 * @description A contextual popup that displays a status. Toasts are [triggered](https://w3c.github.io/aria/#tooltip) by clicking, focusing, or tapping an element and cannot have interactive elements within them.
 * @since 0.6.0
 * @event open
 * @event close
 * @slot default content slot
 * @cssprop --padding
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --font-size
 * @cssprop --box-shadow
 * @cssprop --gap
 * @cssprop --mlv-sys-layer-popover-arrow-offset
 * @cssprop --mlv-sys-layer-popover-offset
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-input-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=596-34431&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 */
export class Toast extends LitElement {
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
   * Determines if a close button should render within toast.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * A delayed `close` event will occur determined from the provided millisecond value.
   */
  @property({ type: Number, attribute: 'close-timeout' }) closeTimeout = 0;

  /**
   * Determines if popover should be rendered and positioned.
   */
  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  /**
   * visual treatment to represent a ongoing task or support status
   */
  @property({ type: String, reflect: true }) status: SupportStatus | 'muted';

  /** @private */
  readonly popoverType: PopoverType = 'manual';

  #typePopoverController = new TypePopoverController<Toast>(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'mlv-i18n' }) i18n = this.#i18nController.i18n;

  /** @private */
  declare _internals: ElementInternals;

  static styles = useStyles([popoverBaseStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-toast',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-icon-button': IconButton
  }

  render() {
    return html`
      <dialog ${animationFade(this)}>
        <slot name="prefix">${this.status !== 'muted' ? html`<mlv-icon .name=${(statusIcons[this.status] as IconName)} .ariaLabel=${this.i18n[this.status] ?? this.i18n.information}></mlv-icon>` : nothing}</slot>
        ${this.closable ? html`<mlv-icon-button @click=${() => this.#typePopoverController.close()} icon-name="cancel" interaction="flat" .ariaLabel=${this.i18n.close}></mlv-icon-button>` : nothing}
        <slot></slot>
      </dialog>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }
}
