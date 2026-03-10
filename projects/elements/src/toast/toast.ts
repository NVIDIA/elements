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
  scopedRegistry,
  statusIcons,
  TypeNativePopoverController,
  useStyles
} from '@nvidia-elements/core/internal';
import { Icon, type IconName } from '@nvidia-elements/core/icon';
import styles from './toast.css?inline';

/**
 * @element nve-toast
 * @description A contextual popup that displays a status. Toasts are [triggered](https://w3c.github.io/aria/#tooltip) by clicking, focusing, or tapping an element and cannot have interactive elements within them. [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/toast
 * @event beforetoggle - Dispatched on a popover just before showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event)
 * @event toggle - Dispatched on a popover element just after showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event)
 * @event open - Dispatched when the toast opens.
 * @event close - Dispatched when the toast closes.
 * @slot - default content slot
 * @slot prefix - custom status icon slot
 * @cssprop --padding
 * @cssprop --justify-content
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --color
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --box-shadow
 * @cssprop --gap
 * @csspart prefix-icon - The prefix icon slot
 * @csspart icon-button - The close icon button element
 * @cssprop --animation-duration - Duration of toast open/close animations
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 */
@scopedRegistry()
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
   * Sets the visual prominence of the toast.
   */
  @property({ type: String, reflect: true }) prominence: 'muted';

  /**
   * @deprecated Use the popover API instead.
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  /**
   * Determines if a close button should render within toast.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * A delayed `close` event occurs after the provided millisecond value elapses.
   */
  @property({ type: Number, attribute: 'close-timeout' }) closeTimeout = 0;

  /**
   * visual treatment to represent a ongoing task or support status
   * deprecated Use 'prominence="muted"' instead of status="muted"
   */
  @property({ type: String, reflect: true }) status: SupportStatus | 'muted';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Updates internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** @private */
  readonly popoverType: PopoverType = 'manual';

  protected typeNativePopoverController = new TypeNativePopoverController<Toast>(this);

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <slot name="prefix">${this.status !== 'muted' ? html`<nve-icon part="prefix-icon" .name=${statusIcons[this.status] as IconName} .ariaLabel=${(this.i18n as Record<string, string>)[this.status] ?? this.i18n.information}></nve-icon>` : nothing}</slot>
        ${this.closable ? html`<nve-icon-button part="icon-button" exportparts="icon:icon-button-icon" @click=${this.hidePopover} icon-name="cancel" container="flat" .ariaLabel=${this.i18n.close}></nve-icon-button>` : nothing}
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
