import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { IconButton } from '@nvidia-elements/core/icon-button';
import type { PopoverAlign, PopoverPosition, PopoverType, SupportStatus } from '@nvidia-elements/core/internal';
import {
  attachInternals,
  audit,
  excessiveInstanceLimit,
  I18nController,
  popoverStyles,
  statusIcons,
  TypeNativeAnchorController,
  TypeNativePopoverController,
  useStyles
} from '@nvidia-elements/core/internal';
import { Icon, type IconName } from '@nvidia-elements/core/icon';
import styles from './toast.css?inline';

/**
 * @element nve-toast
 * @description A contextual popup that displays a status. Toasts are [triggered](https://w3c.github.io/aria/#tooltip) by clicking, focusing, or tapping an element and cannot have interactive elements within them.
 * @since 0.6.0
 * @event open - Dispatched when the toast is opened.
 * @event close - Dispatched when the toast is closed.
 * @slot default content slot
 * @slot prefix - custom status icon slot
 * @cssprop --padding
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --font-size
 * @cssprop --box-shadow
 * @cssprop --gap
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-input-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=596-34431&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 */
@audit({ excessiveInstanceLimit })
export class Toast extends LitElement {
  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-toast',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton,
    [Icon.metadata.tag]: Icon
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
   * Determines if a close button should render within toast.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * A delayed `close` event will occur determined from the provided millisecond value.
   */
  @property({ type: Number, attribute: 'close-timeout' }) closeTimeout = 0;

  /**
   * visual treatment to represent a ongoing task or support status
   */
  @property({ type: String, reflect: true }) status: SupportStatus | 'muted';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** @private */
  readonly popoverType: PopoverType = 'manual';

  protected typeNativeAnchorController = new TypeNativeAnchorController<Toast>(this);

  protected typeNativePopoverController = new TypeNativePopoverController<Toast>(this);

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <slot name="prefix">${this.status !== 'muted' ? html`<nve-icon .name=${statusIcons[this.status] as IconName} .ariaLabel=${this.i18n[this.status] ?? this.i18n.information}></nve-icon>` : nothing}</slot>
        ${this.closable ? html`<nve-icon-button @click=${this.hidePopover} icon-name="cancel" container="flat" .ariaLabel=${this.i18n.close}></nve-icon-button>` : nothing}
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }
}
