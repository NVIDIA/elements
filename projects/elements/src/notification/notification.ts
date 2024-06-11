import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@nvidia-elements/core/icon';
import { IconButton } from '@nvidia-elements/core/icon-button';
import {
  animationFade,
  attachInternals,
  PopoverAlign,
  popoverBaseStyles,
  PopoverType,
  SupportStatus,
  statusIcons,
  TypePopoverController,
  useStyles,
  I18nController,
  PopoverPosition
} from '@nvidia-elements/core/internal';
import styles from './notification.css?inline';

/**
 * @element mlv-notification
 * @description Displays real time updates without interrupting the user's workflow to communicate an important message or status.
 * @since 0.6.0
 * @event open - Dispatched when the notification is opened.
 * @event close - Dispatched when the notification is closed.
 * @slot default content slot
 * @cssprop --border-radius
 * @cssprop --status-color
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --box-shadow
 * @cssprop --min-width
 * @cssprop --width
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-notification-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=2876-64384&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
 */
export class Notification extends LitElement {
  /**
   * The anchor provides the element that the popover should position relative to.
   * Anchor can accept a idref string within the same render root or a HTMLElement DOM reference.
   */
  @property({ type: String }) anchor: string | HTMLElement = globalThis.document.body;

  /**
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
   * Determines if popover should be rendered and positioned.
   */
  @property({ type: Boolean, reflect: true }) hidden = false; /* needed for @lit-labs/motion */

  /**
   * Determines the visual status of the notification.
   */
  @property({ type: String, reflect: true }) status: SupportStatus;

  /**
   * Flat container option is used when embeding within another containing element such as a drawer.
   */
  @property({ type: String, reflect: true }) container?: 'flat';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  protected typePopoverController = new TypePopoverController<Notification>(this);

  /** @private */
  get popoverType(): PopoverType {
    return 'manual';
  }

  /** @private */
  declare _internals: ElementInternals;

  get #popoverContent() {
    return html`
    <nve-icon .name=${statusIcons[this.status]} .ariaLabel=${this.i18n[this.status] ?? this.i18n.information} part="status-icon"></nve-icon>
    ${this.closable ? html`<nve-icon-button @click=${() => this.typePopoverController.close()} icon-name="cancel" size="sm" container="flat" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
    <slot></slot>`;
  }

  static styles = useStyles([popoverBaseStyles, styles]);

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
    ${
      this.position
        ? html`<dialog class="popover" ${animationFade(this, { onComplete: () => this.#complete() })}>${this.#popoverContent}</dialog>`
        : html`<div class="popover" ${animationFade(this, { onComplete: () => this.#complete() })}>${this.#popoverContent}</div>`
    }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }

  async remove() {
    this.shadowRoot.addEventListener(
      'nve-animation-complete',
      () => {
        super.remove();
      },
      { once: true }
    );
    this.hidden = true;
  }

  #complete() {
    this.shadowRoot.dispatchEvent(new CustomEvent('nve-animation-complete'));
  }
}
