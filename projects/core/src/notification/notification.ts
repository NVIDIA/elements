import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@nvidia-elements/core/icon';
import { IconButton } from '@nvidia-elements/core/icon-button';
import type { PopoverAlign, PopoverType, SupportStatus, PopoverPosition } from '@nvidia-elements/core/internal';
import {
  attachInternals,
  popoverStyles,
  statusIcons,
  useStyles,
  I18nController,
  TypeNativePopoverController,
  scopedRegistry
} from '@nvidia-elements/core/internal';
import styles from './notification.css?inline';

/**
 * @element nve-notification
 * @description Displays real time updates without interrupting the user's workflow to communicate an important message or status. [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/notification
 * @event beforetoggle - Dispatched on a popover just before showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event)
 * @event toggle - Dispatched on a popover element just after showing or hiding. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event)
 * @event open - Dispatched when the notification opens.
 * @event close - Dispatched when the notification closes.
 * @slot - default content slot
 * @slot icon - content slot for the status icon
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --min-width
 * @cssprop --width
 * @cssprop --max-width
 * @cssprop --border
 * @cssprop --status-border
 * @cssprop --gap
 * @cssprop --status-color
 * @cssprop --animation-duration - Duration of notification open/close animations
 * @csspart status-icon - The status icon element
 * @csspart icon-button - The close icon button element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
 */
@scopedRegistry()
export class Notification extends LitElement {
  /**
   * (optional) By default the popover will automatically anchor itself relative to the trigger element.
   * Pass an optional custom anchor element as an idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement = globalThis.document?.body;

  /**
   * @deprecated Use the popover API instead.
   * The trigger defines what element triggers an `open` interaction event.
   * A trigger can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) trigger: string | HTMLElement;

  /**
   * Sets the side position of the popover relative to the provided anchor element.
   */
  @property({ type: String, reflect: true }) position: PopoverPosition;

  /**
   * Sets the alignment of the popover relative to the provided anchor element.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  /**
   * @deprecated Use the popover API instead.
   * Determines if popover visibility behavior should be automatically controlled by the trigger.
   */
  @property({ type: Boolean, reflect: true, attribute: 'behavior-trigger' }) behaviorTrigger: boolean;

  /**
   * Determines if a close button should render within notification.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * A delayed `close` event will occur determined from the provided millisecond value.
   */
  @property({ type: Number, attribute: 'close-timeout' }) closeTimeout = 0;

  /**
   * Determines the visual status of the notification.
   */
  @property({ type: String, reflect: true }) status: SupportStatus;

  /**
   * Flat container option applies when embedding within another containing element such as a drawer.
   */
  @property({ type: String, reflect: true }) container?: 'flat';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables updating internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /**
   * @private
   */
  @property({ type: Boolean }) inline = false;

  /** @private */
  get popoverType(): PopoverType {
    return 'manual';
  }

  /** @private */
  get popoverInline() {
    return this.parentElement?.localName === 'nve-notification-group' || this.inline || this.container === 'flat';
  }

  /** @private */
  declare _internals: ElementInternals;

  protected typeNativePopoverController: TypeNativePopoverController<Notification>;

  get #popoverContent() {
    return html`
    <slot name="icon"><nve-icon .name=${statusIcons[this.status]} .ariaLabel=${(this.status ? (this.i18n as Record<string, string>)[this.status] : undefined) ?? this.i18n.information} part="status-icon"></nve-icon></slot>
    ${this.closable ? html`<nve-icon-button part="icon-button" @click=${this.hidePopover} icon-name="cancel" size="sm" container="flat" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
    <slot></slot>`;
  }

  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-notification',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon,
    [IconButton.metadata.tag]: IconButton
  };

  render() {
    return html`
    <div internal-host>
      ${this.#popoverContent}
    </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);

    if (!this.popoverInline) {
      this.typeNativePopoverController = new TypeNativePopoverController<Notification>(this);
    } else {
      this.setAttribute('nve-popover', '');
    }
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#setupCloseTimeout();
  }

  hidePopover(): void {
    if (this.popoverInline) {
      this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    } else {
      super.hidePopover();
    }
  }

  /**
   * The popover controller provides this functionality.
   * But when the notification is in inline mode the
   * controller does not run so this sets it up directly.
   */
  #setupCloseTimeout() {
    if (this.popoverInline && this.closeTimeout && !this.hidden) {
      setTimeout(() => this.hidePopover(), this.closeTimeout);
    }
  }
}
